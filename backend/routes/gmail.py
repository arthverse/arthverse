"""
Gmail OAuth Integration Routes
Requires GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env
"""
from fastapi import APIRouter, Depends, Query
from fastapi.security import HTTPAuthorizationCredentials
from fastapi.responses import RedirectResponse
from routes.deps import security, verify_token, get_db, HTTPException
from datetime import datetime, timezone
import os
import warnings
import logging
import base64

# Relax OAuth scope validation — Google sometimes returns scopes in different order,
# and we handle scope-denial explicitly via API response when Gmail access is actually called.
os.environ.setdefault('OAUTHLIB_RELAX_TOKEN_SCOPE', '1')

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/gmail", tags=["gmail"])

GOOGLE_CLIENT_ID = os.environ.get('GOOGLE_CLIENT_ID', '')
GOOGLE_CLIENT_SECRET = os.environ.get('GOOGLE_CLIENT_SECRET', '')
REDIRECT_URI = os.environ.get('REACT_APP_BACKEND_URL', '') + '/api/gmail/callback'

SCOPES = [
    "https://www.googleapis.com/auth/gmail.readonly",
    "openid",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/userinfo.profile"
]


def get_client_config():
    return {
        "web": {
            "client_id": GOOGLE_CLIENT_ID,
            "client_secret": GOOGLE_CLIENT_SECRET,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
        }
    }


