from fastapi import APIRouter, Depends, status, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_db
from app.schemas.user_schema import UserOut, UserCreate, UserLogin, UserResponse
from app.auth.auth_schema import Token, LoginResponse
from app.auth.auth_service import create_user, authenticate_user
from app.auth.jwt_helper import verify_token
from datetime import datetime, timedelta
from app.auth.jwt_helper import create_access_token
from decouple import config

router = APIRouter(tags=["auth"])

ACCESS_TOKEN_EXPIRE_MINUTES = int(config("ACCESS_TOKEN_EXPIRE_MINUTES", default="30"))

@router.post("/signup", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def signup(user: UserCreate, db: AsyncSession = Depends(get_db)):
    new_user = await create_user(user, db)
    return new_user


@router.post("/login", response_model=LoginResponse)
async def login(user: UserLogin, db: AsyncSession = Depends(get_db)):
    """
    Authenticate user and return token with user information in one response
    """
    user = await authenticate_user(user, db)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"username": user.username},
        expires_delta=access_token_expires
    )
    
    return LoginResponse(
        access_token=access_token,
        expires_in=int(access_token_expires.total_seconds()),
        user=UserResponse(
            user_id=str(user.user_id),
            username=user.username,
            email=user.email,
            full_name=user.full_name,
            gender=user.gender
        )
    )



@router.get("/verify-token")
async def verify_user_token(request: Request):
    # Extract the token from the Authorization header
    auth_header = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or missing token")

    token = auth_header.split(" ")[1]
    try:
        user_data = verify_token(token)
        return {"user": user_data}
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")