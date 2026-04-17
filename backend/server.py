from fastapi import FastAPI, APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from pathlib import Path

# Load environment variables FIRST before importing services
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
from emergentintegrations.llm.chat import LlmChat, UserMessage
import asyncio
from services.setu_service import setu_service
from services.financial_health_calculator import calculate_financial_health_score
from services.financial_health_calculator_v2 import calculate_financial_health_score as calculate_10_factor_score
from services.opportunity_analyzer import analyze_financial_opportunities
from services.user_id_generator import generate_user_login_id_async, validate_date_of_birth
from services.payment_service import payment_service, PLANS, PRICING, calculate_plan_price
from services.report_generator import create_report
from services.hinglish_report_generator import create_hinglish_report
from services.arthrakshak_service import (
    InsurancePolicy, PolicyCategory, PolicyType, PremiumFrequency,
    PolicyCoverage, RiskProfile, ProtectionGap, RiskStatus,
    get_coverage_checklist, calculate_protection_gap
)

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# JWT Configuration
JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-in-production')
JWT_ALGORITHM = 'HS256'
JWT_EXPIRATION_HOURS = 24 * 7

# Security
security = HTTPBearer()

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# ============= Models =============

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    mobile_number: str
    pan_number: str = ""
    date_of_birth: str  # Required for login ID generation (YYYY-MM-DD or DD-MM-YYYY)
    city: str
    data_privacy_consent: bool

class UserLogin(BaseModel):
    client_id: str
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str
    client_id: str  # This will now be the User Login ID
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
    type: str  # 'income' or 'expense'
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

# ============= Setu Account Aggregator Models =============

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

# New detailed models for properties, loans, and investments
class PropertyEntry(BaseModel):
    name: str = ""
    estimated_value: float = 0
    area_sqft: float = 0
    # value_per_sqft calculated on frontend

class VehicleEntry(BaseModel):
    vehicle_type: str = ""  # 2-Wheeler / 4-Wheeler
    name: str = ""  # e.g., Honda Activa, Maruti Swift
    registration_number: str = ""  # e.g., CG04ND1195
    estimated_value: float = 0
    is_insured: bool = False

class LoanEntry(BaseModel):
    loan_type: str = ""  # Home/Personal/Vehicle/Education/Gold/Other
    name: str = ""
    principal_amount: float = 0
    interest_rate: float = 0  # Annual %
    tenure_months: int = 0
    # EMI and yearly interest calculated on frontend

class InterestIncomeEntry(BaseModel):
    name: str = ""  # FD name, Bond name, etc.
    investment_type: str = ""  # FD/RD/Bonds/Debentures/Other
    principal_amount: float = 0
    interest_rate: float = 0  # Annual %
    # Yearly interest income calculated on frontend

class FinancialQuestionnaire(BaseModel):
    # Predefined Income
    rental_property1: float = 0
    rental_property2: float = 0
    salary_income: float = 0
    business_income: float = 0
    interest_income: float = 0
    dividend_income: float = 0
    capital_gains: float = 0
    freelance_income: float = 0
    other_income: float = 0
    
    # Predefined Expenses
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
    
    # === NEW FIELDS FOR 10-FACTOR SCORING ===
    
    # Profile & Demographics
    city_tier: str = "tier_2"  # tier_1, tier_2, tier_3, tier_4, town, village
    family_situation: str = "single_stable"  # single_stable, married_children, family_elderly, entrepreneur
    
    # EMI Details
    home_loan_emi: float = 0
    car_loan_emi: float = 0
    education_loan_emi: float = 0
    personal_loan_emi: float = 0
    other_loan_emi: float = 0
    
    # Loan Outstanding
    home_loan_outstanding: float = 0
    car_loan_outstanding: float = 0
    education_loan_outstanding: float = 0
    personal_loan_outstanding: float = 0
    other_loan_outstanding: float = 0
    
    # Detailed Assets
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
    
    # Insurance Details
    life_insurance_coverage: float = 0
    life_insurance_premium: float = 0
    health_insurance_coverage: float = 0
    health_insurance_premium: float = 0
    has_vehicle: bool = False
    vehicle_insurance_type: str = "none"  # comprehensive, third_party, none
    vehicle_insurance_premium: float = 0
    
    # Investment
    yearly_investment: float = 0
    
    # Credit Card
    has_credit_card: bool = False
    credit_card_debt: float = 0
    
    # Financial Habits (7 questions)
    habit_health_insurance: str = "neutral"  # good, bad, neutral
    habit_term_life: str = "neutral"
    habit_itr_filing: str = "neutral"
    habit_cc_balance: str = "neutral"  # good = pays full, bad = carries balance
    habit_personal_loan: str = "neutral"  # good = no loans, bad = multiple
    habit_invest_beyond_fd: str = "neutral"  # good = yes, bad = no
    
    # === END NEW FIELDS ===
    
    # Predefined Assets (legacy)
    property_value: float = 0  # Total property value (legacy, will be derived from properties list)
    vehicles_value: float = 0
    gold_value: float = 0
    silver_value: float = 0
    stocks_value: float = 0
    mutual_funds_value: float = 0
    pf_nps_value: float = 0
    bank_balance: float = 0
    cash_in_hand: float = 0
    
    # Detailed Properties List
    properties: List[dict] = []  # List of PropertyEntry dicts
    
    # Detailed Vehicles List
    vehicles: List[dict] = []  # List of VehicleEntry dicts
    
    # Predefined Liabilities
    home_loan: float = 0
    personal_loan: float = 0
    vehicle_loan: float = 0
    credit_card_outstanding: float = 0
    
    # Detailed Loans List (replaces simple loan values)
    loans: List[dict] = []  # List of LoanEntry dicts
    
    # Interest-bearing Investments (FDs, Bonds, etc.)
    interest_investments: List[dict] = []  # List of InterestIncomeEntry dicts
    
    # Dynamic/Custom entries
    income_entries: List[FinancialEntry] = []
    expense_entries: List[FinancialEntry] = []
    asset_entries: List[dict] = []
    liability_entries: List[dict] = []
    
    # Financial stability
    has_health_insurance: bool = False
    has_term_insurance: bool = False
    invests_in_mutual_funds: bool = False
    takes_tds_refund: bool = False
    has_emergency_fund: bool = False
    files_itr_yearly: bool = False
    
    # Credit cards
    credit_cards: List[str] = []
    
    # Amount invested monthly
    monthly_investment: float = 0
    
    completed_at: str = ""

class QuestionnaireResponse(BaseModel):
    message: str
    questionnaire: FinancialQuestionnaire

# ============= Helper Functions =============

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
    """Extract interest rate for a specific loan type from loans array.
    
    Args:
        loans: List of loan dictionaries
        loan_type: Type of loan to search for (Home, Vehicle, Education, Personal, etc.)
        default_rate: Default interest rate if loan not found
    
    Returns:
        Interest rate for the loan type
    """
    if not loans:
        return default_rate
    
    for loan in loans:
        if isinstance(loan, dict) and loan.get("loan_type", "").lower() == loan_type.lower():
            rate = loan.get("interest_rate", 0)
            if rate > 0:
                return rate
    
    return default_rate

async def categorize_with_ai(description: str, amount: float) -> dict:
    """Use AI to categorize expenses"""
    try:
        llm_key = os.environ.get('EMERGENT_LLM_KEY')
        chat = LlmChat(
            api_key=llm_key,
            session_id=f"categorize-{uuid.uuid4()}",
            system_message="You are a financial assistant. Categorize expenses into one of these categories: Food & Dining, Transportation, Shopping, Bills & Utilities, Healthcare, Entertainment, Travel, Education, Investment, Other. Respond with ONLY the category name, nothing else."
        ).with_model("openai", "gpt-5.1")
        
        user_message = UserMessage(
            text=f"Categorize this expense: '{description}' amount: ${amount}"
        )
        
        response = await chat.send_message(user_message)
        category = response.strip()
        
        # Validate category
        valid_categories = ['Food & Dining', 'Transportation', 'Shopping', 'Bills & Utilities', 
                          'Healthcare', 'Entertainment', 'Travel', 'Education', 'Investment', 'Other']
        if category not in valid_categories:
            category = 'Other'
        
        return {'category': category, 'confidence': 'high'}
    except Exception as e:
        logger.error(f"AI categorization failed: {e}")
        return {'category': 'Other', 'confidence': 'low'}

# ============= Auth Routes =============

