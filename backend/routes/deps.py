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
    # Section A: Profile
    city_tier: str = "tier_2"
    family_situation: str = "single_stable"
    has_credit_card: bool = False
    employment_type: str = "salaried"
    cibil_score: int = 0
    pan_linked: bool = False

    # Section B: Income
    monthly_salary_net: float = 0
    monthly_business_income: float = 0
    monthly_rental_income: float = 0
    monthly_other_income: float = 0
    annual_income: float = 0
    employer_epf_monthly: float = 0
    annual_bonus: float = 0
    tax_regime: str = "new_regime"
    annual_tax_paid: float = 0

    # Section C: Expenses
    monthly_rent_or_emi_home: float = 0
    monthly_groceries: float = 0
    monthly_utilities: float = 0
    monthly_transport: float = 0
    monthly_education: float = 0
    monthly_food_eating_out: float = 0
    monthly_entertainment: float = 0
    monthly_medical: float = 0
    monthly_insurance_premiums: float = 0
    monthly_investments_sip: float = 0
    monthly_other_expenses: float = 0
    total_monthly_expenses: float = 0

    # Section D: Assets
    bank_savings_balance: float = 0
    cash_in_hand: float = 0
    sweep_fd_balance: float = 0
    regular_fd_balance: float = 0
    liquid_mf_balance: float = 0
    equity_mf_current_value: float = 0
    equity_mf_invested_amount: float = 0
    direct_stocks_value: float = 0
    direct_stocks_cost: float = 0
    debt_mf_bonds_value: float = 0
    debt_mf_bonds_invested: float = 0
    ppf_nps_balance: float = 0
    gold_silver_value: float = 0
    gold_silver_cost: float = 0
    real_estate_primary_value: float = 0
    real_estate_investment_value: float = 0
    ulip_endowment_value: float = 0
    other_assets: float = 0

    # Section E: Liabilities
    home_loan_outstanding: float = 0
    home_loan_emi: float = 0
    home_loan_interest_rate: float = 8.5
    vehicle_loan_outstanding: float = 0
    vehicle_loan_emi: float = 0
    vehicle_loan_interest_rate: float = 9.0
    education_loan_outstanding: float = 0
    education_loan_emi: float = 0
    education_loan_interest_rate: float = 9.0
    personal_loan_outstanding: float = 0
    personal_loan_emi: float = 0
    credit_card_outstanding: float = 0
    credit_card_emi_monthly: float = 0
    other_loans_emi: float = 0

    # Section F: Insurance
    has_term_life_insurance: bool = False
    term_insurance_cover: float = 0
    term_insurance_premium_annual: float = 0
    has_ulip_endowment: bool = False
    ulip_endowment_cover: float = 0
    ulip_endowment_premium_annual: float = 0
    has_health_insurance: bool = False
    health_insurance_type: str = "none"
    health_insurance_cover: float = 0
    health_insurance_premium_annual: float = 0
    family_members_covered: int = 1
    dependent_parents_covered: bool = False
    has_vehicle: bool = False
    vehicle_insurance_type: str = "none"
    vehicle_insurance_premium_annual: float = 0
    vehicle_idv: float = 0

    # Section G: Financial Habits
    habit_q1_health_insurance: str = ""
    habit_q2_term_insurance: str = ""
    habit_q3_itr_filing: str = ""
    habit_q4_credit_card: str = ""
    habit_q5_cc_revolving: str = ""
    habit_q6_personal_loan: str = ""
    habit_q7_invest_beyond_fd: str = ""

    # Credit Card Recommendation (Step 5)
    credit_cards: List[str] = []
    selected_credit_card: str = ""
    monthly_investment: float = 0
    yearly_investment: float = 0

    # Structural / dynamic
    properties: List[dict] = []
    vehicles: List[dict] = []
    loans: List[dict] = []
    interest_investments: List[dict] = []
    insurance_policies: List[dict] = []
    income_entries: List[FinancialEntry] = []
    expense_entries: List[dict] = []
    asset_entries: List[dict] = []
    liability_entries: List[dict] = []

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
