from fastapi import FastAPI, Depends
from app.db import AsyncSession, get_db
from app.auth.auth_routes import router as auth_router
from app.auth.jwt_helper import get_current_user
from app.auth.auth_schema import TokenData

app = FastAPI()

app.include_router(auth_router, prefix="/auth")

@app.get("/")
async def read_root(db: AsyncSession = Depends(get_db)):
    return {"message": "Database connection is active!"}

@app.get("/protected")
async def checkjwt(user: TokenData = Depends(get_current_user)):
    return {"message": f"Hello, {user.username}."}