@router.get("/status")
async def gmail_status(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Check if Gmail is configured and user is connected."""
    db = get_db()
    user_id = await verify_token(credentials)

    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        return {"configured": False, "connected": False, "message": "Gmail API credentials not configured. Please add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to backend .env"}

    token = await db.gmail_tokens.find_one({"user_id": user_id}, {"_id": 0})
    return {
        "configured": True,
        "connected": token is not None and token.get("access_token") is not None,
        "email": token.get("email") if token else None,
    }


@router.get("/connect")
async def connect_gmail(token: str = Query(...)):
    """Start Gmail OAuth flow. Auth is via JWT token in query string (since OAuth redirect can't carry headers)."""
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=503, detail="Gmail API not configured")

    # Verify the JWT token and extract the real user_id (never trust client-supplied IDs)
    import jwt as jwt_lib
    JWT_SECRET = os.environ.get('JWT_SECRET', '')
    try:
        payload = jwt_lib.decode(token, JWT_SECRET, algorithms=['HS256'])
        user_id = payload.get('user_id')
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token")
    except jwt_lib.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    try:
        from google_auth_oauthlib.flow import Flow
        flow = Flow.from_client_config(get_client_config(), scopes=SCOPES, redirect_uri=REDIRECT_URI)
        url, state = flow.authorization_url(access_type='offline', prompt='consent')

        db = get_db()
        await db.gmail_states.insert_one({
            "state": state,
            "user_id": user_id,
            "code_verifier": flow.code_verifier,
            "created_at": datetime.now(timezone.utc).isoformat(),
        })

        return RedirectResponse(url)
    except Exception as e:
        logger.error(f"Gmail OAuth error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/callback")
async def gmail_callback(code: str = Query(...), state: str = Query(...)):
    """Handle Gmail OAuth callback."""
    db = get_db()

    state_doc = await db.gmail_states.find_one({"state": state})
    if not state_doc:
        raise HTTPException(status_code=400, detail="Invalid or expired state")

    user_id = state_doc["user_id"]
    code_verifier = state_doc.get("code_verifier")
    await db.gmail_states.delete_one({"state": state})

    try:
        from google_auth_oauthlib.flow import Flow
        flow = Flow.from_client_config(get_client_config(), scopes=SCOPES, redirect_uri=REDIRECT_URI)
        # Restore the PKCE code_verifier from the original /connect request
        if code_verifier:
            flow.code_verifier = code_verifier

        with warnings.catch_warnings():
            warnings.simplefilter("ignore")
            flow.fetch_token(code=code)

        creds = flow.credentials

        # Get user email
        from googleapiclient.discovery import build
        service = build('oauth2', 'v2', credentials=creds)
        user_info = service.userinfo().get().execute()

        await db.gmail_tokens.update_one(
            {"user_id": user_id},
            {"$set": {
                "user_id": user_id,
                "access_token": creds.token,
                "refresh_token": creds.refresh_token,
                "token_uri": creds.token_uri,
                "client_id": creds.client_id,
                "client_secret": creds.client_secret,
                "expires_at": creds.expiry.isoformat() if creds.expiry else None,
                "email": user_info.get("email"),
                "connected_at": datetime.now(timezone.utc).isoformat(),
            }},
            upsert=True
        )

        frontend_url = os.environ.get('REACT_APP_BACKEND_URL', '').replace('/api', '').rstrip('/')
        return RedirectResponse(f"{frontend_url}/arthvyay/dashboard?gmail=connected")
    except Exception as e:
        logger.error(f"Gmail callback error: {e}")
        frontend_url = os.environ.get('REACT_APP_BACKEND_URL', '').replace('/api', '').rstrip('/')
        return RedirectResponse(f"{frontend_url}/arthvyay/dashboard?gmail=error")


@router.get("/disconnect")
async def disconnect_gmail(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Disconnect Gmail account."""
    db = get_db()
    user_id = await verify_token(credentials)
    await db.gmail_tokens.delete_one({"user_id": user_id})
    return {"message": "Gmail disconnected"}


async def _get_gmail_creds(user_id: str):
    """Get valid Gmail credentials for a user, refreshing if needed."""
    from google.oauth2.credentials import Credentials
    from google.auth.transport.requests import Request

    db = get_db()
    token = await db.gmail_tokens.find_one({"user_id": user_id}, {"_id": 0})
    if not token or not token.get("access_token"):
        return None

    creds = Credentials(
        token=token["access_token"],
        refresh_token=token.get("refresh_token"),
        token_uri=token.get("token_uri", "https://oauth2.googleapis.com/token"),
        client_id=token.get("client_id", GOOGLE_CLIENT_ID),
        client_secret=token.get("client_secret", GOOGLE_CLIENT_SECRET),
    )

    if creds.expired and creds.refresh_token:
        creds.refresh(Request())
        await db.gmail_tokens.update_one(
            {"user_id": user_id},
            {"$set": {"access_token": creds.token, "expires_at": creds.expiry.isoformat() if creds.expiry else None}}
        )

    return creds


@router.get("/emails")
async def get_financial_emails(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    max_results: int = Query(20, ge=1, le=50),
):
    """Fetch financial emails from Gmail using search queries."""
    db = get_db()
    user_id = await verify_token(credentials)

    creds = await _get_gmail_creds(user_id)
    if not creds:
        raise HTTPException(status_code=403, detail="Gmail not connected. Please connect your Gmail first.")

    try:
        from googleapiclient.discovery import build
        service = build('gmail', 'v1', credentials=creds)

        # Search for financial emails (365-day window, broad financial senders incl. credit card)
        query = ('(subject:statement OR subject:policy OR subject:investment OR subject:SIP '
                 'OR subject:premium OR subject:renewal OR subject:insurance OR subject:EMI '
                 'OR subject:credit OR subject:debit OR subject:CAS OR subject:"consolidated account" '
                 'OR subject:portfolio OR subject:holdings OR subject:"demat statement" '
                 'OR subject:"credit card statement" OR subject:"card statement" '
                 'OR subject:"your statement" OR subject:bill OR subject:"payment due" '
                 'OR from:cams.com OR from:karvy.com OR from:kfintech.com '
                 'OR from:cdslindia.com OR from:nsdl.co.in '
                 'OR from:noreply@hdfcbank OR from:alerts@icicibank '
                 'OR from:sbicard.com OR from:axisbank.com OR from:americanexpress '
                 'OR from:hdfcbank.net) newer_than:365d')
        result = service.users().messages().list(userId='me', q=query, maxResults=max_results).execute()
        messages = result.get('messages', [])

        emails = []
        for msg_ref in messages[:max_results]:
            msg = service.users().messages().get(userId='me', id=msg_ref['id'], format='full').execute()
            headers = {h['name']: h['value'] for h in msg.get('payload', {}).get('headers', [])}

            # Extract body
            body_text = ''
            attachments = []
            payload = msg.get('payload', {})
            if payload.get('body', {}).get('data'):
                body_text = base64.urlsafe_b64decode(payload['body']['data']).decode('utf-8', errors='ignore')

            # Walk all parts recursively to find text + PDF attachments
            def _walk_parts(parts):
                nonlocal body_text
                for part in parts or []:
                    mime = part.get('mimeType', '')
                    filename = part.get('filename', '')
                    body = part.get('body', {})
                    if mime == 'text/plain' and body.get('data') and not body_text:
                        body_text = base64.urlsafe_b64decode(body['data']).decode('utf-8', errors='ignore')
                    elif filename and filename.lower().endswith('.pdf') and body.get('attachmentId'):
                        fn_lower = filename.lower()
                        attachments.append({
                            "attachment_id": body['attachmentId'],
                            "filename": filename,
                            "size": body.get('size', 0),
                            "looks_like_cas": any(k in fn_lower for k in ['cas', 'consolidated', 'cams', 'karvy', 'statement', 'portfolio', 'holdings', 'credit', 'card', 'bill']),
                        })
                    if part.get('parts'):
                        _walk_parts(part['parts'])

            _walk_parts(payload.get('parts', []))

            emails.append({
                "id": msg_ref['id'],
                "subject": headers.get('Subject', ''),
                "from": headers.get('From', ''),
                "date": headers.get('Date', ''),
                "snippet": msg.get('snippet', ''),
                "body_preview": body_text[:500] if body_text else '',
                "attachments": attachments,
            })

        return {"emails": emails, "total": len(emails)}
    except Exception as e:
        logger.error(f"Gmail fetch error: {e}")
        if "invalid_grant" in str(e).lower() or "401" in str(e):
            await db.gmail_tokens.delete_one({"user_id": user_id})
            raise HTTPException(status_code=401, detail="Gmail session expired. Please reconnect.")
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/parse-attachment")
async def parse_gmail_attachment(
    body: dict,
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    """Download a PDF attachment from Gmail, extract text (handling password-protected CAS),
    run through GPT-5.2 CAS parser, and optionally auto-apply the results.

    Body: {email_id, attachment_id, filename?, password?, auto_apply?: bool}
    """
    from services.pdf_attachment_parser import extract_pdf_text, parse_cas_pdf, cas_to_questionnaire_updates
    from routes.documents import apply_parsed_data
    from datetime import datetime as dt
    import uuid

    db = get_db()
    user_id = await verify_token(credentials)

    email_id = body.get("email_id")
    attachment_id = body.get("attachment_id")
    password = body.get("password")
    auto_apply = bool(body.get("auto_apply", True))

    if not email_id or not attachment_id:
        raise HTTPException(status_code=400, detail="email_id and attachment_id are required")

    creds = await _get_gmail_creds(user_id)
    if not creds:
        raise HTTPException(status_code=403, detail="Gmail not connected")

    # Download attachment
    try:
        from googleapiclient.discovery import build
        service = build('gmail', 'v1', credentials=creds)
        att = service.users().messages().attachments().get(
            userId='me', messageId=email_id, id=attachment_id
        ).execute()
        pdf_bytes = base64.urlsafe_b64decode(att['data'])
    except Exception as e:
        logger.error(f"Attachment download failed: {e}")
        raise HTTPException(status_code=500, detail=f"Download failed: {e}")

    # Auto-try user's PAN as password if none was provided (common for Zerodha/CAS/CC statements)
    auto_tried = False
    if not password:
        user = await db.users.find_one({"id": user_id}, {"_id": 0, "pan_number": 1})
        user_pan = (user or {}).get("pan_number", "").strip().upper()
        if user_pan and len(user_pan) == 10:
            try:
                pdf_text_try, was_encrypted_try = extract_pdf_text(pdf_bytes, password=user_pan)
                if pdf_text_try:
                    # PAN worked!
                    password = user_pan
                    auto_tried = True
            except ValueError:
                # PAN was tried but is wrong — signal to UI so it can show helpful message
                auto_tried = True
            except Exception:
                pass

    # Extract text (may be password-protected)
    try:
        pdf_text, was_encrypted = extract_pdf_text(pdf_bytes, password=password)
    except ValueError as e:
        # Incorrect password
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        logger.error(f"PDF extract failed: {e}")
        raise HTTPException(status_code=500, detail=f"Could not read PDF: {e}")

    if was_encrypted and not pdf_text:
        return {
            "success": False,
            "password_required": True,
            "tried_your_pan": auto_tried,
            "message": ("We tried your saved PAN but it didn't work — try entering the password manually. "
                        "This may be a family member's PAN, or it might need PAN + DDMMYYYY (date of birth)."
                        if auto_tried else
                        "This PDF is password-protected. For CAS / credit card / Zerodha files, the password is usually your PAN (uppercase) or PAN + DOB (DDMMYYYY).")
        }

    # Parse via GPT-5.2
    parsed = await parse_cas_pdf(pdf_text)
    if not parsed.get("success"):
        return parsed

    data = parsed["data"]

    result = {
        "success": True,
        "data": data,
        "applied": False,
    }

    # Auto-apply to questionnaire + save transactions
    if auto_apply:
        # Map CAS totals to questionnaire fields
        update_fields = cas_to_questionnaire_updates(data)
        if update_fields:
            await db.questionnaires.update_one(
                {"user_id": user_id},
                {"$set": update_fields, "$setOnInsert": {"user_id": user_id, "created_at": datetime.now(timezone.utc).isoformat()}},
                upsert=True
            )

        # Save transactions (via shared helper so percentile delta works)
        txns = data.get("transactions") or []
        apply_actions = None
        if txns:
            apply_actions = await apply_parsed_data(
                db, user_id,
                {"transactions": txns},
                source="cas_pdf",
                track_percentile=False,
            )

        # Compute percentile delta for the whole operation
        percentile_change = None
        try:
            from services.peer_comparison import compare_with_peers
            user = await db.users.find_one({"id": user_id}, {"_id": 0})
            new_q = await db.questionnaires.find_one({"user_id": user_id}, {"_id": 0})
            if user and new_q and update_fields:
                post = compare_with_peers(new_q, user.get("age", 30))
                percentile_change = {
                    "after": post["overall_percentile"],
                    "cohort_description": post["cohort"]["description"],
                }
        except Exception:
            pass

        result["applied"] = True
        result["applied_fields"] = list(update_fields.keys())
        result["transactions_saved"] = (apply_actions or {}).get("transactions_saved", 0)
        if percentile_change:
            result["percentile_after"] = percentile_change

        # Persist parsed CAS for history
        await db.parsed_cas_statements.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "email_id": email_id,
            "attachment_id": attachment_id,
            "filename": body.get("filename", ""),
            "parsed_at": datetime.now(timezone.utc).isoformat(),
            "document_type": data.get("document_type"),
            "totals": data.get("totals"),
            "holdings_count": len(data.get("mutual_funds") or []) + len(data.get("equity_holdings") or []),
        })

    return result


@router.post("/parse-email/{email_id}")
async def parse_gmail_email(
    email_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    """Fetch a specific Gmail email and parse it with AI."""
    from services.document_parser import parse_email_text

    db = get_db()
    user_id = await verify_token(credentials)

    creds = await _get_gmail_creds(user_id)
    if not creds:
        raise HTTPException(status_code=403, detail="Gmail not connected")

    try:
        from googleapiclient.discovery import build
        service = build('gmail', 'v1', credentials=creds)
        msg = service.users().messages().get(userId='me', id=email_id, format='full').execute()

        # Extract full body
        body_text = ''
        payload = msg.get('payload', {})
        if payload.get('body', {}).get('data'):
            body_text = base64.urlsafe_b64decode(payload['body']['data']).decode('utf-8', errors='ignore')
        elif payload.get('parts'):
            for part in payload['parts']:
                if part.get('mimeType') == 'text/plain' and part.get('body', {}).get('data'):
                    body_text = base64.urlsafe_b64decode(part['body']['data']).decode('utf-8', errors='ignore')
                    break

        headers = {h['name']: h['value'] for h in payload.get('headers', [])}
        full_text = f"From: {headers.get('From', '')}\nSubject: {headers.get('Subject', '')}\nDate: {headers.get('Date', '')}\n\n{body_text}"

        result = await parse_email_text(full_text)

        # Mark as parsed in inbox queue
        await db.gmail_inbox.update_one(
            {"user_id": user_id, "email_id": email_id},
            {"$set": {"parsed": True, "parsed_at": datetime.now(timezone.utc).isoformat(),
                      "parsed_data": result.get("data")}}
        )

        return result
    except Exception as e:
        logger.error(f"Gmail parse error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/inbox")
async def get_inbox_queue(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    unparsed_only: bool = Query(True),
):
    """Get the auto-scanned Gmail inbox queue for this user."""
    db = get_db()
    user_id = await verify_token(credentials)

    query = {"user_id": user_id}
    if unparsed_only:
        query["parsed"] = False

    emails = await db.gmail_inbox.find(query, {"_id": 0}).sort("queued_at", -1).limit(100).to_list(100)
    unparsed_count = await db.gmail_inbox.count_documents({"user_id": user_id, "parsed": False})

    token_doc = await db.gmail_tokens.find_one({"user_id": user_id}, {"_id": 0})
    last_scanned = token_doc.get("last_scanned_at") if token_doc else None

    return {
        "emails": emails,
        "unparsed_count": unparsed_count,
        "last_scanned": last_scanned,
    }


@router.post("/refresh")
async def refresh_gmail_scan(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Manually trigger a Gmail scan for the current user (same logic as auto-scan)."""
    from services.gmail_auto_scan import scan_user_gmail

    db = get_db()
    user_id = await verify_token(credentials)

    creds = await _get_gmail_creds(user_id)
    if not creds:
        raise HTTPException(status_code=403, detail="Gmail not connected")

    result = await scan_user_gmail(db, user_id)
    return result


@router.post("/scan-and-apply-all")
async def scan_and_apply_all(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    max_emails: int = Query(20, ge=1, le=50),
):
    """Mega-button: refresh inbox, parse every unparsed financial email with GPT-5.2,
    and auto-apply each extraction. Returns aggregate summary."""
    from services.gmail_auto_scan import scan_user_gmail
    from services.document_parser import parse_email_text
    from routes.documents import apply_parsed_data

    db = get_db()
    user_id = await verify_token(credentials)

    creds = await _get_gmail_creds(user_id)
    if not creds:
        raise HTTPException(status_code=403, detail="Gmail not connected")

    # Step 1: Refresh inbox to catch any brand-new emails
    await scan_user_gmail(db, user_id)

    # Snapshot peer percentile before
    percentile_before = None
    metrics_before = {}
    try:
        from services.peer_comparison import compare_with_peers
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        existing_q = await db.questionnaires.find_one({"user_id": user_id}, {"_id": 0})
        if user and existing_q:
            pre = compare_with_peers(existing_q, user.get("age", 30))
            percentile_before = pre["overall_percentile"]
            metrics_before = {m["label"]: m["percentile"] for m in pre["metrics"]}
    except Exception:
        pass

    # Step 2: Find unparsed financial emails (prioritize the most recent)
    unparsed = await db.gmail_inbox.find(
        {"user_id": user_id, "parsed": False},
        {"_id": 0}
    ).sort("queued_at", -1).limit(max_emails).to_list(max_emails)

    if not unparsed:
        # Fallback: fetch recent emails directly from Gmail if inbox cache is empty
        try:
            from googleapiclient.discovery import build
            service = build('gmail', 'v1', credentials=creds)
            query = '(subject:statement OR subject:policy OR subject:investment OR subject:SIP OR subject:premium OR subject:renewal OR subject:insurance OR subject:EMI OR subject:credit OR subject:debit OR subject:transaction)'
            result = service.users().messages().list(userId='me', q=query, maxResults=max_emails).execute()
            for msg_ref in result.get('messages', []):
                meta = service.users().messages().get(userId='me', id=msg_ref['id'], format='metadata',
                                                     metadataHeaders=['Subject', 'From', 'Date']).execute()
                headers = {h['name']: h['value'] for h in meta.get('payload', {}).get('headers', [])}
                unparsed.append({
                    "email_id": msg_ref['id'],
                    "subject": headers.get('Subject', ''),
                    "from": headers.get('From', ''),
                })
        except Exception as e:
            logger.error(f"Fallback fetch failed: {e}")

    # Step 3: Parse + apply each
    from googleapiclient.discovery import build
    service = build('gmail', 'v1', credentials=creds)

    aggregate = {
        "emails_processed": 0,
        "emails_with_data": 0,
        "total_transactions_saved": 0,
        "total_fields_updated": 0,
        "policies_applied": [],
        "investments_applied": [],
        "errors": 0,
        "details": [],
    }

    for queued in unparsed:
        email_id = queued.get("email_id") or queued.get("id")
        if not email_id:
            continue
        try:
            msg = service.users().messages().get(userId='me', id=email_id, format='full').execute()
            body_text = ''
            payload = msg.get('payload', {})
            if payload.get('body', {}).get('data'):
                body_text = base64.urlsafe_b64decode(payload['body']['data']).decode('utf-8', errors='ignore')
            elif payload.get('parts'):
                for part in payload['parts']:
                    if part.get('mimeType') == 'text/plain' and part.get('body', {}).get('data'):
                        body_text = base64.urlsafe_b64decode(part['body']['data']).decode('utf-8', errors='ignore')
                        break

            headers = {h['name']: h['value'] for h in payload.get('headers', [])}
            subject = headers.get('Subject', '')
            full_text = f"From: {headers.get('From', '')}\nSubject: {subject}\nDate: {headers.get('Date', '')}\n\n{body_text}"

            parsed = await parse_email_text(full_text)
            aggregate["emails_processed"] += 1

            if not parsed.get("success") or not parsed.get("data"):
                await db.gmail_inbox.update_one(
                    {"user_id": user_id, "email_id": email_id},
                    {"$set": {"parsed": True, "parsed_at": datetime.now(timezone.utc).isoformat()}}
                )
                continue

            data = parsed["data"]
            has_data = bool(data.get("transactions") or data.get("insurance_data") or data.get("investment_data"))
            if has_data:
                actions = await apply_parsed_data(db, user_id, data, source="gmail_bulk", track_percentile=False)
                aggregate["emails_with_data"] += 1
                aggregate["total_transactions_saved"] += actions["transactions_saved"]
                aggregate["total_fields_updated"] += len(actions["questionnaire_fields_updated"])
                if actions["policy_applied"]:
                    aggregate["policies_applied"].append(actions["policy_applied"])
                if actions["investment_applied"]:
                    aggregate["investments_applied"].append(actions["investment_applied"])
                aggregate["details"].append({
                    "subject": subject[:80],
                    "transactions": actions["transactions_saved"],
                    "fields_updated": len(actions["questionnaire_fields_updated"]),
                })

            await db.gmail_inbox.update_one(
                {"user_id": user_id, "email_id": email_id},
                {"$set": {"parsed": True, "parsed_at": datetime.now(timezone.utc).isoformat(),
                          "parsed_data": data}}
            )
        except Exception as e:
            aggregate["errors"] += 1
            logger.warning(f"scan-and-apply-all: email {email_id} failed: {e}")

    # Compute final percentile delta
    if percentile_before is not None:
        try:
            from services.peer_comparison import compare_with_peers
            user = await db.users.find_one({"id": user_id}, {"_id": 0})
            new_q = await db.questionnaires.find_one({"user_id": user_id}, {"_id": 0})
            if user and new_q:
                post = compare_with_peers(new_q, user.get("age", 30))
                key_improvements = []
                for m in post["metrics"]:
                    before_p = metrics_before.get(m["label"], 0)
                    m_delta = m["percentile"] - before_p
                    if m_delta >= 15:
                        key_improvements.append({"label": m["label"], "before": before_p, "after": m["percentile"], "delta": m_delta})
                aggregate["percentile_change"] = {
                    "before": percentile_before,
                    "after": post["overall_percentile"],
                    "delta": post["overall_percentile"] - percentile_before,
                    "cohort_description": post["cohort"]["description"],
                    "key_improvements": sorted(key_improvements, key=lambda x: -x["delta"])[:3],
                }
        except Exception:
            pass

    # Build human summary
    summary_parts = [f"{aggregate['emails_processed']} email(s) scanned"]
    if aggregate['total_transactions_saved']:
        summary_parts.append(f"{aggregate['total_transactions_saved']} transaction(s) saved")
    if aggregate['total_fields_updated']:
        summary_parts.append(f"{aggregate['total_fields_updated']} profile field(s) auto-filled")
    if aggregate['policies_applied']:
        summary_parts.append(f"{len(aggregate['policies_applied'])} policy/policies applied")

    return {
        "success": True,
        "summary": ". ".join(summary_parts),
        **aggregate,
    }
