from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
import uuid

class UserBase(BaseModel):
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    gender: Optional[str] = None

class UserCreate(UserBase):
    password: str
    
    
class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    gender: Optional[str] = None
    password: Optional[str] = None

class UserResponse(UserBase):
    user_id: int
    
    class Config:
        orm_mode = True
        
        
class UserOut(BaseModel):
    user_id: int
    username: str
    email: EmailStr
    full_name: Optional[str] = None
    gender: Optional[str] = None
