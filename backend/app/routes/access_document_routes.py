from fastapi import APIRouter, Depends
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.models import AccessDocument
from app.db import get_db
from app.schemas.access_document import AccessDocumentCreate, AccessDocumentResponse, PermissionTypeEnum

router = APIRouter(
    prefix="/access_doument",
    tags=["Access Document"],
    responses={404: {"description": "Not found"}},
)


@router.get("/")
async def get_access_document(db: AsyncSession = Depends(get_db)):
    query = select(AccessDocument)
    result = await db.execute(query)
    access_document = result.scalars().all()
    return access_document
    
    
@router.get("/{user_id}")
async def get_access_document_user(user_id: int, db: AsyncSession = Depends(get_db)):
    query = select(AccessDocument.document).where(AccessDocument.user_id == user_id)
    result = await db.execute(query)
    access_document = result.scalars().all()
    return access_document


@router.get("/{doc_id}")
async def get_access_document_document(doc_id: str, db: AsyncSession = Depends(get_db)):
    query = select(AccessDocument.user, AccessDocument.permission_type).where(AccessDocument.doc_id == doc_id)
    result = await db.execute(query)
    access_document = result.scalars().all()
    return access_document


from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError

@router.post("/", response_model=AccessDocumentResponse)
async def create_access_document(
    access_document: AccessDocumentCreate, 
    db: AsyncSession = Depends(get_db)
):
    try:
        # Create new access document
        
        access_data = access_document.model_dump()
        if isinstance(access_data['permission_type'], PermissionTypeEnum):
            access_data['permission_type'] = access_data['permission_type'].value
        
        new_access = AccessDocument(**access_data)
        db.add(new_access)
        await db.commit()
        await db.refresh(new_access)
        
        return AccessDocumentResponse.model_validate(new_access)
        
    except IntegrityError as e:
        await db.rollback()
        if "unique_doc_user_access" in str(e):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="User already has access to this document"
            )
        elif "foreign key" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid document_id or user_id"
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Database constraint violation"
            )
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create access document"
        )