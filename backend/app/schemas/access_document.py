from pydantic import BaseModel, ConfigDict
from enum import Enum
from datetime import datetime

class PermissionTypeEnum(str, Enum):
    VIEW = "view"
    EDIT = "edit"
    OWNER = "owner"

class AccessDocumentCreate(BaseModel):
    doc_id: str
    email: str
    permission: PermissionTypeEnum = PermissionTypeEnum.VIEW

class AccessDocumentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    access_doc_id: str
    doc_id: str
    user_id: int
    permission: PermissionTypeEnum
    created_at: datetime
    updated_at: datetime