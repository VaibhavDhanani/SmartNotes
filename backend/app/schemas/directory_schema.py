# directory_schema.py

from pydantic import BaseModel, Field
from typing import Optional, List, Union, Dict, Any
from datetime import datetime
import uuid

class DirectoryBase(BaseModel):
    dir_name: str = Field(..., min_length=1, max_length=50)
    color: Optional[str] = Field(default="#99e810", pattern="^#[0-9a-fA-F]{6}$")

class DirectoryCreate(DirectoryBase):
    parent_id: Optional[str] = None
    user_id: int

class DirectoryUpdate(BaseModel):
    dir_name: Optional[str] = Field(None, min_length=1, max_length=50)
    color: Optional[str] = Field(None, pattern="^#[0-9a-fA-F]{6}$")
    parent_id: Optional[str] = None

class DirectoryResponse(DirectoryBase):
    dir_id: str
    parent_id: Optional[str] = None
    user_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True

class DirectoryTree(DirectoryResponse):
    children: List['DirectoryTree'] = []

class DirectoryContentsItem(BaseModel):
    type: str  # "folder" or "document"

class DirectoryContents(BaseModel):
    dir_id: str
    dir_name: str
    parent_id: Optional[str] = None
    children: List[Dict[str, Any]] = []