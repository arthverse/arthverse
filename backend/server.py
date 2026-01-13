from fastapi import FastAPI, APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
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
from services.user_id_generator import generate_user_login_id_async, validate_date_of_birth
from services.payment_service import payment_service, PLANS
from services.report_generator import create_report

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

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
    password: str
    name: str
    mobile_number: str
    date_of_birth: str  # Required for login ID generation (YYYY-MM-DD or DD-MM-YYYY)
    age: int
    city: str
    marital_status: str
    major_members: int = 0  # Adults >18, excluding user
    minor_members: int = 0  # Below 18
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
    date_of_birth: str
    age: int
    city: str
    marital_status: str
    major_members: int = 0
    minor_members: int = 0
    created_at: str
    networth: float = 0

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
    
    # Predefined Assets
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
    
    # Generate unique User Login ID
    client_id = await generate_user_login_id_async(
        name=user_data.name,
        date_of_birth=user_data.date_of_birth,
        db_collection=db.users
    )
    
    # Create user
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "client_id": client_id,  # This is now the User Login ID
        "email": user_data.email,
        "password_hash": hash_password(user_data.password),
        "name": user_data.name,
        "mobile_number": user_data.mobile_number,
        "date_of_birth": user_data.date_of_birth,
        "age": user_data.age,
        "city": user_data.city,
        "marital_status": user_data.marital_status,
        "major_members": user_data.major_members,
        "minor_members": user_data.minor_members,
        "data_privacy_consent": user_data.data_privacy_consent,
        "networth": 0,
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
        date_of_birth=user_data.date_of_birth,
        age=user_data.age,
        city=user_data.city,
        marital_status=user_data.marital_status,
        major_members=user_data.major_members,
        minor_members=user_data.minor_members,
        created_at=user_doc['created_at'],
        networth=0
    )
    
    return AuthResponse(token=token, user=user_response)

@api_router.post("/auth/login", response_model=AuthResponse)
async def login(credentials: UserLogin):
    user = await db.users.find_one({"client_id": credentials.client_id}, {"_id": 0})
    if not user or not verify_password(credentials.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = create_token(user['id'])
    
    user_response = UserResponse(
        id=user['id'],
        client_id=user['client_id'],
        email=user['email'],
        name=user['name'],
        mobile_number=user['mobile_number'],
        date_of_birth=user.get('date_of_birth', ''),
        age=user['age'],
        city=user['city'],
        marital_status=user['marital_status'],
        major_members=user.get('major_members', 0),
        minor_members=user.get('minor_members', 0),
        created_at=user['created_at'],
        networth=user.get('networth', 0)
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
        date_of_birth=user.get('date_of_birth', ''),
        age=user['age'],
        city=user['city'],
        marital_status=user['marital_status'],
        major_members=user.get('major_members', 0),
        minor_members=user.get('minor_members', 0),
        created_at=user['created_at'],
        networth=user.get('networth', 0)
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

@api_router.get("/reports/pl", response_model=PLStatement)
async def get_pl_statement(credentials: HTTPAuthorizationCredentials = Depends(security)):
    user_id = await verify_token(credentials)
    
    transactions = await db.transactions.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    
    total_income = 0
    total_expenses = 0
    income_by_category = {}
    expenses_by_category = {}
    
    for t in transactions:
        if t['type'] == 'income':
            total_income += t['amount']
            category = t.get('category', 'Other')
            income_by_category[category] = income_by_category.get(category, 0) + t['amount']
        else:
            total_expenses += t['amount']
            category = t.get('category', 'Other')
            expenses_by_category[category] = expenses_by_category.get(category, 0) + t['amount']
    
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
    
    transactions = await db.transactions.find({"user_id": user_id}, {"_id": 0}).to_list(1000)
    
    total_assets = sum(t['amount'] for t in transactions if t['type'] == 'income')
    total_liabilities = sum(t['amount'] for t in transactions if t['type'] == 'expense')
    net_worth = total_assets - total_liabilities
    
    assets_breakdown = {'Cash': total_assets}
    liabilities_breakdown = {'Expenses': total_liabilities}
    
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

class CreateOrderRequest(BaseModel):
    plan_type: str = Field(..., description="Plan type: 'individual' or 'family'")

class CreateOrderResponse(BaseModel):
    order_id: str
    amount: int
    currency: str
    key_id: str
    plan_name: str
    plan_description: str

class VerifyPaymentRequest(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    plan_type: str

@api_router.get("/payment/plans")
async def get_payment_plans():
    """Get available payment plans"""
    return {
        "plans": {
            plan_id: {
                "name": plan["name"],
                "amount": plan["amount"] / 100,  # Convert paise to rupees
                "description": plan["description"],
                "features": plan["features"]
            }
            for plan_id, plan in PLANS.items()
        }
    }

@api_router.post("/payment/create-order", response_model=CreateOrderResponse)
async def create_payment_order(
    request: CreateOrderRequest,
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    """Create a Razorpay order for payment"""
    try:
        user_id = await verify_token(credentials)
        
        if request.plan_type not in PLANS:
            raise HTTPException(status_code=400, detail="Invalid plan type")
        
        plan = PLANS[request.plan_type]
        
        # Check if user already has an active premium subscription
        existing_payment = await db.payments.find_one({
            "user_id": user_id,
            "status": "completed",
            "plan_type": request.plan_type
        })
        
        if existing_payment:
            raise HTTPException(status_code=400, detail="You already have this plan. You can download your report from the dashboard.")
        
        # Create Razorpay order
        order = payment_service.create_order(
            amount=plan["amount"],
            currency="INR",
            receipt=f"rcpt_{user_id[:8]}_{datetime.now().strftime('%Y%m%d%H%M%S')}",
            notes={
                "user_id": user_id,
                "plan_type": request.plan_type
            }
        )
        
        # Store order in database
        await db.orders.insert_one({
            "order_id": order["id"],
            "user_id": user_id,
            "plan_type": request.plan_type,
            "amount": plan["amount"],
            "status": "created",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        return CreateOrderResponse(
            order_id=order["id"],
            amount=plan["amount"],
            currency="INR",
            key_id=payment_service.key_id,
            plan_name=plan["name"],
            plan_description=plan["description"]
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
            "plan_type": request.plan_type,
            "amount": PLANS[request.plan_type]["amount"],
            "status": "completed",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.payments.insert_one(payment_record)
        
        # Generate the report
        report_path = await generate_user_report(user_id, request.plan_type)
        
        # Update user's premium status
        await db.users.update_one(
            {"_id": user_id},
            {"$set": {
                "premium_plan": request.plan_type,
                "premium_activated_at": datetime.now(timezone.utc).isoformat(),
                "report_path": report_path
            }}
        )
        
        return {
            "success": True,
            "message": "Payment successful! Your report is ready.",
            "plan_type": request.plan_type,
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
        # Get user data
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
        
        # Generate report
        reports_dir = Path("/app/backend/reports")
        reports_dir.mkdir(exist_ok=True)
        
        filename = f"report_{user_id}_{plan_type}_{datetime.now().strftime('%Y%m%d%H%M%S')}.pdf"
        filepath = reports_dir / filename
        
        create_report(str(filepath), report_data, plan_type)
        
        logger.info(f"Generated report for user {user_id}: {filepath}")
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

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()