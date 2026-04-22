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
async def connect_gmail(user_id: str = Query(...)):
    """Start Gmail OAuth flow."""
    if not GOOGLE_CLIENT_ID or not GOOGLE_CLIENT_SECRET:
        raise HTTPException(status_code=503, detail="Gmail API not configured")

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

        # Search for financial emails
        query = '(subject:statement OR subject:policy OR subject:investment OR subject:SIP OR subject:premium OR subject:renewal OR subject:insurance OR subject:EMI OR subject:credit OR subject:debit OR from:noreply@hdfcbank OR from:alerts@icicibank)'
        result = service.users().messages().list(userId='me', q=query, maxResults=max_results).execute()
        messages = result.get('messages', [])

        emails = []
        for msg_ref in messages[:max_results]:
            msg = service.users().messages().get(userId='me', id=msg_ref['id'], format='full').execute()
            headers = {h['name']: h['value'] for h in msg.get('payload', {}).get('headers', [])}

            # Extract body
            body_text = ''
            payload = msg.get('payload', {})
            if payload.get('body', {}).get('data'):
                body_text = base64.urlsafe_b64decode(payload['body']['data']).decode('utf-8', errors='ignore')
            elif payload.get('parts'):
                for part in payload['parts']:
                    if part.get('mimeType') == 'text/plain' and part.get('body', {}).get('data'):
                        body_text = base64.urlsafe_b64decode(part['body']['data']).decode('utf-8', errors='ignore')
                        break

            emails.append({
                "id": msg_ref['id'],
                "subject": headers.get('Subject', ''),
                "from": headers.get('From', ''),
                "date": headers.get('Date', ''),
                "snippet": msg.get('snippet', ''),
                "body_preview": body_text[:500] if body_text else '',
            })

        return {"emails": emails, "total": len(emails)}
    except Exception as e:
        logger.error(f"Gmail fetch error: {e}")
        if "invalid_grant" in str(e).lower() or "401" in str(e):
            await db.gmail_tokens.delete_one({"user_id": user_id})
            raise HTTPException(status_code=401, detail="Gmail session expired. Please reconnect.")
        raise HTTPException(status_code=500, detail=str(e))


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
