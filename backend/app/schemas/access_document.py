from pydantic import BaseModel, ConfigDict
from enum import Enum
from datetime import datetime

class PermissionTypeEnum(str, Enum):
    READ = "read"
    WRITE = "write"
    ADMIN = "admin"

class AccessDocumentCreate(BaseModel):
    doc_id: str
    user_id: int
    permission_type: PermissionTypeEnum = PermissionTypeEnum.READ

class AccessDocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    access_doc_id: str
    doc_id: str
    user_id: int
    permission_type: PermissionTypeEnum
    created_at: datetime
    updated_at: datetime