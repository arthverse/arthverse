"""
Document Parsing Routes — Policy PDF upload + Email text parsing
"""
from fastapi import APIRouter, Depends, UploadFile, File
from fastapi.security import HTTPAuthorizationCredentials
from routes.deps import security, verify_token, get_db, HTTPException
from services.document_parser import parse_policy_document, parse_email_text
from datetime import datetime, timezone
import os
import secrets

router = APIRouter(prefix="/documents", tags=["documents"])

UPLOAD_DIR = "/app/backend/uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/parse-policy")
async def upload_and_parse_policy(
    file: UploadFile = File(...),
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Upload an insurance policy PDF and extract structured data using AI."""
    db = get_db()
    user_id = await verify_token(credentials)

    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are supported")

    if file.size and file.size > 10 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")

    # Save file temporarily
    file_id = secrets.token_hex(12)
    file_path = os.path.join(UPLOAD_DIR, f"{file_id}.pdf")
    try:
        content = await file.read()
        with open(file_path, 'wb') as f:
            f.write(content)

        # Parse with AI
        result = await parse_policy_document(file_path)

        if result["success"]:
            # Save parsed policy to DB
            policy_doc = {
                "user_id": user_id,
                "file_name": file.filename,
                "parsed_data": result["data"],
                "raw_text_length": result.get("raw_text_length", 0),
                "parsed_at": datetime.now(timezone.utc).isoformat(),
                "source": "pdf_upload",
            }
            await db.parsed_policies.insert_one(policy_doc)

        return result
    finally:
        # Clean up temp file
        if os.path.exists(file_path):
            os.remove(file_path)


@router.post("/parse-email")
async def parse_financial_email(
    body: dict,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Parse financial email text and extract structured data."""
    db = get_db()
    user_id = await verify_token(credentials)

    email_text = body.get("email_text", "").strip()
    if not email_text:
        raise HTTPException(status_code=400, detail="email_text is required")

    if len(email_text) > 50000:
        raise HTTPException(status_code=400, detail="Email text too long (max 50000 chars)")

    result = await parse_email_text(email_text)

    if result["success"]:
        email_doc = {
            "user_id": user_id,
            "parsed_data": result["data"],
            "source": "manual_paste",
            "parsed_at": datetime.now(timezone.utc).isoformat(),
        }
        await db.parsed_emails.insert_one(email_doc)

    return result


@router.get("/parsed-policies")
async def get_parsed_policies(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get all previously parsed policies for the user."""
    db = get_db()
    user_id = await verify_token(credentials)
    policies = await db.parsed_policies.find({"user_id": user_id}, {"_id": 0}).sort("parsed_at", -1).to_list(50)
    return {"policies": policies}


@router.post("/apply-policy")
async def apply_policy_to_questionnaire(
    body: dict,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Apply parsed policy data to the user's questionnaire."""
    db = get_db()
    user_id = await verify_token(credentials)
    policy_data = body.get("policy_data", {})
    policy_type = policy_data.get("policy_type", "other")

    update_fields = {}
    if policy_type == "term_life":
        update_fields["has_term_life_insurance"] = True
        if policy_data.get("sum_assured"):
            update_fields["term_insurance_cover"] = policy_data["sum_assured"]
        if policy_data.get("premium_amount"):
            update_fields["term_insurance_premium_annual"] = policy_data["premium_amount"]
    elif policy_type == "health":
        update_fields["has_health_insurance"] = True
        update_fields["health_insurance_type"] = "personal"
        if policy_data.get("cover_amount"):
            update_fields["health_insurance_cover"] = policy_data["cover_amount"]
        if policy_data.get("premium_amount"):
            update_fields["health_insurance_premium_annual"] = policy_data["premium_amount"]
    elif policy_type == "vehicle":
        update_fields["has_vehicle"] = True
        update_fields["vehicle_insurance_type"] = "comprehensive"
        if policy_data.get("premium_amount"):
            update_fields["vehicle_insurance_premium_annual"] = policy_data["premium_amount"]
        if policy_data.get("idv"):
            update_fields["vehicle_idv"] = policy_data["idv"]
    elif policy_type in ["endowment", "ulip"]:
        update_fields["has_ulip_endowment"] = True
        if policy_data.get("sum_assured"):
            update_fields["ulip_endowment_cover"] = policy_data["sum_assured"]
        if policy_data.get("premium_amount"):
            update_fields["ulip_endowment_premium_annual"] = policy_data["premium_amount"]

    if update_fields:
        result = await db.questionnaires.update_one(
            {"user_id": user_id},
            {"$set": update_fields}
        )
        if result.modified_count == 0 and result.matched_count == 0:
            raise HTTPException(status_code=404, detail="Questionnaire not found. Please fill the questionnaire first.")

    return {"message": "Policy data applied to questionnaire", "updated_fields": list(update_fields.keys())}


# Map freeform GPT-returned categories to the standard transaction categories used by the app
_CATEGORY_MAP = {
    "salary": "Other",  # income — no matching expense category, use Other
    "income": "Other",
    "refund": "Other",
    "food": "Food & Dining",
    "dining": "Food & Dining",
    "groceries": "Food & Dining",
    "transport": "Transportation",
    "travel": "Travel",
    "fuel": "Transportation",
    "shopping": "Shopping",
    "utilities": "Bills & Utilities",
    "bills": "Bills & Utilities",
    "rent": "Bills & Utilities",
    "healthcare": "Healthcare",
    "medical": "Healthcare",
    "entertainment": "Entertainment",
    "education": "Education",
    "investment": "Investment",
    "sip": "Investment",
    "mutual_fund": "Investment",
    "fd": "Investment",
    "insurance": "Bills & Utilities",
    "premium": "Bills & Utilities",
    "emi": "Bills & Utilities",
    "loan": "Bills & Utilities",
    "credit_card": "Bills & Utilities",
}


def _normalize_category(raw: str) -> str:
    if not raw:
        return "Other"
    key = raw.lower().strip().replace(" ", "_")
    return _CATEGORY_MAP.get(key, "Other")


def _normalize_type(raw: str) -> str:
    if not raw:
        return "expense"
    r = raw.lower().strip()
    if r in ("credit", "income", "deposit", "salary"):
        return "income"
    return "expense"


@router.post("/save-transactions")
async def save_parsed_transactions(
    body: dict,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Save a list of parsed transactions (from email/Gmail parse) into the user's Transactions collection.

    Body: { transactions: [ {date, description, amount, type, category}, ... ], source: "email" | "gmail" }
    """
    import uuid
    from datetime import datetime as dt

    db = get_db()
    user_id = await verify_token(credentials)

    items = body.get("transactions") or []
    source = body.get("source", "smart_import")
    if not isinstance(items, list) or len(items) == 0:
        raise HTTPException(status_code=400, detail="transactions array is required")

    saved = []
    skipped = []
    for t in items:
        try:
            amount = float(t.get("amount") or 0)
            if amount <= 0:
                skipped.append({"reason": "invalid_amount", "item": t})
                continue

            description = (t.get("description") or "").strip() or "Imported transaction"
            date = t.get("date") or dt.now(timezone.utc).date().isoformat()

            doc = {
                "id": str(uuid.uuid4()),
                "user_id": user_id,
                "amount": amount,
                "type": _normalize_type(t.get("type")),
                "category": _normalize_category(t.get("category")),
                "description": description,
                "date": str(date),
                "created_at": datetime.now(timezone.utc).isoformat(),
                "source": source,
            }
            await db.transactions.insert_one(doc)
            doc.pop("_id", None)
            saved.append({k: v for k, v in doc.items() if k != "_id"})
        except Exception as e:
            skipped.append({"reason": str(e), "item": t})

    return {"saved_count": len(saved), "skipped_count": len(skipped), "saved": saved, "skipped": skipped}