@api_router.post("/auth/register", response_model=AuthResponse)
async def register(user_data: UserCreate):
    # Validate date of birth
    if not validate_date_of_birth(user_data.date_of_birth):
        raise HTTPException(status_code=400, detail="Invalid date of birth format. Use YYYY-MM-DD or DD-MM-YYYY")
    
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Check if PAN already exists
    if user_data.pan_number:
        existing_pan = await db.users.find_one({"pan_number": user_data.pan_number}, {"_id": 0})
        if existing_pan:
            raise HTTPException(status_code=400, detail="PAN number already registered")
    
    # Generate unique User Login ID
    client_id = await generate_user_login_id_async(
        name=user_data.name,
        date_of_birth=user_data.date_of_birth,
        db_collection=db.users
    )
    
    # Create user without password (user will set it later)
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "client_id": client_id,  # This is now the User Login ID
        "email": user_data.email,
        "password_hash": "",  # Empty - user will set password later
        "name": user_data.name,
        "mobile_number": user_data.mobile_number,
        "pan_number": user_data.pan_number,
        "date_of_birth": user_data.date_of_birth,
        "city": user_data.city,
        "data_privacy_consent": user_data.data_privacy_consent,
        "networth": 0,
        "needs_password_setup": True,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    # Create token
    token = create_token(user_id)
    
    user_response = UserResponse(
        id=user_id,
        client_id=client_id,
        email=user_data.email,
        name=user_data.name,
        mobile_number=user_data.mobile_number,
        pan_number=user_data.pan_number,
        date_of_birth=user_data.date_of_birth,
        city=user_data.city,
        created_at=user_doc['created_at'],
        networth=0,
        needs_password_setup=True
    )
    
    return AuthResponse(token=token, user=user_response)

