from fastapi import APIRouter, Depends
from fastapi.security import HTTPAuthorizationCredentials
from routes.deps import security, verify_token, get_db, HTTPException, BaseModel
from services.credit_health_engine import analyze_credit_health
from typing import List, Optional
from datetime import datetime, timezone

router = APIRouter(prefix="/credit", tags=["credit"])


class CreditProfileInput(BaseModel):
    cibil_score: int = 0
    credit_limit: float = 0
    credit_usage: float = 0
    emi_history: str = "never_missed"
    loan_count: int = 0
    enquiries: str = "0_1"
    credit_age: str = "2_5_years"
    credit_mix: List[str] = []


@router.post("/analyze")
async def analyze_credit(profile: CreditProfileInput, credentials: HTTPAuthorizationCredentials = Depends(security)):
    db = get_db()
    user_id = await verify_token(credentials)

    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    questionnaire = await db.questionnaires.find_one({"user_id": user_id}, {"_id": 0})
    monthly_income = 0
    if questionnaire:
        monthly_income = (
            questionnaire.get("monthly_salary_net", 0) +
            questionnaire.get("monthly_business_income", 0) +
            questionnaire.get("monthly_rental_income", 0) +
            questionnaire.get("monthly_other_income", 0)
        )

    result = analyze_credit_health({
        "cibil_score": profile.cibil_score,
        "credit_limit": profile.credit_limit,
        "credit_usage": profile.credit_usage,
        "emi_history": profile.emi_history,
        "loan_count": profile.loan_count,
        "enquiries": profile.enquiries,
        "credit_age": profile.credit_age,
        "credit_mix": profile.credit_mix,
        "user_name": user.get("name", ""),
        "monthly_income": monthly_income,
    })

    # Save to credit_profiles collection for history
    await db.credit_profiles.update_one(
        {"user_id": user_id},
        {"$set": {
            "user_id": user_id,
            **profile.model_dump(),
            "analysis": result,
            "updated_at": datetime.now(timezone.utc).isoformat(),
        }, "$push": {
            "score_history": {
                "$each": [{"score": profile.cibil_score, "date": datetime.now(timezone.utc).isoformat()}],
                "$slice": -12
            }
        }},
        upsert=True
    )

    return result


@router.get("/profile")
async def get_credit_profile(credentials: HTTPAuthorizationCredentials = Depends(security)):
    db = get_db()
    user_id = await verify_token(credentials)
    profile = await db.credit_profiles.find_one({"user_id": user_id}, {"_id": 0})
    if not profile:
        return {"exists": False}
    return {"exists": True, **profile}


@router.get("/history")
async def get_credit_history(credentials: HTTPAuthorizationCredentials = Depends(security)):
    db = get_db()
    user_id = await verify_token(credentials)
    profile = await db.credit_profiles.find_one({"user_id": user_id}, {"_id": 0, "score_history": 1})
    if not profile:
        return {"history": []}
    return {"history": profile.get("score_history", [])}
