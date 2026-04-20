from fastapi import APIRouter, Depends
from fastapi.security import HTTPAuthorizationCredentials
from routes.deps import (
    security, verify_token, get_db,
    FinancialQuestionnaire, QuestionnaireResponse, HTTPException
)
from datetime import datetime, timezone

router = APIRouter(tags=["questionnaire"])


@router.post("/questionnaire", response_model=QuestionnaireResponse)
async def submit_questionnaire(questionnaire: FinancialQuestionnaire, credentials: HTTPAuthorizationCredentials = Depends(security)):
    db = get_db()
    user_id = await verify_token(credentials)
    questionnaire_dict = questionnaire.model_dump()
    questionnaire_dict['user_id'] = user_id
    questionnaire_dict['updated_at'] = datetime.now(timezone.utc).isoformat()

    existing = await db.questionnaires.find_one({"user_id": user_id})
    if existing:
        await db.questionnaires.update_one({"user_id": user_id}, {"$set": questionnaire_dict})
    else:
        questionnaire_dict['created_at'] = datetime.now(timezone.utc).isoformat()
        await db.questionnaires.insert_one(questionnaire_dict)

    return QuestionnaireResponse(message="Questionnaire saved successfully", questionnaire=questionnaire)


@router.get("/questionnaire", response_model=FinancialQuestionnaire)
async def get_questionnaire(credentials: HTTPAuthorizationCredentials = Depends(security)):
    db = get_db()
    user_id = await verify_token(credentials)
    questionnaire = await db.questionnaires.find_one({"user_id": user_id}, {"_id": 0})
    if not questionnaire:
        raise HTTPException(status_code=404, detail="No questionnaire found")
    return FinancialQuestionnaire(**questionnaire)


@router.delete("/questionnaire")
async def reset_questionnaire(credentials: HTTPAuthorizationCredentials = Depends(security)):
    db = get_db()
    user_id = await verify_token(credentials)
    result = await db.questionnaires.delete_one({"user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="No questionnaire found to reset")
    return {"message": "Questionnaire reset successfully"}
