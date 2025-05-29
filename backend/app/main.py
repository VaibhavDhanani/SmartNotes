from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from app.db import AsyncSession, get_db
from app.auth.auth_routes import router as auth_router
from app.routes.user_routes import router as user_router
from app.routes.directory_routes import router as directory_router
from app.routes.document_routes import router as document_router
from app.routes.websocket import router as websocket_router
from app.routes.access_document_routes import router as access_document_router
from app.auth.jwt_helper import get_current_user
from app.auth.auth_schema import TokenData

origins = [
    "http://localhost:5173",  # Vite React default port
    "http://127.0.0.1:3000",
]

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],  # Allow all headers
)
app.include_router(websocket_router)

app.include_router(auth_router, prefix="/auth")
app.include_router(user_router)
app.include_router(directory_router)
app.include_router(document_router)
app.include_router(access_document_router)
@app.get("/")
async def read_root(db: AsyncSession = Depends(get_db)):
    return {"message": "Database connection is active!"}


@app.get("/protected")
async def checkjwt(user: TokenData = Depends(get_current_user)):
    return {"message": f"Hello, {user.username}."}
