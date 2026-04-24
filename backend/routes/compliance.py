"""
India compliance endpoints (DPDP Act 2023 + IT Act 2000 Intermediary Rules).

Exposes:
  POST   /api/compliance/grievance           - public grievance submission
  GET    /api/compliance/export-data         - authenticated user downloads a JSON
                                               copy of all their personal data
  DELETE /api/compliance/account             - authenticated user hard-deletes account
  GET    /api/compliance/grievance-officer   - public grievance officer details
"""
from fastapi import APIRouter, Depends
from fastapi.security import HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr, Field
from datetime import datetime, timezone
from typing import Optional
import uuid
import logging

from routes.deps import security, verify_token, get_db, HTTPException

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/compliance", tags=["compliance"])

# ---------------- Grievance Officer (public) ----------------

GRIEVANCE_OFFICER = {
    "name": "Mehul Shrishrimal",
    "role": "Grievance Officer, Arth-Verse (Sole Proprietorship)",
    "email": "grievance@arth-verse.in",
    "phone": "+91-91113-49710",
    "jurisdiction": "India",
    "acknowledge_within_hours": 24,
    "resolve_within_days": 15,
    "regulatory_basis": "IT Act 2000 § 79 + IT (Intermediary Guidelines) Rules 2021 + DPDP Act 2023",
}


class GrievanceSubmit(BaseModel):
    name: str = Field(..., min_length=2, max_length=120)
    email: EmailStr
    subject: Optional[str] = ""
    message: str = Field(..., min_length=10, max_length=5000)


@router.get("/grievance-officer")
async def get_grievance_officer():
    return GRIEVANCE_OFFICER


@router.post("/grievance")
async def submit_grievance(payload: GrievanceSubmit):
    db = get_db()
    grievance_id = f"GRV-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{uuid.uuid4().hex[:6].upper()}"
    doc = {
        "grievance_id": grievance_id,
        "name": payload.name,
        "email": payload.email,
        "subject": payload.subject or "(no subject)",
        "message": payload.message,
        "status": "OPEN",
        "created_at": datetime.now(timezone.utc).isoformat(),
    }
    await db.grievances.insert_one(doc)
    logger.info(f"Grievance filed: {grievance_id} from {payload.email}")
    return {
        "grievance_id": grievance_id,
        "email": payload.email,
        "status": "OPEN",
        "acknowledge_within_hours": 24,
        "resolve_within_days": 15,
    }


# ---------------- DPDP: Export my data ----------------

_USER_COLLECTIONS = [
    "users",
    "questionnaires",
    "transactions",
    "payments",
    "orders",
    "insurance_policies",
    "risk_profiles",
    "setu_consents",
    "setu_financial_data",
    "cancelled_subscriptions",
    "gmail_tokens",
    "gmail_inbox",
    "uploaded_documents",
]

_SENSITIVE_FIELDS = {"password_hash", "hashed_password", "access_token", "refresh_token"}


def _scrub(doc: dict) -> dict:
    """Remove sensitive fields and Mongo _id from a document before export."""
    if not isinstance(doc, dict):
        return doc
    out = {}
    for k, v in doc.items():
        if k == "_id" or k in _SENSITIVE_FIELDS:
            continue
        out[k] = v
    return out


@router.get("/export-data")
async def export_my_data(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Return a full JSON dump of the user's personal data (DPDP Right to Access)."""
    db = get_db()
    user_id = await verify_token(credentials)

    export = {
        "meta": {
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "user_id": user_id,
            "regulatory_basis": "DPDP Act 2023 § 11 (Right to Access)",
        },
        "data": {},
    }

    for coll_name in _USER_COLLECTIONS:
        coll = db[coll_name]
        # "users" uses `id` field; others use `user_id`
        query = {"id": user_id} if coll_name == "users" else {"user_id": user_id}
        docs = await coll.find(query, {"_id": 0}).to_list(length=1000)
        export["data"][coll_name] = [_scrub(d) for d in docs]

    return export


# ---------------- DPDP: Delete my account ----------------

class DeleteAccountRequest(BaseModel):
    confirmation: str = Field(..., description='Must be exactly "DELETE MY ACCOUNT"')


@router.delete("/account")
async def delete_my_account(
    body: DeleteAccountRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security),
):
    """Hard delete user's account and all associated data (DPDP Right to Erasure)."""
    if body.confirmation != "DELETE MY ACCOUNT":
        raise HTTPException(
            status_code=400,
            detail='To confirm deletion, send {"confirmation": "DELETE MY ACCOUNT"}',
        )

    db = get_db()
    user_id = await verify_token(credentials)

    user = await db.users.find_one({"id": user_id}, {"_id": 0, "email": 1, "client_id": 1})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    deletion_log = {
        "deleted_user_id": user_id,
        "deleted_email_hash": str(hash(user.get("email", ""))),
        "deleted_at": datetime.now(timezone.utc).isoformat(),
        "reason": "DPDP user-initiated erasure",
        "counts": {},
    }

    for coll_name in _USER_COLLECTIONS:
        coll = db[coll_name]
        query = {"id": user_id} if coll_name == "users" else {"user_id": user_id}
        result = await coll.delete_many(query)
        deletion_log["counts"][coll_name] = result.deleted_count

    # Log the deletion event for audit (no PII, just hashed email + counts)
    await db.deletion_audit.insert_one(deletion_log)
    logger.info(f"User account deleted: {user_id}, counts={deletion_log['counts']}")

    return {
        "success": True,
        "message": "Your account and all associated data have been permanently deleted.",
        "deleted_records": deletion_log["counts"],
    }
