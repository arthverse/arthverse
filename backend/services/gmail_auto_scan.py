"""
Gmail Auto-Scan Background Service

Runs periodically (every 12 hours) to:
1. Find all users who connected Gmail
2. Fetch new financial emails since last scan
3. Queue them in `gmail_inbox` collection (without auto-parsing, to save GPT cost)
4. User reviews the queue on Smart Import page and selects which ones to parse

This is intentionally conservative: it only caches email metadata, not parsed data.
Users trigger parsing manually per-email to stay in control and avoid wasted AI calls.
"""
import asyncio
import logging
import base64
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

FINANCIAL_SEARCH_QUERY = (
    '(subject:statement OR subject:policy OR subject:investment OR subject:SIP '
    'OR subject:premium OR subject:renewal OR subject:insurance OR subject:EMI '
    'OR subject:credit OR subject:debit OR subject:transaction)'
)


async def scan_user_gmail(db, user_id: str) -> dict:
    """Scan a single user's Gmail for new financial emails.

    Returns: {user_id, new_count, total_queued, last_scanned}
    """
    from routes.gmail import _get_gmail_creds
    from googleapiclient.discovery import build

    creds = await _get_gmail_creds(user_id)
    if not creds:
        return {"user_id": user_id, "error": "no_gmail_creds"}

    try:
        service = build('gmail', 'v1', credentials=creds)

        # Use Gmail's `newer_than` operator for efficiency
        token_doc = await db.gmail_tokens.find_one({"user_id": user_id}, {"_id": 0})
        last_scanned = token_doc.get("last_scanned_at") if token_doc else None

        query = FINANCIAL_SEARCH_QUERY
        if last_scanned:
            # Only fetch emails from the last 14 days after first scan (rolling window)
            query += " newer_than:14d"
        else:
            query += " newer_than:30d"

        result = service.users().messages().list(userId='me', q=query, maxResults=30).execute()
        messages = result.get('messages', [])

        new_count = 0
        for msg_ref in messages:
            # Check if we've already queued this message
            existing = await db.gmail_inbox.find_one({"user_id": user_id, "email_id": msg_ref['id']})
            if existing:
                continue

            try:
                msg = service.users().messages().get(userId='me', id=msg_ref['id'], format='metadata',
                                                      metadataHeaders=['Subject', 'From', 'Date']).execute()
                headers = {h['name']: h['value'] for h in msg.get('payload', {}).get('headers', [])}

                await db.gmail_inbox.insert_one({
                    "user_id": user_id,
                    "email_id": msg_ref['id'],
                    "subject": headers.get('Subject', ''),
                    "from": headers.get('From', ''),
                    "date": headers.get('Date', ''),
                    "snippet": msg.get('snippet', ''),
                    "queued_at": datetime.now(timezone.utc).isoformat(),
                    "parsed": False,
                })
                new_count += 1
            except Exception as e:
                logger.warning(f"Could not queue email {msg_ref['id']}: {e}")

        # Update last scan timestamp
        await db.gmail_tokens.update_one(
            {"user_id": user_id},
            {"$set": {"last_scanned_at": datetime.now(timezone.utc).isoformat()}}
        )

        total_unparsed = await db.gmail_inbox.count_documents({"user_id": user_id, "parsed": False})
        return {
            "user_id": user_id,
            "new_count": new_count,
            "total_queued": total_unparsed,
            "last_scanned": datetime.now(timezone.utc).isoformat(),
        }
    except Exception as e:
        logger.error(f"Gmail auto-scan failed for user {user_id}: {e}")
        return {"user_id": user_id, "error": str(e)}


async def scan_all_connected_users(db):
    """Scheduler entry point — scans all users who have connected Gmail."""
    logger.info("Starting Gmail auto-scan for all connected users")
    users = await db.gmail_tokens.find({"access_token": {"$ne": None}}, {"user_id": 1, "_id": 0}).to_list(1000)

    total_new = 0
    for u in users:
        try:
            result = await scan_user_gmail(db, u["user_id"])
            total_new += result.get("new_count", 0)
            # Small delay between users to be nice to Gmail API
            await asyncio.sleep(1)
        except Exception as e:
            logger.error(f"Scan error for {u['user_id']}: {e}")

    logger.info(f"Gmail auto-scan complete: {len(users)} users scanned, {total_new} new emails queued")
    return {"users_scanned": len(users), "total_new_emails": total_new}
