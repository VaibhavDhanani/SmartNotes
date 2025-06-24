from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class DocumentBase(BaseModel):
    doc_name: str = Field(..., min_length=1, max_length=50)
    content: Optional[str] = Field(default="")

class DocumentCreate(DocumentBase):
    directory_id: str
    user_id: int

class DocumentUpdate(BaseModel):
    doc_name: Optional[str] = Field(None, min_length=1, max_length=50)
    content: Optional[str] = None
    directory_id: Optional[str] = None
    is_stared: Optional[bool] = False

class DocumentContent(BaseModel):
    content: str

class DocumentOut(DocumentBase):
    doc_id: str
    directory_id: str
    is_stared: bool
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True