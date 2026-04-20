"""
Shared dependencies for all route modules.
Provides database, security, auth helpers, and common models.
"""
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
from datetime import datetime, timezone, timedelta
import os
import bcrypt
import jwt
import logging

logger = logging.getLogger(__name__)

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24 * 7

# Security
security = HTTPBearer()

# Database reference - set by server.py at startup
db = None

def set_db(database):
    global db
    db = database

def get_db():
    return db

# ============= Auth Helpers =============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))

def create_token(user_id: str) -> str:
    expiration = datetime.now(timezone.utc) + timedelta(hours=JWT_EXPIRATION_HOURS)
    payload = {
        'user_id': user_id,
        'exp': expiration
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)

async def verify_token(credentials: HTTPAuthorizationCredentials) -> str:
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        return payload['user_id']
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Token expired')
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail='Invalid token')

def extract_loan_rate(loans: list, loan_type: str, default_rate: float) -> float:
    if not loans:
        return default_rate
    for loan in loans:
        if isinstance(loan, dict) and loan.get("loan_type", "").lower() == loan_type.lower():
            rate = loan.get("interest_rate", 0)
            if rate > 0:
                return rate
    return default_rate

# ============= Pydantic Models =============

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    mobile_number: str
    pan_number: str = ""
    date_of_birth: str
    city: str
    data_privacy_consent: bool

class UserLogin(BaseModel):
    client_id: str
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    client_id: str
    email: str
    name: str
    mobile_number: str
    pan_number: str = ""
    date_of_birth: str
    city: str
    created_at: str
    networth: float = 0
    needs_password_setup: bool = False

class AuthResponse(BaseModel):
    token: str
    user: UserResponse

class TransactionCreate(BaseModel):
    amount: float
    type: str
    category: str
    description: str
    date: str

class Transaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    user_id: str
    amount: float
    type: str
    category: str
    description: str
    date: str
    created_at: str

class FinancialHealthScore(BaseModel):
    score: int
    total_income: float
    total_expenses: float
    net_savings: float
    savings_rate: float
    expense_to_income_ratio: float
    insights: List[str]

class PLStatement(BaseModel):
    total_income: float
    total_expenses: float
    net_profit_loss: float
    income_by_category: dict
    expenses_by_category: dict
    monthly_trend: List[dict]

class BalanceSheet(BaseModel):
    total_assets: float
    total_liabilities: float
    net_worth: float
    assets_breakdown: dict
    liabilities_breakdown: dict

class ConsentInitiateRequest(BaseModel):
    phone_number: str

class ConsentStatusResponse(BaseModel):
    consent_id: str
    status: str
    accounts: Optional[List[dict]] = []

class FinancialDataResponse(BaseModel):
    accounts: List[dict] = []
    mutualFunds: List[dict] = []
    insurance: List[dict] = []

class CategorizeExpenseRequest(BaseModel):
    description: str
    amount: float

class CategorizeExpenseResponse(BaseModel):
    category: str
    confidence: str

class FinancialEntry(BaseModel):
    type: str
    amount: float
    frequency: str = "monthly"

class FinancialQuestionnaire(BaseModel):
    rental_property1: float = 0
    rental_property2: float = 0
    salary_income: float = 0
    business_income: float = 0
    interest_income: float = 0
    dividend_income: float = 0
    capital_gains: float = 0
    freelance_income: float = 0
    other_income: float = 0
    rent_expense: float = 0
    emis: float = 0
    term_insurance: float = 0
    health_insurance: float = 0
    vehicle_2w_1: float = 0
    vehicle_2w_2: float = 0
    vehicle_4w_1: float = 0
    vehicle_4w_2: float = 0
    vehicle_4w_3: float = 0
    household_maid: float = 0
    groceries: float = 0
    food_dining: float = 0
    fuel: float = 0
    travel: float = 0
    shopping: float = 0
    online_shopping: float = 0
    electronics: float = 0
    entertainment: float = 0
    telecom_utilities: float = 0
    healthcare: float = 0
    education: float = 0
    cash_withdrawals: float = 0
    foreign_transactions: float = 0
    city_tier: str = "tier_2"
    family_situation: str = "single_stable"
    home_loan_emi: float = 0
    car_loan_emi: float = 0
    education_loan_emi: float = 0
    personal_loan_emi: float = 0
    other_loan_emi: float = 0
    home_loan_outstanding: float = 0
    car_loan_outstanding: float = 0
    education_loan_outstanding: float = 0
    personal_loan_outstanding: float = 0
    other_loan_outstanding: float = 0
    mutual_funds: float = 0
    stocks: float = 0
    debt_mf: float = 0
    pf_nps: float = 0
    fd: float = 0
    sweep_fd: float = 0
    bonds: float = 0
    real_estate: float = 0
    gold: float = 0
    silver: float = 0
    liquid_mf: float = 0
    life_insurance_coverage: float = 0
    life_insurance_premium: float = 0
    health_insurance_coverage: float = 0
    health_insurance_premium: float = 0
    has_vehicle: bool = False
    vehicle_insurance_type: str = "none"
    vehicle_insurance_premium: float = 0
    yearly_investment: float = 0
    has_credit_card: bool = False
    credit_card_debt: float = 0
    habit_health_insurance: str = "neutral"
    habit_term_life: str = "neutral"
    habit_itr_filing: str = "neutral"
    habit_cc_balance: str = "neutral"
    habit_personal_loan: str = "neutral"
    habit_invest_beyond_fd: str = "neutral"
    property_value: float = 0
    vehicles_value: float = 0
    gold_value: float = 0
    silver_value: float = 0
    stocks_value: float = 0
    mutual_funds_value: float = 0
    pf_nps_value: float = 0
    bank_balance: float = 0
    cash_in_hand: float = 0
    properties: List[dict] = []
    vehicles: List[dict] = []
    home_loan: float = 0
    personal_loan: float = 0
    vehicle_loan: float = 0
    credit_card_outstanding: float = 0
    loans: List[dict] = []
    interest_investments: List[dict] = []
    income_entries: List[FinancialEntry] = []
    expense_entries: List[FinancialEntry] = []
    asset_entries: List[dict] = []
    liability_entries: List[dict] = []
    has_health_insurance: bool = False
    has_term_insurance: bool = False
    invests_in_mutual_funds: bool = False
    takes_tds_refund: bool = False
    has_emergency_fund: bool = False
    files_itr_yearly: bool = False
    credit_cards: List[str] = []
    monthly_investment: float = 0
    completed_at: str = ""

class QuestionnaireResponse(BaseModel):
    message: str
    questionnaire: FinancialQuestionnaire

class IntegrationStatus(BaseModel):
    status: str = "placeholder"
    message: str
    module: str
    version: str = "0.1.0"
    ready: bool = False
