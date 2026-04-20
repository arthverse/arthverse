from fastapi import APIRouter, Depends
from fastapi.security import HTTPAuthorizationCredentials
from routes.deps import (
    security, verify_token, get_db, IntegrationStatus, HTTPException
)

router = APIRouter(prefix="/integrations", tags=["integrations"])


@router.get("/account-aggregator")
async def account_aggregator_placeholder(credentials: HTTPAuthorizationCredentials = Depends(security)):
    await verify_token(credentials)
    return IntegrationStatus(
        status="placeholder",
        message="Account Aggregator integration is under development. This will enable automated fetching of bank accounts, mutual funds, and insurance policies via Setu/Sahamati AA framework.",
        module="account_aggregator", version="0.1.0", ready=False
    )


@router.get("/email-parsing")
async def email_parsing_placeholder(credentials: HTTPAuthorizationCredentials = Depends(security)):
    await verify_token(credentials)
    return IntegrationStatus(
        status="placeholder",
        message="Email Parsing module is under development. This will automatically parse bank statements, investment confirmations, and insurance renewal emails to keep your financial profile updated.",
        module="email_parsing", version="0.1.0", ready=False
    )


@router.get("/sms-parsing")
async def sms_parsing_placeholder(credentials: HTTPAuthorizationCredentials = Depends(security)):
    await verify_token(credentials)
    return IntegrationStatus(
        status="placeholder",
        message="SMS Parsing module is under development. This will parse bank transaction SMS, credit card alerts, and UPI notifications to auto-categorize your expenses.",
        module="sms_parsing", version="0.1.0", ready=False
    )


@router.get("/portfolio-sync")
async def portfolio_sync_placeholder(credentials: HTTPAuthorizationCredentials = Depends(security)):
    await verify_token(credentials)
    return IntegrationStatus(
        status="placeholder",
        message="Portfolio Sync module is under development. This will connect to CAMS/KFintech/CDSL to provide real-time mutual fund, stock, and NPS portfolio tracking.",
        module="portfolio_sync", version="0.1.0", ready=False
    )


@router.get("/status")
async def all_integrations_status(credentials: HTTPAuthorizationCredentials = Depends(security)):
    await verify_token(credentials)
    return {
        "integrations": [
            {"module": "account_aggregator", "status": "development", "ready": False, "description": "Auto-fetch bank/MF/insurance data via AA framework"},
            {"module": "email_parsing", "status": "planned", "ready": False, "description": "Parse financial emails for auto-updates"},
            {"module": "sms_parsing", "status": "planned", "ready": False, "description": "Parse transaction SMS for expense tracking"},
            {"module": "portfolio_sync", "status": "planned", "ready": False, "description": "Real-time investment portfolio sync"},
        ]
    }
