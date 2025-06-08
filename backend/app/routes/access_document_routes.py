from fastapi import HTTPException, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session, selectinload
from fastapi import APIRouter, Depends
from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.models import AccessDocument, User
from app.db import get_db
from app.schemas.access_document import AccessDocumentCreate, AccessDocumentResponse, PermissionTypeEnum

router = APIRouter(
    prefix="/access_document",
    tags=["Access Document"],
    responses={404: {"description": "Not found"}},
)


@router.get("/")
async def get_access_document(db: AsyncSession = Depends(get_db)):
    query = select(AccessDocument)
    result = await db.execute(query)
    access_document = result.scalars().all()
    return access_document
    
    
@router.get("/user/{user_id}")
async def get_access_document_user(user_id: int, db: AsyncSession = Depends(get_db)):
    query = select(AccessDocument.document).where(AccessDocument.user_id == user_id)
    result = await db.execute(query)
    access_document = result.scalars().all()
    return access_document


@router.get("/document/{doc_id}")
async def get_access_document_document(doc_id: str, db: AsyncSession = Depends(get_db)):
    query = (
        select(AccessDocument)
        .options(selectinload(AccessDocument.user))
        .where(AccessDocument.doc_id == doc_id)
    )

    result = await db.execute(query)
    access_documents = result.scalars().all()

    # Transform to desired format
    response = []
    for access_doc in access_documents:
        response.append({
            "user_id": access_doc.user.user_id,
            "username": access_doc.user.username,
            "email": access_doc.user.email,
            "permission": access_doc.permission
        })

    return response


@router.post("/", response_model=AccessDocumentResponse)
async def create_access_document(
        access_document: AccessDocumentCreate,
        db: AsyncSession = Depends(get_db)
):
    try:
        doc_id = access_document.doc_id
        email = access_document.email
        permission = access_document.permission

        # Add validation for required fields
        if not email or not email.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is required"
            )

        if not doc_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Document ID is required"
            )

        if isinstance(permission, PermissionTypeEnum):
            permission = permission.value

        try:
            result = await db.execute(select(User).where(User.email == email))
            user = result.scalar_one_or_none()

        except Exception as db_error:

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error occurred while searching for user"
            )

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User with this email not found"
            )

        try:
            new_access = AccessDocument(
                doc_id=doc_id,
                user_id=user.user_id,
                permission=permission
            )
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

    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        import traceback
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create access document"
        )