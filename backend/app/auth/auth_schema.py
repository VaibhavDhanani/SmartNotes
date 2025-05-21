from pydantic import BaseModel, EmailStr, Field
from app.schemas.user_schema import UserResponse

class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str = ""

class LoginResponse(BaseModel):
    """Response schema for login endpoint"""
    access_token: str
    token_type: str = "bearer"
    expires_in: int = Field(..., description="Token expiration time in seconds")
    user: UserResponse
    
    class Config:
        schema_extra = {
            "example": {
                "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                "token_type": "bearer",
                "expires_in": 3600,
                "user": {
                    "user_id": "550e8400-e29b-41d4-a716-446655440000",
                    "username": "johndoe",
                    "email": "john.doe@example.com",
                    "full_name": "John Doe",
                }
            }
        }