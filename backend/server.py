from fastapi import FastAPI, APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
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
    age: int
    city: str
    marital_status: str
    no_of_dependents: int
    data_privacy_consent: bool
    monthly_income: float = 0

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
    age: int
    city: str
    marital_status: str
    no_of_dependents: int
    monthly_income: float
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
    # Check if user exists
    existing_user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Generate unique client ID
    client_id = f"AV{str(uuid.uuid4())[:8].upper()}"
    
    # Create user
    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "client_id": client_id,
        "email": user_data.email,
        "password_hash": hash_password(user_data.password),
        "name": user_data.name,
        "mobile_number": user_data.mobile_number,
        "age": user_data.age,
        "city": user_data.city,
        "marital_status": user_data.marital_status,
        "no_of_dependents": user_data.no_of_dependents,
        "data_privacy_consent": user_data.data_privacy_consent,
        "monthly_income": user_data.monthly_income,
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
        age=user_data.age,
        city=user_data.city,
        marital_status=user_data.marital_status,
        no_of_dependents=user_data.no_of_dependents,
        monthly_income=user_data.monthly_income,
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
        age=user['age'],
        city=user['city'],
        marital_status=user['marital_status'],
        no_of_dependents=user['no_of_dependents'],
        monthly_income=user['monthly_income'],
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
        age=user['age'],
        city=user['city'],
        marital_status=user['marital_status'],
        no_of_dependents=user['no_of_dependents'],
        monthly_income=user['monthly_income'],
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
        user_id = await verify_token(credentials.credentials)
        
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
        user_id = await verify_token(credentials.credentials)
        
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
        user_id = await verify_token(credentials.credentials)
        
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
        user = await get_current_user(credentials.credentials)
        user_id = user['id']
        
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