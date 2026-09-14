# MARK: Imports
import uuid
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from app.schemas import UserCreate, UserLogin, UserResponse, Token
from app.core.database import get_db
from app.core.security import hash_password, verify_password, create_access_token, get_current_user_token

# MARK: Router Setup
router = APIRouter(tags=["Authentication & Users"])

# MARK: Endpoints
@router.post("/auth/register", response_model=Token, status_code=status.HTTP_201_CREATED)
@router.post("/users/register", response_model=Token, status_code=status.HTTP_201_CREATED)
async def register_user(user_in: UserCreate):
    db = get_db()
    users_col = db["users"]
    
    existing = await users_col.find_one({"email": user_in.email.lower()})
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User with this email already registered"
        )
    
    user_id = f"usr_{uuid.uuid4().hex[:12]}"
    now_str = datetime.now(timezone.utc).isoformat()
    
    doc = {
        "_id": user_id,
        "email": user_in.email.lower(),
        "full_name": user_in.full_name,
        "hashed_password": hash_password(user_in.password),
        "role": user_in.role or "Financial Analyst",
        "created_at": now_str
    }
    
    await users_col.insert_one(doc)
    
    user_resp = UserResponse(
        id=user_id,
        email=doc["email"],
        full_name=doc["full_name"],
        role=doc["role"],
        created_at=doc["created_at"]
    )
    
    token_str = create_access_token(subject=user_id)
    return Token(access_token=token_str, token_type="bearer", user=user_resp)

@router.post("/auth/login", response_model=Token)
@router.post("/users/login", response_model=Token)
async def login_user(login_in: UserLogin):
    db = get_db()
    users_col = db["users"]
    
    user_doc = await users_col.find_one({"email": login_in.email.lower()})
    if not user_doc or not verify_password(login_in.password, user_doc.get("hashed_password", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_resp = UserResponse(
        id=user_doc["_id"],
        email=user_doc["email"],
        full_name=user_doc["full_name"],
        role=user_doc.get("role", "Financial Analyst"),
        created_at=user_doc.get("created_at", datetime.now(timezone.utc).isoformat())
    )
    
    token_str = create_access_token(subject=user_doc["_id"])
    return Token(access_token=token_str, token_type="bearer", user=user_resp)

@router.get("/auth/me", response_model=UserResponse)
@router.get("/users/me", response_model=UserResponse)
async def get_current_user_profile(token_data: dict = Depends(get_current_user_token)):
    user_id = token_data.get("sub")
    db = get_db()
    users_col = db["users"]
    
    user_doc = await users_col.find_one({"_id": user_id})
    if not user_doc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
        
    return UserResponse(
        id=user_doc["_id"],
        email=user_doc["email"],
        full_name=user_doc["full_name"],
        role=user_doc.get("role", "Financial Analyst"),
        created_at=user_doc.get("created_at", datetime.now(timezone.utc).isoformat())
    )
