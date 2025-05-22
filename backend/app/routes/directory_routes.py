from fastapi import FastAPI, APIRouter, Depends, HTTPException, status
from sqlalchemy.future import select
from app.models.models import Directory, Document
from sqlalchemy.ext.asyncio import AsyncSession
from app.db import get_db
from app.schemas.directory_schema import DirectoryCreate, DirectoryUpdate, DirectoryContents
from typing import List,Optional

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
    new_directory = Directory(**directory.model_dump())
    db.add(new_directory)
    await db.commit()
    await db.refresh(new_directory)
    return new_directory


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


@router.get("/{dir_id}/contents", response_model=DirectoryContents)
async def get_directory_contents(dir_id: str, db: AsyncSession = Depends(get_db)):
    """
    Get all directories and documents inside a specific directory
    For root dir_id, get top-level directories (with null parent_id)
    """
    if dir_id == "root":
        # Get top-level directories (with null parent_id)
        dir_result = await db.execute(
            select(Directory).where(Directory.parent_id == None)
        )
        directories = dir_result.scalars().all()

        # Get documents in those directories
        if directories:
            dir_ids = [directory.dir_id for directory in directories]
            doc_result = await db.execute(
                select(Document).where(Document.directory_id.in_(dir_ids))
            )
            documents = doc_result.scalars().all()
        else:
            documents = []

        # Create a virtual root directory
        return {
            "dir_id": "root",
            "dir_name": "Root",
            "parent_id": None,
            "children": [
                *[{"type": "folder", **dir.__dict__} for dir in directories],
                *[{"type": "document", **doc.__dict__} for doc in documents],
            ],
        }
    else:
        # Check if directory exists
        dir_result = await db.execute(
            select(Directory).where(Directory.dir_id == dir_id)
        )
        directory = dir_result.scalar_one_or_none()

        if not directory:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Directory not found"
            )

        # Get subdirectories
        subdir_result = await db.execute(
            select(Directory).where(Directory.parent_id == dir_id)
        )
        subdirectories = subdir_result.scalars().all()

        # Get documents
        docs_result = await db.execute(
            select(Document).where(Document.directory_id == dir_id)
        )
        documents = docs_result.scalars().all()

        # Create response
        return {
            "dir_id": directory.dir_id,
            "dir_name": directory.dir_name,
            "parent_id": directory.parent_id,
            "children": [
                *[{"type": "folder", **dir.__dict__} for dir in subdirectories],
                *[{"type": "document", **doc.__dict__} for doc in documents],
            ],
        }


@router.put("/{dir_id}/move")
async def move_directory(
    dir_id: str, new_parent_id: Optional[str] = None, db: AsyncSession = Depends(get_db)
):
    """Move a directory to a new parent directory"""
    if dir_id == "root":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot move root directory"
        )

    # Get the directory to move
    dir_result = await db.execute(select(Directory).where(Directory.dir_id == dir_id))
    directory = dir_result.scalar_one_or_none()

    if not directory:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Directory not found"
        )

    # Handle root as a special case
    if new_parent_id == "root":
        new_parent_id = None

    # If moving to another directory (not root), verify it exists
    if new_parent_id is not None:
        parent_result = await db.execute(
            select(Directory).where(Directory.dir_id == new_parent_id)
        )
        parent = parent_result.scalar_one_or_none()

        if not parent:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Parent directory not found",
            )

        # Check for circular references
        if new_parent_id == dir_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot move directory into itself",
            )

        # Check if a directory with the same name exists in the target directory
        existing_result = await db.execute(
            select(Directory).where(
                Directory.parent_id == new_parent_id,
                Directory.dir_name == directory.dir_name,
                Directory.dir_id != dir_id,
            )
        )
        existing = existing_result.scalar_one_or_none()

        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A directory with this name already exists in the destination folder",
            )

    # Update the directory
    directory.parent_id = new_parent_id
    await db.commit()
    await db.refresh(directory)

    return directory


@router.get("/tree/{user_id}")
async def get_file_tree(user_id: int, db: AsyncSession = Depends(get_db)):
    """Get the complete file tree for a user"""
    dir_result = await db.execute(select(Directory).where(Directory.user_id == user_id))
    directories = dir_result.scalars().all()
    doc_result = await db.execute(select(Document).where(Document.user_id == user_id))
    documents = doc_result.scalars().all()
    dir_map = {
        directory.dir_id: {"type": "folder", **directory.__dict__, "children": []}
        for directory in directories
    }
    result = []
    for dir_id, dir_data in dir_map.items():
        if dir_data["parent_id"] is None:
            result.append(dir_data)
        else:
            parent_id = dir_data["parent_id"]
            if parent_id in dir_map:
                dir_map[parent_id]["children"].append(dir_data)

    for document in documents:
        doc_data = {"type": "document", **document.__dict__}
        directory_id = document.directory_id
        if directory_id in dir_map:
            dir_map[directory_id]["children"].append(doc_data)

    return result
