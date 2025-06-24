from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.future import select
from app.models.models import Directory, Document, AccessDocument, User
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_db
from app.schemas.directory_schema import DirectoryCreate, DirectoryUpdate

router = APIRouter(
    prefix="/directories",
    tags=["directories"],
    responses={404: {"description": "Not found"}},
)


@router.get("/{user_id}")
async def get_directories(user_id: int, db: AsyncSession = Depends(get_db)):
    query = select(Directory).where(Directory.user_id == user_id)
    result = await db.execute(query)
    directories = result.scalars().all()
    return directories


@router.post("/")
async def create_directory(
    directory: DirectoryCreate, db: AsyncSession = Depends(get_db)
):
    try:
        query = select(Directory).where(Directory.user_id == directory.user_id)
        result = await db.execute(query)
        directories = result.scalars().all()
        if any(d.dir_name == directory.dir_name for d in directories):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Directory with this name already exists.",
            )
            
        new_directory = Directory(**directory.model_dump())
        db.add(new_directory)
        await db.commit()
        await db.refresh(new_directory)
        return new_directory
    
    except HTTPException as http_exc:
        raise http_exc
    
    except Exception as e:
        print("Unexpected error:", e)
        raise HTTPException(status_code=500, detail="Internal Server Error")

        
        


@router.put("/{dir_id}")
async def update_directory(
    dir_id: str, directory_update: DirectoryUpdate, db: AsyncSession = Depends(get_db)
):
    result = await db.execute(select(Directory).where(Directory.dir_id == dir_id))
    directory = result.scalar_one_or_none()

    if not directory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Directory not found"
        )

    update_data = directory_update.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(directory, key, value)

    await db.commit()
    await db.refresh(directory)

    return directory


@router.delete("/{dir_id}")
async def delete_directory(dir_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Directory).where(Directory.dir_id == dir_id))
    directory = result.scalar_one_or_none()

    if not directory:
        return {"error": "Directory not found"}

    await db.delete(directory)
    await db.commit()

    return {"message": f"Directory {dir_id} deleted successfully"}


@router.get("/tree/{user_id}")
async def get_file_tree(user_id: int, db: AsyncSession = Depends(get_db)):
    
    
    dir_result = await db.execute(
        select(Directory).where(Directory.user_id == user_id)
    )
    directories = dir_result.scalars().all()
    
    doc_result = await db.execute(
        select(Document).where(Document.user_id == user_id)
    )
    documents = doc_result.scalars().all()
    
    # Build directory map
    dir_map = {}
    for directory in directories:
        dir_data = {
            "id": directory.dir_id,
            "name": directory.dir_name,
            "type": "folder",
            "is_stared":directory.is_stared,
            "parent_id": directory.parent_id,
            "created_at": directory.created_at.isoformat() if directory.created_at else None,
            "updated_at": directory.updated_at.isoformat() if directory.updated_at else None,
            "color": directory.color,
            "children": []
        }
        dir_map[directory.dir_id] = dir_data
    
    
    root_directories = []
    for dir_id, dir_data in dir_map.items():
        if dir_data["parent_id"] is None:
            root_directories.append(dir_data)
        else:
            parent_id = dir_data["parent_id"]
            if parent_id in dir_map:
                dir_map[parent_id]["children"].append(dir_data)
    

    for document in documents:
        doc_data = {
            "id": document.doc_id,
            "name": document.doc_name,
            "content": document.content,
            "is_stared": document.is_stared,
            "type": "document",
            "directory_id": document.directory_id,
            "created_at": document.created_at.isoformat() if document.created_at else None,
            "updated_at": document.updated_at.isoformat() if document.updated_at else None
        }
        
        directory_id = document.directory_id
        if directory_id in dir_map:
            dir_map[directory_id]["children"].append(doc_data)
    

    access_result = await db.execute(
        select(AccessDocument, Document)
        .join(Document, AccessDocument.doc_id == Document.doc_id)
        .where(
            AccessDocument.user_id == user_id,
            Document.user_id != user_id
        )
    )
    shared_documents = access_result.all()
    
    # Create shared documents section
    shared_docs_list = []
    for access_doc, document in shared_documents:
        
        user = await db.execute(
            select(User).where(User.user_id == document.user_id)
        )
        user = user.scalar_one()
        doc_data = {
            "id": document.doc_id,
            "name": document.doc_name,
            "content": document.content,
            "type": "document",
            "is_stared": document.is_stared,
            "access_type": "shared",
            "permission_type": access_doc.permission,
            "owner_email": user.email,
            "shared_at": access_doc.created_at.isoformat() if access_doc.created_at else None,
            "created_at": document.created_at.isoformat() if document.created_at else None,
            "updated_at": document.updated_at.isoformat() if document.updated_at else None
        }
        shared_docs_list.append(doc_data)

    result = {
        "user_id": user_id,
        "owned_structure": root_directories,
        "shared_documents": shared_docs_list
    }
    
    return result