@api_router.post("/auth/login", response_model=AuthResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"client_id": credentials.client_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Check if user needs password setup
    if user.get('needs_password_setup', False) or not user.get('password_hash'):
        raise HTTPException(status_code=403, detail="Please set up your password first")
    
    if not verify_password(credentials.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user['id'])
    
    user_response = UserResponse(
        id=user['id'],
        client_id=user['client_id'],
        email=user['email'],
        name=user['name'],
        mobile_number=user['mobile_number'],
        pan_number=user.get('pan_number', ''),
        date_of_birth=user.get('date_of_birth', ''),
        city=user['city'],
        created_at=user['created_at'],
        networth=user.get('networth', 0),
        needs_password_setup=False
    )
    
    return AuthResponse(token=token, user=user_response)

class SetPasswordRequest(BaseModel):
    client_id: str
    password: str
    confirm_password: str

@api_router.post("/auth/set-password")
async def set_password(request: SetPasswordRequest):
    if request.password != request.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    
    if len(request.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")
    
    user = await db.users.find_one({"client_id": request.client_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update password
    await db.users.update_one(
        {"client_id": request.client_id},
        {"$set": {"password_hash": hash_password(request.password), "needs_password_setup": False}}
    )
    
    # Create token for auto-login
    token = create_token(user['id'])
    
    user_response = UserResponse(
        id=user['id'],
        client_id=user['client_id'],
        email=user['email'],
        name=user['name'],
        mobile_number=user['mobile_number'],
        pan_number=user.get('pan_number', ''),
        date_of_birth=user.get('date_of_birth', ''),
        city=user['city'],
        created_at=user['created_at'],
        networth=user.get('networth', 0),
        needs_password_setup=False
    )
    
    return AuthResponse(token=token, user=user_response)

@api_router.get("/auth/me", response_model=UserResponse)
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user_id = await verify_token(credentials)
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return UserResponse(
        id=user['id'],
        client_id=user['client_id'],
        email=user['email'],
        name=user['name'],
        mobile_number=user['mobile_number'],
        pan_number=user.get('pan_number', ''),
        date_of_birth=user.get('date_of_birth', ''),
        city=user['city'],
        created_at=user['created_at'],
        networth=user.get('networth', 0),
        needs_password_setup=user.get('needs_password_setup', False)
    )

# ============= Transaction Routes =============

@api_router.post("/transactions", response_model=Transaction)
async def create_transaction(transaction_data: TransactionCreate, credentials: HTTPAuthorizationCredentials = Depends(security)):
    user_id = await verify_token(credentials)
    
    transaction_id = str(uuid.uuid4())
    transaction_doc = {
        "id": transaction_id,
        "user_id": user_id,
        "amount": transaction_data.amount,
        "type": transaction_data.type,
        "category": transaction_data.category,
        "description": transaction_data.description,
        "date": transaction_data.date,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.transactions.insert_one(transaction_doc)
    
    return Transaction(**transaction_doc)

@api_router.get("/transactions", response_model=List[Transaction])
async def get_transactions(credentials: HTTPAuthorizationCredentials = Depends(security), limit: int = 100):
    user_id = await verify_token(credentials)
    
    transactions = await db.transactions.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("date", -1).limit(limit).to_list(limit)
    
    return [Transaction(**t) for t in transactions]

@api_router.delete("/transactions/{transaction_id}")
async def delete_transaction(transaction_id: str, credentials: HTTPAuthorizationCredentials = Depends(security)):
    user_id = await verify_token(credentials)
    
    result = await db.transactions.delete_one({"id": transaction_id, "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Transaction not found")
    
    return {"message": "Transaction deleted"}

# ============= AI Routes =============

@api_router.post("/ai/categorize", response_model=CategorizeExpenseResponse)
async def categorize_expense(request: CategorizeExpenseRequest, credentials: HTTPAuthorizationCredentials = Depends(security)):
    await verify_token(credentials)
    
    result = await categorize_with_ai(request.description, request.amount)
    return CategorizeExpenseResponse(**result)

# ============= Questionnaire Routes =============

@api_router.post("/questionnaire", response_model=QuestionnaireResponse)
async def submit_questionnaire(questionnaire: FinancialQuestionnaire, credentials: HTTPAuthorizationCredentials = Depends(security)):
    user_id = await verify_token(credentials)
    
    questionnaire_data = questionnaire.dict()
    questionnaire_data['user_id'] = user_id
    questionnaire_data['completed_at'] = datetime.now(timezone.utc).isoformat()
    
    # Update or insert questionnaire
    await db.questionnaires.update_one(
        {"user_id": user_id},
        {"$set": questionnaire_data},
        upsert=True
    )
    
    return QuestionnaireResponse(
        message="Questionnaire saved successfully",
        questionnaire=questionnaire
    )

@api_router.get("/questionnaire", response_model=FinancialQuestionnaire)
async def get_questionnaire(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user_id = await verify_token(credentials)
    
    questionnaire = await db.questionnaires.find_one({"user_id": user_id}, {"_id": 0})
    
    if not questionnaire:
        raise HTTPException(status_code=404, detail="Questionnaire not found")
    
    return FinancialQuestionnaire(**questionnaire)

@api_router.delete("/questionnaire")
async def reset_questionnaire(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Reset/delete user's questionnaire data"""
    user_id = await verify_token(credentials)
    
    result = await db.questionnaires.delete_one({"user_id": user_id})
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="No questionnaire found to reset")
    
    return {"message": "Financial data reset successfully"}

# ============= Reports Routes =============

@api_router.get("/reports/health-score")
async def get_health_score(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Calculate comprehensive financial health score based on questionnaire data
    Uses age-adjusted benchmarks, asset allocation analysis, and financial stability checkpoints
    """
    user_id = await verify_token(credentials)
    
    # Get user data
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_age = user.get('age', 30)
    
    # Get questionnaire data
    questionnaire = await db.questionnaires.find_one({"user_id": user_id}, {"_id": 0})
    
    if not questionnaire:
        # Return default/minimal score if no questionnaire filled
        return {
            "score": 0,
            "rating": "No Data",
            "message": "Please complete the financial questionnaire to calculate your health score",
            "age": user_age,
            "age_category": "building",
            "components": [],
            "insights": [],
            "financials": {
                "monthly_income": 0,
                "monthly_expenses": 0,
                "monthly_savings": 0,
                "total_assets": 0,
                "total_liabilities": 0,
                "net_worth": 0
            },
            "asset_allocation": {},
            "checkpoints": {}
        }
    
    # Calculate comprehensive health score
    result = calculate_financial_health_score(questionnaire, user_age)
    
    return result

@api_router.get("/reports/health-score-v2")
async def get_health_score_v2(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Calculate comprehensive 10-Factor Financial Health Score (140 points normalized to 100)
    Components: Savings Rate, EMI Tolerance, Emergency Fund, Investment Portfolio, Net Worth,
    Asset Allocation, Financial Habits, Life Insurance, Health Insurance, Vehicle Insurance
    """
    user_id = await verify_token(credentials)
    
    # Get user data
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_age = user.get('age', 30)
    family_members = 1 + user.get('major_members', 0) + user.get('minor_members', 0)
    
    # Get questionnaire data
    questionnaire = await db.questionnaires.find_one({"user_id": user_id}, {"_id": 0})
    
    if not questionnaire:
        return {
            "normalized_score": 0,
            "raw_score": 0,
            "max_points": 140,
            "band": "NO DATA",
            "band_description": "Please complete the financial questionnaire to calculate your health score",
            "components": [],
            "summary": {}
        }
    
    # Prepare data for 10-factor calculation
    monthly_income = (
        questionnaire.get("salary_income", 0) +
        questionnaire.get("business_income", 0) +
        questionnaire.get("rental_property1", 0) +
        questionnaire.get("rental_property2", 0) +
        questionnaire.get("interest_income", 0) +
        questionnaire.get("dividend_income", 0) +
        questionnaire.get("capital_gains", 0) +
        questionnaire.get("freelance_income", 0) +
        questionnaire.get("other_income", 0)
    )
    
    monthly_expenses = (
        questionnaire.get("rent_expense", 0) +
        questionnaire.get("telecom_utilities", 0) +
        questionnaire.get("groceries", 0) +
        questionnaire.get("transportation", 0) +
        questionnaire.get("healthcare", 0) +
        questionnaire.get("education_expenses", 0) +
        questionnaire.get("entertainment", 0) +
        questionnaire.get("shopping", 0) +
        questionnaire.get("insurance_premiums", 0) +
        questionnaire.get("other_expenses", 0) +
        questionnaire.get("home_loan_emi", 0) +
        questionnaire.get("car_loan_emi", 0) +
        questionnaire.get("education_loan_emi", 0) +
        questionnaire.get("personal_loan_emi", 0) +
        questionnaire.get("other_loan_emi", 0)
    )
    
    # Build data dict for calculator
    calc_data = {
        "age": user_age,
        "monthly_income": monthly_income,
        "monthly_expenses": monthly_expenses,
        "family_members": family_members,
        
        # City tier and family situation from questionnaire
        "city_tier": questionnaire.get("city_tier", "tier_2"),
        "family_situation": questionnaire.get("family_situation", "single_stable"),
        "has_credit_card": questionnaire.get("has_credit_card", False),
        
        # EMI data
        "home_loan_emi": questionnaire.get("home_loan_emi", 0),
        "vehicle_loan_emi": questionnaire.get("car_loan_emi", 0),
        "education_loan_emi": questionnaire.get("education_loan_emi", 0),
        "other_loan_emi": questionnaire.get("personal_loan_emi", 0) + questionnaire.get("other_loan_emi", 0),
        
        # Loan interest rates (extract from loans array if available)
        "home_loan_rate": extract_loan_rate(questionnaire.get("loans", []), "Home", 8.5),
        "vehicle_loan_rate": extract_loan_rate(questionnaire.get("loans", []), "Vehicle", 10.0),
        "education_loan_rate": extract_loan_rate(questionnaire.get("loans", []), "Education", 8.0),
        "other_loan_rate": extract_loan_rate(questionnaire.get("loans", []), "Personal", 14.0),
        
        # Assets
        "mutual_funds": questionnaire.get("mutual_funds", 0),
        "stocks": questionnaire.get("stocks", 0),
        "debt_mf": questionnaire.get("debt_mf", 0),
        "pf_nps": questionnaire.get("pf_nps", 0),
        "fd": questionnaire.get("fd", 0),
        "sweep_fd": questionnaire.get("sweep_fd", 0),
        "bonds": questionnaire.get("bonds", 0),
        "real_estate": questionnaire.get("real_estate", 0),
        "gold": questionnaire.get("gold", 0),
        "silver": questionnaire.get("silver", 0),
        "bank_balance": questionnaire.get("bank_balance", 0),
        "liquid_mf": questionnaire.get("liquid_mf", 0),
        
        # Liabilities
        "home_loan_outstanding": questionnaire.get("home_loan_outstanding", 0),
        "vehicle_loan_outstanding": questionnaire.get("car_loan_outstanding", 0),
        "education_loan_outstanding": questionnaire.get("education_loan_outstanding", 0),
        "other_loan_outstanding": questionnaire.get("personal_loan_outstanding", 0) + questionnaire.get("other_loan_outstanding", 0),
        "credit_card_debt": questionnaire.get("credit_card_debt", 0),
        
        # Insurance
        "life_insurance_coverage": questionnaire.get("life_insurance_coverage", 0),
        "life_insurance_premium": questionnaire.get("life_insurance_premium", 0),
        "health_insurance_coverage": questionnaire.get("health_insurance_coverage", 0),
        "health_insurance_premium": questionnaire.get("health_insurance_premium", 0),
        "vehicle_insurance_type": questionnaire.get("vehicle_insurance_type", "none"),
        "vehicle_insurance_premium": questionnaire.get("vehicle_insurance_premium", 0),
        "has_vehicle": questionnaire.get("has_vehicle", False),
        
        # Investment
        "yearly_investment": questionnaire.get("yearly_investment", 0),
        
        # Financial habits
        "financial_habits": {
            "health_insurance": questionnaire.get("habit_health_insurance", "neutral"),
            "term_life_insurance": questionnaire.get("habit_term_life", "neutral"),
            "itr_filing": questionnaire.get("habit_itr_filing", "neutral"),
            "has_credit_card": questionnaire.get("has_credit_card", False),
            "cc_balance": questionnaire.get("habit_cc_balance", "neutral"),
            "personal_loan": questionnaire.get("habit_personal_loan", "neutral"),
            "invest_beyond_fd": questionnaire.get("habit_invest_beyond_fd", "neutral"),
        }
    }
    
    # Calculate 10-factor score
    result = calculate_10_factor_score(calc_data)
    
    return result

@api_router.get("/reports/opportunity-analysis")
async def get_opportunity_analysis(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Analyze financial opportunities and risks using gap analysis.
    Returns saving opportunities and risk reduction needs with actionable recommendations.
    """
    user_id = await verify_token(credentials)
    
    # Get user data
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_age = user.get('age', 30)
    family_members = 1 + user.get('major_members', 0) + user.get('minor_members', 0)
    
    # Get questionnaire data
    questionnaire = await db.questionnaires.find_one({"user_id": user_id}, {"_id": 0})
    
    if not questionnaire:
        return {
            "summary": {
                "total_saving_opportunities": 0,
                "total_annual_savings_potential": 0,
                "total_risk_reduction_opportunities": 0,
                "total_coverage_gap": 0
            },
            "saving_opportunities": [],
            "risk_reductions": [],
            "action_plan": {"high": [], "medium": [], "low": []},
            "metadata": {"age": user_age, "annual_income": 0, "net_worth": 0, "total_assets": 0}
        }
    
    # Build data dict for analyzer
    monthly_income = (
        questionnaire.get("salary_income", 0) +
        questionnaire.get("business_income", 0) +
        questionnaire.get("rental_property1", 0) +
        questionnaire.get("rental_property2", 0) +
        questionnaire.get("interest_income", 0) +
        questionnaire.get("dividend_income", 0) +
        questionnaire.get("capital_gains", 0) +
        questionnaire.get("freelance_income", 0) +
        questionnaire.get("other_income", 0)
    )
    
    monthly_expenses = (
        questionnaire.get("rent_expense", 0) +
        questionnaire.get("telecom_utilities", 0) +
        questionnaire.get("groceries", 0) +
        questionnaire.get("transportation", 0) +
        questionnaire.get("healthcare", 0) +
        questionnaire.get("education_expenses", 0) +
        questionnaire.get("entertainment", 0) +
        questionnaire.get("shopping", 0) +
        questionnaire.get("insurance_premiums", 0) +
        questionnaire.get("other_expenses", 0) +
        questionnaire.get("home_loan_emi", 0) +
        questionnaire.get("car_loan_emi", 0) +
        questionnaire.get("education_loan_emi", 0) +
        questionnaire.get("personal_loan_emi", 0) +
        questionnaire.get("other_loan_emi", 0)
    )
    
    calc_data = {
        "age": user_age,
        "monthly_income": monthly_income,
        "monthly_expenses": monthly_expenses,
        "family_members": family_members,
        
        # Profile
        "city_tier": questionnaire.get("city_tier", "tier_2"),
        "family_situation": questionnaire.get("family_situation", "single_stable"),
        "has_credit_card": questionnaire.get("has_credit_card", False),
        
        # EMI data
        "home_loan_emi": questionnaire.get("home_loan_emi", 0),
        "vehicle_loan_emi": questionnaire.get("car_loan_emi", 0),
        "education_loan_emi": questionnaire.get("education_loan_emi", 0),
        "other_loan_emi": questionnaire.get("personal_loan_emi", 0) + questionnaire.get("other_loan_emi", 0),
        
        # Loan interest rates (extract from loans array if available)
        "home_loan_rate": extract_loan_rate(questionnaire.get("loans", []), "Home", 8.5),
        "vehicle_loan_rate": extract_loan_rate(questionnaire.get("loans", []), "Vehicle", 10.0),
        "education_loan_rate": extract_loan_rate(questionnaire.get("loans", []), "Education", 8.0),
        "other_loan_rate": extract_loan_rate(questionnaire.get("loans", []), "Personal", 14.0),
        
        # Assets - Use *_value fields if available, fallback to original field names
        "bank_balance": questionnaire.get("bank_balance", 0),
        "sweep_fd": questionnaire.get("sweep_fd", 0),
        "liquid_mf": questionnaire.get("liquid_mf", 0),
        "mutual_funds": questionnaire.get("mutual_funds_value", 0) or questionnaire.get("mutual_funds", 0),
        "stocks": questionnaire.get("stocks_value", 0) or questionnaire.get("stocks", 0),
        "debt_mf": questionnaire.get("debt_mf", 0),
        "pf_nps": questionnaire.get("pf_nps_value", 0) or questionnaire.get("pf_nps", 0),
        "fd": questionnaire.get("fd_value", 0) or questionnaire.get("fd", 0) or questionnaire.get("fixed_deposits", 0),
        "real_estate": questionnaire.get("property_value", 0) or questionnaire.get("real_estate", 0),
        "gold": questionnaire.get("gold_value", 0) or questionnaire.get("gold", 0),
        "silver": questionnaire.get("silver_value", 0) or questionnaire.get("silver", 0),
        
        # Liabilities
        "home_loan_outstanding": questionnaire.get("home_loan_outstanding", 0),
        "vehicle_loan_outstanding": questionnaire.get("car_loan_outstanding", 0),
        "education_loan_outstanding": questionnaire.get("education_loan_outstanding", 0),
        "other_loan_outstanding": questionnaire.get("personal_loan_outstanding", 0) + questionnaire.get("other_loan_outstanding", 0),
        "credit_card_debt": questionnaire.get("credit_card_debt", 0),
        
        # Insurance
        "life_insurance_coverage": questionnaire.get("life_insurance_coverage", 0),
        "health_insurance_coverage": questionnaire.get("health_insurance_coverage", 0),
        "vehicle_insurance_type": questionnaire.get("vehicle_insurance_type", "none"),
        "has_vehicle": questionnaire.get("has_vehicle", False),
        
        # Investment
        "yearly_investment": questionnaire.get("yearly_investment", 0),
        
        # Financial habits
        "financial_habits": {
            "health_insurance": questionnaire.get("habit_health_insurance", "neutral"),
            "term_life_insurance": questionnaire.get("habit_term_life", "neutral"),
            "itr_filing": questionnaire.get("habit_itr_filing", "neutral"),
            "has_credit_card": questionnaire.get("has_credit_card", False),
            "cc_balance": questionnaire.get("habit_cc_balance", "neutral"),
            "personal_loan": questionnaire.get("habit_personal_loan", "neutral"),
            "invest_beyond_fd": questionnaire.get("habit_invest_beyond_fd", "neutral"),
        }
    }
    
    # Analyze opportunities
    result = analyze_financial_opportunities(calc_data)
    
    return result

@api_router.get("/reports/pl", response_model=PLStatement)
async def get_pl_statement(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user_id = await verify_token(credentials)
    
    # Get questionnaire data for income and expense breakdown
    questionnaire = await db.questionnaires.find_one({"user_id": user_id}, {"_id": 0})
    
    # Income breakdown from questionnaire
    income_by_category = {}
    if questionnaire:
        income_fields = [
            ("Salary", questionnaire.get("salary_income", 0)),
            ("Business", questionnaire.get("business_income", 0)),
            ("Rental Property 1", questionnaire.get("rental_property1", 0)),
            ("Rental Property 2", questionnaire.get("rental_property2", 0)),
            ("Interest", questionnaire.get("interest_income", 0)),
            ("Dividends", questionnaire.get("dividend_income", 0)),
            ("Capital Gains", questionnaire.get("capital_gains", 0)),
            ("Freelance", questionnaire.get("freelance_income", 0)),
            ("Other Income", questionnaire.get("other_income", 0))
        ]
        income_by_category = {k: v for k, v in income_fields if v and v > 0}
    
    # Expense breakdown from questionnaire
    expenses_by_category = {}
    if questionnaire:
        expense_fields = [
            ("Rent", questionnaire.get("rent_expense", 0)),
            ("EMIs", questionnaire.get("emis", 0)),
            ("Term Insurance", questionnaire.get("term_insurance", 0)),
            ("Health Insurance", questionnaire.get("health_insurance", 0)),
            ("Groceries", questionnaire.get("groceries", 0)),
            ("Food & Dining", questionnaire.get("food_dining", 0)),
            ("Fuel", questionnaire.get("fuel", 0)),
            ("Travel", questionnaire.get("travel", 0)),
            ("Shopping", questionnaire.get("shopping", 0)),
            ("Online Shopping", questionnaire.get("online_shopping", 0)),
            ("Electronics", questionnaire.get("electronics", 0)),
            ("Entertainment", questionnaire.get("entertainment", 0)),
            ("Telecom & Utilities", questionnaire.get("telecom_utilities", 0)),
            ("Healthcare", questionnaire.get("healthcare", 0)),
            ("Education", questionnaire.get("education", 0)),
            ("Vehicle 2W", questionnaire.get("vehicle_2w_1", 0) + questionnaire.get("vehicle_2w_2", 0)),
            ("Vehicle 4W", questionnaire.get("vehicle_4w_1", 0) + questionnaire.get("vehicle_4w_2", 0) + questionnaire.get("vehicle_4w_3", 0)),
            ("Household Help", questionnaire.get("household_maid", 0)),
            ("Cash Withdrawals", questionnaire.get("cash_withdrawals", 0))
        ]
        expenses_by_category = {k: v for k, v in expense_fields if v and v > 0}
    
    total_income = sum(income_by_category.values())
    total_expenses = sum(expenses_by_category.values())
    net_profit_loss = total_income - total_expenses
    
    return PLStatement(
        total_income=total_income,
        total_expenses=total_expenses,
        net_profit_loss=net_profit_loss,
        income_by_category=income_by_category,
        expenses_by_category=expenses_by_category,
        monthly_trend=[]
    )

@api_router.get("/reports/balance-sheet", response_model=BalanceSheet)
async def get_balance_sheet(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user_id = await verify_token(credentials)
    
    # Get questionnaire data for assets and liabilities
    questionnaire = await db.questionnaires.find_one({"user_id": user_id}, {"_id": 0})
    
    # Assets breakdown from questionnaire
    assets_breakdown = {}
    if questionnaire:
        asset_fields = [
            ("Real Estate", questionnaire.get("property_value", 0)),
            ("Vehicles", questionnaire.get("vehicles_value", 0)),
            ("Gold", questionnaire.get("gold_value", 0)),
            ("Silver", questionnaire.get("silver_value", 0)),
            ("Stocks", questionnaire.get("stocks_value", 0)),
            ("Mutual Funds", questionnaire.get("mutual_funds_value", 0)),
            ("PF/NPS", questionnaire.get("pf_nps_value", 0)),
            ("Bank Balance", questionnaire.get("bank_balance", 0)),
            ("Cash in Hand", questionnaire.get("cash_in_hand", 0))
        ]
        assets_breakdown = {k: v for k, v in asset_fields if v and v > 0}
    
    # Liabilities breakdown from questionnaire
    liabilities_breakdown = {}
    if questionnaire:
        liability_fields = [
            ("Home Loan", questionnaire.get("home_loan", 0)),
            ("Personal Loan", questionnaire.get("personal_loan", 0)),
            ("Vehicle Loan", questionnaire.get("vehicle_loan", 0)),
            ("Credit Card", questionnaire.get("credit_card_outstanding", 0))
        ]
        liabilities_breakdown = {k: v for k, v in liability_fields if v and v > 0}
    
    total_assets = sum(assets_breakdown.values())
    total_liabilities = sum(liabilities_breakdown.values())
    net_worth = total_assets - total_liabilities
    
    return BalanceSheet(
        total_assets=total_assets,
        total_liabilities=total_liabilities,
        net_worth=net_worth,
        assets_breakdown=assets_breakdown,
        liabilities_breakdown=liabilities_breakdown
    )

# ============= Setu Account Aggregator Endpoints =============

@api_router.post("/setu/consent/initiate")
async def initiate_setu_consent(
    request: ConsentInitiateRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Initiate consent request for linking bank accounts via Setu AA.
    Returns consent ID and redirect URL for user approval.
    """
    try:
        user_id = await verify_token(credentials)
        
        # Create consent request
        consent_response = await setu_service.create_consent_request(
            phone_number=request.phone_number,
            user_id=user_id,
            data_range_from=datetime.now() - timedelta(days=365),
            data_range_to=datetime.now(),
            consent_duration_months=12
        )
        
        consent_id = consent_response.get('id')
        consent_url = consent_response.get('url')
        
        # Store consent record in MongoDB
        consent_doc = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "consent_id": consent_id,
            "phone_number": request.phone_number,
            "status": "PENDING",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "expires_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
        }
        
        await db.setu_consents.insert_one(consent_doc)
        
        return {
            "success": True,
            "consent_id": consent_id,
            "redirect_url": consent_url,
            "message": "Consent request initiated. User should be redirected to approval URL."
        }
    except Exception as e:
        logger.error(f"Error initiating consent: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/setu/consent/status/{consent_id}")
async def get_setu_consent_status(
    consent_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Check the current status of a consent request.
    Returns PENDING, ACTIVE, REJECTED, or REVOKED.
    """
    try:
        user_id = await verify_token(credentials)
        
        # Get status from Setu
        status_response = await setu_service.get_consent_status(consent_id)
        current_status = status_response.get('status', 'UNKNOWN')
        linked_accounts = status_response.get('accounts', [])
        
        # Update status in MongoDB
        await db.setu_consents.update_one(
            {"consent_id": consent_id},
            {"$set": {
                "status": current_status,
                "linked_accounts": linked_accounts,
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        return {
            "consent_id": consent_id,
            "status": current_status,
            "accounts": linked_accounts
        }
    except Exception as e:
        logger.error(f"Error checking consent status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/setu/financial-data/fetch/{consent_id}")
async def fetch_setu_financial_data(
    consent_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Initiate financial data fetching for an approved consent.
    Creates a data session and fetches financial information.
    """
    try:
        user_id = await verify_token(credentials)
        
        # Verify consent exists and is approved
        consent = await db.setu_consents.find_one({"consent_id": consent_id, "user_id": user_id})
        if not consent:
            raise HTTPException(status_code=404, detail="Consent not found")
        
        if consent.get("status") != "ACTIVE":
            raise HTTPException(status_code=400, detail="Consent not approved")
        
        # Create data session
        session_response = await setu_service.create_data_session(consent_id)
        session_id = session_response.get('id')
        
        # Fetch financial data immediately (in production, this would be async/webhook-based)
        financial_data = await setu_service.fetch_financial_data(session_id)
        
        # Store financial data in MongoDB
        financial_doc = {
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "consent_id": consent_id,
            "session_id": session_id,
            "accounts": financial_data.get('accounts', []),
            "mutualFunds": financial_data.get('mutualFunds', []),
            "insurance": financial_data.get('insurance', []),
            "fetched_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.setu_financial_data.insert_one(financial_doc)
        
        return {
            "success": True,
            "session_id": session_id,
            "message": "Financial data fetched successfully",
            "data": financial_data
        }
    except Exception as e:
        logger.error(f"Error fetching financial data: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/setu/financial-data")
async def get_user_financial_data(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """
    Get all aggregated financial data for the current user.
    Returns bank accounts, mutual funds, and insurance data.
    """
    try:
        user_id = await verify_token(credentials)
        
        # Get latest financial data
        financial_data = await db.setu_financial_data.find_one(
            {"user_id": user_id},
            sort=[("fetched_at", -1)]
        )
        
        if not financial_data:
            return {
                "accounts": [],
                "mutualFunds": [],
                "insurance": [],
                "message": "No financial data found. Please link your bank accounts first."
            }
        
        return {
            "accounts": financial_data.get('accounts', []),
            "mutualFunds": financial_data.get('mutualFunds', []),
            "insurance": financial_data.get('insurance', []),
            "fetched_at": financial_data.get('fetched_at')
        }
    except Exception as e:
        logger.error(f"Error retrieving financial data: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== PAYMENT ENDPOINTS ====================

class CalculatePriceRequest(BaseModel):
    major_members: int = Field(0, ge=0, description="Additional major members (18+)")
    minor_members: int = Field(0, ge=0, description="Minor members (<18)")

class CreateOrderRequest(BaseModel):
    major_members: int = Field(0, ge=0, description="Additional major members (18+)")
    minor_members: int = Field(0, ge=0, description="Minor members (<18)")

class CreateOrderResponse(BaseModel):
    order_id: str
    amount: int
    currency: str
    key_id: str
    plan_name: str
    plan_description: str
    pricing_breakdown: dict

class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    major_members: int = 0
    minor_members: int = 0

@api_router.get("/payment/pricing")
async def get_pricing_info():
    """Get pricing information for the plan"""
    return {
        "base_plan": {
            "name": "ArthVyay Individual Plan",
            "price": PRICING["base_plan"] / 100,
            "description": "Includes primary member (account owner)",
            "currency": "INR"
        },
        "additional_major_member": {
            "price": PRICING["additional_major"] / 100,
            "description": "Per additional major member (18+)",
            "currency": "INR"
        },
        "minor_member": {
            "price": PRICING["additional_minor"] / 100,
            "description": "Per minor member (<18)",
            "currency": "INR"
        },
        "tax_inclusive": True,
        "features": PLANS["individual"]["features"]
    }

@api_router.post("/payment/calculate")
async def calculate_price(request: CalculatePriceRequest):
    """Calculate total price based on family members"""
    pricing = calculate_plan_price(request.major_members, request.minor_members)
    return pricing

@api_router.get("/payment/plans")
async def get_payment_plans():
    """Get available payment plans"""
    return {
        "plans": {
            "individual": {
                "name": PLANS["individual"]["name"],
                "base_amount": PLANS["individual"]["base_amount"] / 100,
                "description": PLANS["individual"]["description"],
                "features": PLANS["individual"]["features"],
                "additional_major_price": PRICING["additional_major"] / 100,
                "minor_price": PRICING["additional_minor"] / 100,
                "tax_inclusive": True
            }
        }
    }

@api_router.post("/payment/create-order", response_model=CreateOrderResponse)
async def create_payment_order(
    request: CreateOrderRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Create a Razorpay order for payment with family members"""
    try:
        user_id = await verify_token(credentials)
        
        # Calculate total price
        pricing = calculate_plan_price(request.major_members, request.minor_members)
        total_amount = pricing["total"]["amount"]
        
        # Check if user already has an active premium subscription
        existing_payment = await db.payments.find_one({
            "user_id": user_id,
            "status": "completed"
        })
        
        if existing_payment:
            raise HTTPException(status_code=400, detail="You already have an active plan. You can download your report from the dashboard.")
        
        # Create Razorpay order
        order = payment_service.create_order(
            amount=total_amount,
            currency="INR",
            receipt=f"rcpt_{user_id[:8]}_{datetime.now().strftime('%Y%m%d%H%M%S')}",
            notes={
                "user_id": user_id,
                "major_members": request.major_members,
                "minor_members": request.minor_members
            }
        )
        
        # Store order in database
        await db.orders.insert_one({
            "order_id": order["id"],
            "user_id": user_id,
            "plan_type": "individual",
            "major_members": request.major_members,
            "minor_members": request.minor_members,
            "amount": total_amount,
            "pricing_breakdown": pricing,
            "status": "created",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        return CreateOrderResponse(
            order_id=order["id"],
            amount=total_amount,
            currency="INR",
            key_id=payment_service.key_id,
            plan_name=PLANS["individual"]["name"],
            plan_description=PLANS["individual"]["description"],
            pricing_breakdown=pricing
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating order: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/payment/verify")
async def verify_payment(
    request: VerifyPaymentRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Verify Razorpay payment and generate report"""
    try:
        user_id = await verify_token(credentials)
        
        # Verify payment signature
        is_valid = payment_service.verify_payment(
            request.razorpay_order_id,
            request.razorpay_payment_id,
            request.razorpay_signature
        )
        
        if not is_valid:
            raise HTTPException(status_code=400, detail="Payment verification failed")
        
        # Get order details to retrieve pricing
        order = await db.orders.find_one({"order_id": request.razorpay_order_id})
        order_amount = order.get("amount") if order else calculate_plan_price(request.major_members, request.minor_members)["total"]["amount"]
        
        # Update order status
        await db.orders.update_one(
            {"order_id": request.razorpay_order_id},
            {"$set": {
                "status": "completed",
                "payment_id": request.razorpay_payment_id,
                "completed_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        # Create payment record
        payment_record = {
            "user_id": user_id,
            "order_id": request.razorpay_order_id,
            "payment_id": request.razorpay_payment_id,
            "plan_type": "individual",
            "major_members": request.major_members,
            "minor_members": request.minor_members,
            "amount": order_amount,
            "status": "completed",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.payments.insert_one(payment_record)
        
        # Generate the report
        report_path = await generate_user_report(user_id, "individual")
        
        # Update user's premium status
        await db.users.update_one(
            {"id": user_id},
            {"$set": {
                "premium_plan": "individual",
                "premium_activated_at": datetime.now(timezone.utc).isoformat(),
                "report_path": report_path,
                "covered_major_members": request.major_members,
                "covered_minor_members": request.minor_members
            }}
        )
        
        return {
            "success": True,
            "message": "Payment successful! Your report is ready.",
            "plan_type": "individual",
            "report_available": True
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error verifying payment: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

async def generate_user_report(user_id: str, plan_type: str) -> str:
    """Generate financial report for user"""
    try:
        # Get user data - try both id formats for compatibility
        user = await db.users.find_one({"id": user_id}, {"_id": 0, "hashed_password": 0})
        if not user:
            user = await db.users.find_one({"_id": user_id}, {"_id": 0, "hashed_password": 0})
        if not user:
            raise Exception("User not found")
        
        # Get questionnaire data
        questionnaire = await db.questionnaires.find_one({"user_id": user_id}, {"_id": 0})
        if not questionnaire:
            raise Exception("Financial data not found. Please complete the questionnaire first.")
        
        # Get health score
        health_score = calculate_financial_health_score(questionnaire, user.get("age", 30))
        
        # Prepare report data
        report_data = {
            "user": {
                "name": user.get("name", "User"),
                "client_id": user.get("client_id", "N/A"),
                "email": user.get("email", "N/A"),
                "age": user.get("age", 30),
                "city": user.get("city", "N/A")
            },
            "health_score": {
                "overall": health_score.get("overall_score", 0),
                "components": health_score.get("component_scores", {})
            },
            "income": {
                "salary": questionnaire.get("salary_income", 0),
                "rental": questionnaire.get("rental_property1", 0) + questionnaire.get("rental_property2", 0),
                "investments": questionnaire.get("interest_income", 0) + questionnaire.get("dividend_income", 0),
                "total_monthly": sum([
                    questionnaire.get("salary_income", 0),
                    questionnaire.get("rental_property1", 0),
                    questionnaire.get("rental_property2", 0),
                    questionnaire.get("business_income", 0),
                    questionnaire.get("interest_income", 0),
                    questionnaire.get("dividend_income", 0),
                    questionnaire.get("freelance_income", 0),
                    questionnaire.get("other_income", 0)
                ])
            },
            "expenses": {
                "rent": questionnaire.get("rent_expense", 0),
                "emis": questionnaire.get("emis", 0),
                "groceries": questionnaire.get("groceries", 0),
                "utilities": questionnaire.get("telecom_utilities", 0),
                "entertainment": questionnaire.get("entertainment", 0),
                "healthcare": questionnaire.get("healthcare", 0),
                "others": sum([
                    questionnaire.get("food_dining", 0),
                    questionnaire.get("fuel", 0),
                    questionnaire.get("travel", 0),
                    questionnaire.get("shopping", 0),
                    questionnaire.get("online_shopping", 0),
                    questionnaire.get("education", 0)
                ]),
                "total_monthly": sum([
                    questionnaire.get("rent_expense", 0),
                    questionnaire.get("emis", 0),
                    questionnaire.get("groceries", 0),
                    questionnaire.get("telecom_utilities", 0),
                    questionnaire.get("entertainment", 0),
                    questionnaire.get("healthcare", 0),
                    questionnaire.get("food_dining", 0),
                    questionnaire.get("fuel", 0),
                    questionnaire.get("travel", 0),
                    questionnaire.get("shopping", 0),
                    questionnaire.get("online_shopping", 0),
                    questionnaire.get("education", 0),
                    questionnaire.get("household_maid", 0)
                ])
            },
            "assets": {
                "property": questionnaire.get("property_value", 0),
                "vehicles": questionnaire.get("vehicles_value", 0),
                "investments": questionnaire.get("stocks_value", 0) + questionnaire.get("mutual_funds_value", 0),
                "savings": questionnaire.get("bank_balance", 0) + questionnaire.get("pf_nps_value", 0),
                "gold": questionnaire.get("gold_value", 0) + questionnaire.get("silver_value", 0),
                "total": sum([
                    questionnaire.get("property_value", 0),
                    questionnaire.get("vehicles_value", 0),
                    questionnaire.get("stocks_value", 0),
                    questionnaire.get("mutual_funds_value", 0),
                    questionnaire.get("bank_balance", 0),
                    questionnaire.get("pf_nps_value", 0),
                    questionnaire.get("gold_value", 0),
                    questionnaire.get("silver_value", 0),
                    questionnaire.get("cash_in_hand", 0)
                ])
            },
            "liabilities": {
                "home_loan": questionnaire.get("home_loan", 0),
                "car_loan": questionnaire.get("vehicle_loan", 0),
                "credit_cards": questionnaire.get("credit_card_outstanding", 0),
                "total": sum([
                    questionnaire.get("home_loan", 0),
                    questionnaire.get("personal_loan", 0),
                    questionnaire.get("vehicle_loan", 0),
                    questionnaire.get("credit_card_outstanding", 0)
                ])
            },
            "insurance": {
                "life": {
                    "covered": questionnaire.get("has_term_insurance", False),
                    "amount": questionnaire.get("term_insurance", 0)
                },
                "health": {
                    "covered": questionnaire.get("has_health_insurance", False),
                    "amount": questionnaire.get("health_insurance", 0)
                },
                "vehicle": {
                    "covered": True,  # Assumed if they have vehicles
                    "amount": questionnaire.get("vehicles_value", 0)
                }
            }
        }
        
        # Generate report using v6 premium template
        reports_dir = Path("/app/backend/reports")
        reports_dir.mkdir(exist_ok=True)
        
        filename = f"ArthSthithi_Report_{user_id}_{plan_type}_{datetime.now().strftime('%Y%m%d%H%M%S')}.pdf"
        filepath = reports_dir / filename
        
        # Prepare data for v6 report generator
        user_data = {
            "name": user.get("name", "User"),
            "client_id": user.get("client_id", "N/A"),
            "city": user.get("city", "India")
        }
        
        # Prepare health score data for v6 format
        health_score_v6 = {
            "score": health_score.get("overall_score", 70),
            "component_scores": health_score.get("component_scores", {}),
            "financials": {
                "monthly_income": report_data["income"]["total_monthly"],
                "monthly_expenses": report_data["expenses"]["total_monthly"],
                "total_assets": report_data["assets"]["total"],
                "total_liabilities": report_data["liabilities"]["total"]
            }
        }
        
        # Prepare questionnaire data for v6
        questionnaire_v6 = {
            "monthly_income": report_data["income"]["total_monthly"],
            "monthly_expenses": report_data["expenses"]["total_monthly"]
        }
        
        # Use the new v6 premium report generator
        from services.report_generator_v6 import create_report_v6
        create_report_v6(str(filepath), user_data, health_score_v6, questionnaire_v6, plan_type)
        
        logger.info(f"Generated v6 premium report for user {user_id}: {filepath}")
        return str(filepath)
        
    except Exception as e:
        logger.error(f"Error generating report: {str(e)}")
        raise

@api_router.get("/payment/status")
async def get_payment_status(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get user's payment and premium status"""
    try:
        user_id = await verify_token(credentials)
        
        # Check for completed payments
        payments = await db.payments.find(
            {"user_id": user_id, "status": "completed"}
        ).to_list(length=10)
        
        # Get user's premium status
        user = await db.users.find_one({"_id": user_id}, {"premium_plan": 1, "report_path": 1})
        
        return {
            "has_premium": bool(payments),
            "premium_plan": user.get("premium_plan") if user else None,
            "payments": [
                {
                    "plan_type": p["plan_type"],
                    "amount": p["amount"] / 100,
                    "date": p["created_at"]
                }
                for p in payments
            ],
            "report_available": bool(user and user.get("report_path"))
        }
        
    except Exception as e:
        logger.error(f"Error getting payment status: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/report/download")
async def download_report(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Download the user's financial report PDF"""
    try:
        user_id = await verify_token(credentials)
        
        # Check if user has premium access
        user = await db.users.find_one({"_id": user_id}, {"premium_plan": 1, "report_path": 1})
        
        if not user or not user.get("premium_plan"):
            raise HTTPException(status_code=403, detail="Premium access required to download report")
        
        report_path = user.get("report_path")
        
        if not report_path or not Path(report_path).exists():
            # Regenerate report if not found
            report_path = await generate_user_report(user_id, user["premium_plan"])
            await db.users.update_one(
                {"_id": user_id},
                {"$set": {"report_path": report_path}}
            )
        
        return FileResponse(
            report_path,
            media_type="application/pdf",
            filename=f"arth-verse_financial_report.pdf"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error downloading report: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/reports/download-pdf")
async def download_reports_pdf(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Download/Generate the user's financial report PDF (for authorized users)"""
    try:
        user_id = await verify_token(credentials)
        
        # Get user data - try both id formats for compatibility
        user = await db.users.find_one({"id": user_id}, {"_id": 0, "hashed_password": 0})
        if not user:
            user = await db.users.find_one({"_id": user_id}, {"_id": 0, "hashed_password": 0})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Get questionnaire data
        questionnaire = await db.questionnaires.find_one({"user_id": user_id}, {"_id": 0})
        if not questionnaire:
            raise HTTPException(status_code=404, detail="Please complete the financial questionnaire first")
        
        # Generate the report
        report_path = await generate_user_report(user_id, "individual")
        
        return FileResponse(
            report_path,
            media_type="application/pdf",
            filename=f"ArthSthithi_Report_{user.get('client_id', 'User')}.pdf"
        )
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error generating report PDF: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


# ==================== ARTHRAKSHAK ENDPOINTS ====================

class InsurancePolicyCreate(BaseModel):
    category: str
    policy_type: str
    insurer_name: str
    policy_number: str
    start_date: str
    end_date: str
    premium_amount: float
    premium_frequency: str
    sum_assured: float
    nominee_added: bool = False
    nominees: List[dict] = []
    document_url: Optional[str] = None

class InsurancePolicyResponse(BaseModel):
    id: str
    user_id: str
    category: str
    policy_type: str
    insurer_name: str
    policy_number: str
    start_date: str
    end_date: str
    premium_amount: float
    premium_frequency: str
    sum_assured: float
    nominee_added: bool
    nominees: List[dict]
    document_url: Optional[str]
    created_at: str
    updated_at: str

class PolicyCoverageUpdate(BaseModel):
    inclusions: dict = {}
    exclusions: dict = {}
    custom_notes: str = ""

class RiskProfileCreate(BaseModel):
    age: int = 0
    marital_status: str = ""
    dependents: int = 0
    earning_members: int = 1
    city_tier: str = "tier1"
    annual_income: float = 0
    outstanding_loans: float = 0
    existing_investments: float = 0
    emergency_fund_months: int = 0
    has_pure_term: bool = False
    total_life_cover: float = 0
    health_cover_type: str = ""
    health_sum_insured: float = 0
    employer_insurance_only: bool = False
    vehicle_cover_type: str = ""
    has_zero_depreciation: bool = False
    has_own_damage: bool = False
    knows_card_benefits: bool = False
    card_accidental_cover: float = 0

@api_router.get("/arthrakshak/policies")
async def get_insurance_policies(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get all insurance policies for the current user"""
    user_id = await verify_token(credentials)
    
    policies = await db.insurance_policies.find(
        {"user_id": user_id},
        {"_id": 0}
    ).to_list(100)
    
    return {"policies": policies}

@api_router.post("/arthrakshak/policies", response_model=InsurancePolicyResponse)
async def create_insurance_policy(
    policy_data: InsurancePolicyCreate,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Create a new insurance policy"""
    user_id = await verify_token(credentials)
    
    policy_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc).isoformat()
    
    policy_doc = {
        "id": policy_id,
        "user_id": user_id,
        "category": policy_data.category,
        "policy_type": policy_data.policy_type,
        "insurer_name": policy_data.insurer_name,
        "policy_number": policy_data.policy_number,
        "start_date": policy_data.start_date,
        "end_date": policy_data.end_date,
        "premium_amount": policy_data.premium_amount,
        "premium_frequency": policy_data.premium_frequency,
        "sum_assured": policy_data.sum_assured,
        "nominee_added": policy_data.nominee_added,
        "nominees": policy_data.nominees,
        "document_url": policy_data.document_url,
        "created_at": now,
        "updated_at": now
    }
    
    await db.insurance_policies.insert_one(policy_doc)
    
    return InsurancePolicyResponse(**policy_doc)

@api_router.put("/arthrakshak/policies/{policy_id}", response_model=InsurancePolicyResponse)
async def update_insurance_policy(
    policy_id: str,
    policy_data: InsurancePolicyCreate,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Update an existing insurance policy"""
    user_id = await verify_token(credentials)
    
    # Check policy exists and belongs to user
    existing = await db.insurance_policies.find_one(
        {"id": policy_id, "user_id": user_id}
    )
    if not existing:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    now = datetime.now(timezone.utc).isoformat()
    
    update_data = {
        "category": policy_data.category,
        "policy_type": policy_data.policy_type,
        "insurer_name": policy_data.insurer_name,
        "policy_number": policy_data.policy_number,
        "start_date": policy_data.start_date,
        "end_date": policy_data.end_date,
        "premium_amount": policy_data.premium_amount,
        "premium_frequency": policy_data.premium_frequency,
        "sum_assured": policy_data.sum_assured,
        "nominee_added": policy_data.nominee_added,
        "nominees": policy_data.nominees,
        "document_url": policy_data.document_url,
        "updated_at": now
    }
    
    await db.insurance_policies.update_one(
        {"id": policy_id},
        {"$set": update_data}
    )
    
    updated = await db.insurance_policies.find_one({"id": policy_id}, {"_id": 0})
    return InsurancePolicyResponse(**updated)

@api_router.delete("/arthrakshak/policies/{policy_id}")
async def delete_insurance_policy(
    policy_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Delete an insurance policy"""
    user_id = await verify_token(credentials)
    
    result = await db.insurance_policies.delete_one(
        {"id": policy_id, "user_id": user_id}
    )
    
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    return {"message": "Policy deleted successfully"}

@api_router.get("/arthrakshak/coverage-checklist/{category}")
async def get_coverage_checklist_endpoint(
    category: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get standard inclusions/exclusions checklist for a policy category"""
    await verify_token(credentials)
    
    try:
        policy_category = PolicyCategory(category)
        checklist = get_coverage_checklist(policy_category)
        return checklist
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid policy category")

@api_router.get("/arthrakshak/policies/{policy_id}/coverage")
async def get_policy_coverage(
    policy_id: str,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get inclusions/exclusions for a specific policy"""
    user_id = await verify_token(credentials)
    
    coverage = await db.policy_coverages.find_one(
        {"policy_id": policy_id, "user_id": user_id},
        {"_id": 0}
    )
    
    if not coverage:
        # Return default coverage based on policy category
        policy = await db.insurance_policies.find_one({"id": policy_id, "user_id": user_id})
        if not policy:
            raise HTTPException(status_code=404, detail="Policy not found")
        
        try:
            category = PolicyCategory(policy["category"])
            checklist = get_coverage_checklist(category)
            return {
                "policy_id": policy_id,
                "inclusions": {item["key"]: item["default"] for item in checklist["inclusions"]},
                "exclusions": {item["key"]: item["default"] for item in checklist["exclusions"]},
                "custom_notes": ""
            }
        except ValueError:
            return {"policy_id": policy_id, "inclusions": {}, "exclusions": {}, "custom_notes": ""}
    
    return coverage

@api_router.put("/arthrakshak/policies/{policy_id}/coverage")
async def update_policy_coverage(
    policy_id: str,
    coverage_data: PolicyCoverageUpdate,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Update inclusions/exclusions for a policy"""
    user_id = await verify_token(credentials)
    
    # Verify policy exists
    policy = await db.insurance_policies.find_one({"id": policy_id, "user_id": user_id})
    if not policy:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    coverage_doc = {
        "policy_id": policy_id,
        "user_id": user_id,
        "inclusions": coverage_data.inclusions,
        "exclusions": coverage_data.exclusions,
        "custom_notes": coverage_data.custom_notes,
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.policy_coverages.update_one(
        {"policy_id": policy_id, "user_id": user_id},
        {"$set": coverage_doc},
        upsert=True
    )
    
    return {"message": "Coverage updated successfully", "coverage": coverage_doc}

@api_router.get("/arthrakshak/risk-profile")
async def get_risk_profile(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get user's risk profile"""
    user_id = await verify_token(credentials)
    
    # Try to get existing profile
    profile = await db.risk_profiles.find_one({"user_id": user_id}, {"_id": 0})
    
    if not profile:
        # Try to pre-fill from user data and questionnaire
        user = await db.users.find_one({"id": user_id}, {"_id": 0})
        questionnaire = await db.questionnaires.find_one({"user_id": user_id}, {"_id": 0})
        
        # Build pre-filled profile
        profile = {
            "user_id": user_id,
            "age": user.get("age", 0) if user else 0,
            "marital_status": user.get("marital_status", "") if user else "",
            "dependents": (user.get("major_members", 0) + user.get("minor_members", 0)) if user else 0,
            "earning_members": 1,
            "city_tier": "tier1",
            "annual_income": 0,
            "outstanding_loans": 0,
            "existing_investments": 0,
            "emergency_fund_months": 0,
            "has_pure_term": False,
            "total_life_cover": 0,
            "health_cover_type": "",
            "health_sum_insured": 0,
            "employer_insurance_only": False,
            "vehicle_cover_type": "",
            "has_zero_depreciation": False,
            "has_own_damage": False,
            "knows_card_benefits": False,
            "card_accidental_cover": 0
        }
        
        if questionnaire:
            # Pre-fill from questionnaire
            monthly_income = sum([
                questionnaire.get("salary_income", 0),
                questionnaire.get("business_income", 0),
                questionnaire.get("rental_property1", 0),
                questionnaire.get("rental_property2", 0),
                questionnaire.get("freelance_income", 0),
                questionnaire.get("other_income", 0)
            ])
            profile["annual_income"] = monthly_income * 12
            
            profile["outstanding_loans"] = sum([
                questionnaire.get("home_loan", 0),
                questionnaire.get("personal_loan", 0),
                questionnaire.get("vehicle_loan", 0)
            ])
            
            profile["existing_investments"] = sum([
                questionnaire.get("stocks_value", 0),
                questionnaire.get("mutual_funds_value", 0),
                questionnaire.get("pf_nps_value", 0)
            ])
            
            profile["has_pure_term"] = questionnaire.get("has_term_insurance", False)
            profile["health_cover_type"] = "individual" if questionnaire.get("has_health_insurance", False) else ""
    
    return profile

@api_router.post("/arthrakshak/risk-profile")
async def save_risk_profile(
    profile_data: RiskProfileCreate,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Save or update user's risk profile"""
    user_id = await verify_token(credentials)
    
    now = datetime.now(timezone.utc).isoformat()
    
    profile_doc = {
        "user_id": user_id,
        **profile_data.dict(),
        "updated_at": now
    }
    
    await db.risk_profiles.update_one(
        {"user_id": user_id},
        {"$set": profile_doc},
        upsert=True
    )
    
    return {"message": "Risk profile saved successfully", "profile": profile_doc}

@api_router.get("/arthrakshak/protection-gap")
async def get_protection_gap(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Calculate and return protection gap analysis"""
    user_id = await verify_token(credentials)
    
    # Get risk profile
    profile_data = await db.risk_profiles.find_one({"user_id": user_id}, {"_id": 0})
    
    if not profile_data:
        # Return default analysis prompting user to fill profile
        return {
            "user_id": user_id,
            "protection_score": 0,
            "life_insurance": {
                "category": "Life Insurance",
                "status": "unknown",
                "message": "Complete your risk profile to evaluate",
                "recommendations": ["Please fill your risk profile questionnaire first"]
            },
            "health_insurance": {
                "category": "Health Insurance",
                "status": "unknown",
                "message": "Complete your risk profile to evaluate",
                "recommendations": ["Please fill your risk profile questionnaire first"]
            },
            "vehicle_insurance": {
                "category": "Vehicle Insurance",
                "status": "unknown",
                "message": "No vehicle insurance added",
                "recommendations": ["Add your vehicle insurance details"]
            },
            "cards_insurance": {
                "category": "Cards Insurance",
                "status": "unknown",
                "message": "Card benefits not reviewed",
                "recommendations": ["Add your credit/debit cards to review benefits"]
            },
            "unprotected_areas": ["Risk profile not completed"],
            "action_items": ["Complete your risk profile to get personalized recommendations"],
            "calculated_at": datetime.now(timezone.utc).isoformat()
        }
    
    # Get policies
    policies_cursor = db.insurance_policies.find({"user_id": user_id}, {"_id": 0})
    policies_data = await policies_cursor.to_list(100)
    
    # Convert to model objects for calculation
    profile = RiskProfile(user_id=user_id, **{k: v for k, v in profile_data.items() if k != "user_id"})
    
    policies = []
    for p in policies_data:
        try:
            policy = InsurancePolicy(
                id=p.get("id"),
                user_id=p.get("user_id"),
                category=PolicyCategory(p.get("category")),
                policy_type=PolicyType(p.get("policy_type")),
                insurer_name=p.get("insurer_name"),
                policy_number=p.get("policy_number"),
                start_date=p.get("start_date"),
                end_date=p.get("end_date"),
                premium_amount=p.get("premium_amount"),
                premium_frequency=PremiumFrequency(p.get("premium_frequency")),
                sum_assured=p.get("sum_assured"),
                nominee_added=p.get("nominee_added", False),
                nominees=p.get("nominees", []),
                document_url=p.get("document_url")
            )
            policies.append(policy)
        except Exception as e:
            logger.warning(f"Skipping policy due to error: {e}")
            continue
    
    # Calculate protection gap
    gap = calculate_protection_gap(profile, policies)
    
    # Convert to dict for response
    return {
        "user_id": gap.user_id,
        "protection_score": gap.protection_score,
        "life_insurance": {
            "category": gap.life_insurance.category,
            "status": gap.life_insurance.status.value,
            "message": gap.life_insurance.message,
            "gap_amount": gap.life_insurance.gap_amount,
            "recommendations": gap.life_insurance.recommendations
        },
        "health_insurance": {
            "category": gap.health_insurance.category,
            "status": gap.health_insurance.status.value,
            "message": gap.health_insurance.message,
            "gap_amount": gap.health_insurance.gap_amount,
            "recommendations": gap.health_insurance.recommendations
        },
        "vehicle_insurance": {
            "category": gap.vehicle_insurance.category,
            "status": gap.vehicle_insurance.status.value,
            "message": gap.vehicle_insurance.message,
            "recommendations": gap.vehicle_insurance.recommendations
        },
        "cards_insurance": {
            "category": gap.cards_insurance.category,
            "status": gap.cards_insurance.status.value,
            "message": gap.cards_insurance.message,
            "recommendations": gap.cards_insurance.recommendations
        },
        "unprotected_areas": gap.unprotected_areas,
        "action_items": gap.action_items,
        "calculated_at": gap.calculated_at
    }

@api_router.get("/arthrakshak/summary")
async def get_arthrakshak_summary(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Get summary of all insurance data for dashboard"""
    user_id = await verify_token(credentials)
    
    # Get all policies
    policies = await db.insurance_policies.find(
        {"user_id": user_id},
        {"_id": 0}
    ).to_list(100)
    
    # Calculate totals by category
    life_policies = [p for p in policies if p.get("category") == "life"]
    health_policies = [p for p in policies if p.get("category") == "health"]
    vehicle_policies = [p for p in policies if p.get("category") == "vehicle"]
    card_policies = [p for p in policies if p.get("category") == "cards"]
    
    total_life_cover = sum(p.get("sum_assured", 0) for p in life_policies)
    total_health_cover = sum(p.get("sum_assured", 0) for p in health_policies)
    total_premium = sum(p.get("premium_amount", 0) for p in policies)
    
    return {
        "total_policies": len(policies),
        "by_category": {
            "life": {
                "count": len(life_policies),
                "total_cover": total_life_cover
            },
            "health": {
                "count": len(health_policies),
                "total_cover": total_health_cover
            },
            "vehicle": {
                "count": len(vehicle_policies)
            },
            "cards": {
                "count": len(card_policies)
            }
        },
        "total_annual_premium": total_premium,
        "policies": policies
    }


# Health check endpoint for Kubernetes probes
@app.get("/")
async def root():
    return {"status": "healthy", "service": "arth-verse-api"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "arth-verse-api"}

# ============= Future Automation Placeholder APIs =============

class IntegrationStatus(BaseModel):
    status: str = "placeholder"
    message: str
    module: str
    version: str = "0.1.0"
    ready: bool = False

@api_router.get("/integrations/account-aggregator")
async def account_aggregator_placeholder(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Placeholder for Account Aggregator integration - auto-fetch bank/MF/insurance data."""
    await verify_token(credentials)
    return IntegrationStatus(
        status="placeholder",
        message="Account Aggregator integration is under development. This will enable automated fetching of bank accounts, mutual funds, and insurance policies via Setu/Sahamati AA framework.",
        module="account_aggregator",
        version="0.1.0",
        ready=False
    )

@api_router.get("/integrations/email-parsing")
async def email_parsing_placeholder(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Placeholder for Email Parsing - extract financial data from emails."""
    await verify_token(credentials)
    return IntegrationStatus(
        status="placeholder",
        message="Email Parsing module is under development. This will automatically parse bank statements, investment confirmations, and insurance renewal emails to keep your financial profile updated.",
        module="email_parsing",
        version="0.1.0",
        ready=False
    )

@api_router.get("/integrations/sms-parsing")
async def sms_parsing_placeholder(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Placeholder for SMS Parsing - extract transaction data from SMS."""
    await verify_token(credentials)
    return IntegrationStatus(
        status="placeholder",
        message="SMS Parsing module is under development. This will parse bank transaction SMS, credit card alerts, and UPI notifications to auto-categorize your expenses.",
        module="sms_parsing",
        version="0.1.0",
        ready=False
    )

@api_router.get("/integrations/portfolio-sync")
async def portfolio_sync_placeholder(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Placeholder for Investment Portfolio Sync - real-time portfolio tracking."""
    await verify_token(credentials)
    return IntegrationStatus(
        status="placeholder",
        message="Portfolio Sync module is under development. This will connect to CAMS/KFintech/CDSL to provide real-time mutual fund, stock, and NPS portfolio tracking.",
        module="portfolio_sync",
        version="0.1.0",
        ready=False
    )

@api_router.get("/integrations/status")
async def all_integrations_status(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Get status of all automation integration modules."""
    await verify_token(credentials)
    return {
        "integrations": [
            {"module": "account_aggregator", "status": "development", "ready": False, "description": "Auto-fetch bank/MF/insurance data via AA framework"},
            {"module": "email_parsing", "status": "planned", "ready": False, "description": "Parse financial emails for auto-updates"},
            {"module": "sms_parsing", "status": "planned", "ready": False, "description": "Parse transaction SMS for expense tracking"},
            {"module": "portfolio_sync", "status": "planned", "ready": False, "description": "Real-time investment portfolio sync"},
        ]
    }

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Health check endpoint for Kubernetes probes
@app.get("/")
async def root():
    return {"status": "healthy", "service": "arth-verse-api"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "arth-verse-api"}

@app.on_event("startup")
async def startup_db_client():
    try:
        # Verify MongoDB connection on startup
        await client.admin.command('ping')
        logger.info("Successfully connected to MongoDB")
    except Exception as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        # Don't raise - let the app start and handle DB errors per request

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()