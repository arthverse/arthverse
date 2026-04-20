from fastapi import APIRouter, Depends
from fastapi.security import HTTPAuthorizationCredentials
from routes.deps import (
    security, verify_token, get_db, hash_password, verify_password, create_token,
    UserCreate, UserLogin, UserResponse, AuthResponse,
    HTTPException, BaseModel
)
from services.user_id_generator import generate_user_login_id_async, validate_date_of_birth
from datetime import datetime, timezone
import uuid

router = APIRouter(prefix="/auth", tags=["auth"])


class SetPasswordRequest(BaseModel):
    client_id: str
    password: str
    confirm_password: str


@router.post("/register", response_model=AuthResponse)
async def register(user_data: UserCreate):
    db = get_db()
    if not validate_date_of_birth(user_data.date_of_birth):
        raise HTTPException(status_code=400, detail="Invalid date of birth format. Use YYYY-MM-DD or DD-MM-YYYY")

    existing_user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    if user_data.pan_number:
        existing_pan = await db.users.find_one({"pan_number": user_data.pan_number}, {"_id": 0})
        if existing_pan:
            raise HTTPException(status_code=400, detail="PAN number already registered")

    client_id = await generate_user_login_id_async(
        name=user_data.name,
        date_of_birth=user_data.date_of_birth,
        db_collection=db.users
    )

    user_id = str(uuid.uuid4())
    user_doc = {
        "id": user_id,
        "client_id": client_id,
        "email": user_data.email,
        "password_hash": "",
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
    token = create_token(user_id)

    user_response = UserResponse(
        id=user_id, client_id=client_id, email=user_data.email,
        name=user_data.name, mobile_number=user_data.mobile_number,
        pan_number=user_data.pan_number, date_of_birth=user_data.date_of_birth,
        city=user_data.city, created_at=user_doc['created_at'],
        networth=0, needs_password_setup=True
    )
    return AuthResponse(token=token, user=user_response)


@router.post("/login", response_model=AuthResponse)
async def login(credentials: UserLogin):
    db = get_db()
    user = await db.users.find_one({"client_id": credentials.client_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if user.get('needs_password_setup', False) or not user.get('password_hash'):
        raise HTTPException(status_code=403, detail="Please set up your password first")

    if not verify_password(credentials.password, user['password_hash']):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token(user['id'])
    user_response = UserResponse(
        id=user['id'], client_id=user['client_id'], email=user['email'],
        name=user['name'], mobile_number=user['mobile_number'],
        pan_number=user.get('pan_number', ''), date_of_birth=user.get('date_of_birth', ''),
        city=user['city'], created_at=user['created_at'],
        networth=user.get('networth', 0), needs_password_setup=False
    )
    return AuthResponse(token=token, user=user_response)


@router.post("/set-password")
async def set_password(request: SetPasswordRequest):
    db = get_db()
    if request.password != request.confirm_password:
        raise HTTPException(status_code=400, detail="Passwords do not match")
    if len(request.password) < 6:
        raise HTTPException(status_code=400, detail="Password must be at least 6 characters")

    user = await db.users.find_one({"client_id": request.client_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    await db.users.update_one(
        {"client_id": request.client_id},
        {"$set": {"password_hash": hash_password(request.password), "needs_password_setup": False}}
    )

    token = create_token(user['id'])
    user_response = UserResponse(
        id=user['id'], client_id=user['client_id'], email=user['email'],
        name=user['name'], mobile_number=user['mobile_number'],
        pan_number=user.get('pan_number', ''), date_of_birth=user.get('date_of_birth', ''),
        city=user['city'], created_at=user['created_at'],
        networth=user.get('networth', 0), needs_password_setup=False
    )
    return AuthResponse(token=token, user=user_response)


@router.get("/me", response_model=UserResponse)
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    db = get_db()
    user_id = await verify_token(credentials)
    user = await db.users.find_one({"id": user_id}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return UserResponse(
        id=user['id'], client_id=user['client_id'], email=user['email'],
        name=user['name'], mobile_number=user['mobile_number'],
        pan_number=user.get('pan_number', ''), date_of_birth=user.get('date_of_birth', ''),
        city=user['city'], created_at=user['created_at'],
        networth=user.get('networth', 0),
        needs_password_setup=user.get('needs_password_setup', False)
    )
