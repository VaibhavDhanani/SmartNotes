from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.models import User
from app.schemas.user_schema import UserCreate, UserOut, UserLogin
from app.auth.auth_schema import Token, LoginResponse
from app.auth.jwt_helper import pwd_context, create_access_token
from fastapi import HTTPException, status


async def create_user(user: UserCreate, db: AsyncSession) -> dict:
    result = await db.execute(select(User).where(User.email == user.email))
    existing_user = result.scalar_one_or_none()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already registered.",
        )

    hashed_pwd = pwd_context.hash(user.password)
    new_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_pwd,
        full_name=user.full_name,
        gender=user.gender,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return UserOut(
        user_id=new_user.user_id,
        username=new_user.username,
        email=new_user.email,
        full_name=new_user.full_name,
        gender=new_user.gender,
    )


async def authenticate_user(user: UserLogin, db: AsyncSession) -> dict:
    result = await db.execute(select(User).where(User.email == user.email))
    db_user = result.scalar_one_or_none()

    if not db_user or not pwd_context.verify(user.password, db_user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials"
        )

    user = await db.execute(select(User).where(User.email == user.email))
    return user.scalar_one()
