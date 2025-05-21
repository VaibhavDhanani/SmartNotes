from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.models.models import Document, Directory
from app.db import get_db
from app.schemas.document_schema import DocumentCreate, DocumentUpdate, DocumentOut, DocumentContent
from typing import List,Optional
from uuid import uuid4

router = APIRouter(
    prefix="/documents",
    tags=["documents"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=DocumentOut)
async def create_document(document: DocumentCreate, db: AsyncSession = Depends(get_db)):
    new_document = Document(**document.dict())
    db.add(new_document)
    await db.commit()
    await db.refresh(new_document)
    return new_document


@router.get("/{doc_id}", response_model=DocumentOut)
async def get_document(doc_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Document).where(Document.doc_id == doc_id))
    document = result.scalar_one_or_none()

    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    
    return document


@router.put("/{doc_id}", response_model=DocumentOut)
async def update_document(doc_id: str, document_update: DocumentUpdate, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Document).where(Document.doc_id == doc_id))
    document = result.scalar_one_or_none()

    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    
    for key, value in document_update.dict(exclude_unset=True).items():
        setattr(document, key, value)
    
    await db.commit()
    await db.refresh(document)
    return document


@router.delete("/{doc_id}")
async def delete_document(doc_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Document).where(Document.doc_id == doc_id))
    document = result.scalar_one_or_none()

    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    
    await db.delete(document)
    await db.commit()
    return {"message": f"Document {doc_id} deleted successfully"}



@router.get("/directory/{directory_id}", response_model=List[DocumentOut])
async def get_documents_by_directory(directory_id: str, db: AsyncSession = Depends(get_db)):
    """Get all documents in a specific directory"""
    # Handle root as a special case
    if directory_id == "root":
        # Get all top-level directories
        dir_result = await db.execute(select(Directory).where(Directory.parent_id == None))
        directories = dir_result.scalars().all()
        
        # Get documents in those directories
        if directories:
            dir_ids = [directory.dir_id for directory in directories]
            doc_result = await db.execute(select(Document).where(Document.directory_id.in_(dir_ids)))
            documents = doc_result.scalars().all()
        else:
            documents = []
    else:
        # Verify directory exists
        dir_result = await db.execute(select(Directory).where(Directory.dir_id == directory_id))
        directory = dir_result.scalar_one_or_none()
        
        if not directory:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Directory not found")
        
        # Get documents in the directory
        doc_result = await db.execute(select(Document).where(Document.directory_id == directory_id))
        documents = doc_result.scalars().all()
    
    return documents

@router.put("/{doc_id}/content", response_model=DocumentOut)
async def update_document_content(doc_id: str, content_update: DocumentContent, db: AsyncSession = Depends(get_db)):
    """Update only the content of a document"""
    result = await db.execute(select(Document).where(Document.doc_id == doc_id))
    document = result.scalar_one_or_none()
    
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    
    document.content = content_update.content
    await db.commit()
    await db.refresh(document)
    
    return document

@router.put("/{doc_id}/move", response_model=DocumentOut)
async def move_document(doc_id: str, new_directory_id: str, db: AsyncSession = Depends(get_db)):
    """Move a document to a different directory"""
    # Get the document to move
    doc_result = await db.execute(select(Document).where(Document.doc_id == doc_id))
    document = doc_result.scalar_one_or_none()
    
    if not document:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Document not found")
    
    # Handle root as a special case
    if new_directory_id == "root":
        # Find first top-level directory or create one
        dir_result = await db.execute(select(Directory).where(Directory.parent_id == None))
        directory = dir_result.scalar_one_or_none()
        
        if not directory:
            # Create a default directory
            directory = Directory(
                dir_id=str(uuid4()),
                dir_name="My Documents",
                user_id=document.user_id,
                parent_id=None
            )
            db.add(directory)
            await db.commit()
            await db.refresh(directory)
        
        new_directory_id = directory.dir_id
    
    # Verify the target directory exists
    dir_result = await db.execute(select(Directory).where(Directory.dir_id == new_directory_id))
    directory = dir_result.scalar_one_or_none()
    
    if not directory:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Target directory not found")
    
    # Check if a document with the same name exists in the target directory
    existing_result = await db.execute(
        select(Document).where(
            Document.directory_id == new_directory_id,
            Document.doc_name == document.doc_name,
            Document.doc_id != doc_id
        )
    )
    existing = existing_result.scalar_one_or_none()
    
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A document with this name already exists in the destination folder"
        )
    
    # Update the document's directory
    document.directory_id = new_directory_id
    await db.commit()
    await db.refresh(document)
    
    return document

@router.get("/user/{user_id}", response_model=List[DocumentOut])
async def get_all_user_documents(user_id: int, db: AsyncSession = Depends(get_db)):
    """Get all documents for a specific user"""
    result = await db.execute(select(Document).where(Document.user_id == user_id))
    documents = result.scalars().all()
    return documents
