"""
File Upload API Routes
"""
import os
import uuid
import mimetypes
import json
from pathlib import Path
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Query
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session

from app.api.dependencies.database import get_db
from app.api.dependencies.auth import get_current_user
from app.db.models.uploaded_file import UploadedFile
from app.db.models.user import User
from app.schemas.uploaded_file import UploadedFileResponse, UploadedFileList

router = APIRouter()

# Upload directory configuration
UPLOAD_DIR = Path("/app/uploads")
UPLOAD_DIR.mkdir(exist_ok=True, parents=True)

# Maximum file size (100 MB)
MAX_FILE_SIZE = 100 * 1024 * 1024

# Allowed file extensions
ALLOWED_EXTENSIONS = {
    ".csv", ".json", ".xlsx", ".xls", ".parquet", ".txt",
    ".tsv", ".xml", ".yaml", ".yml"
}


def get_file_extension(filename: str) -> str:
    """Extract file extension from filename"""
    return Path(filename).suffix.lower()


def is_allowed_file(filename: str) -> bool:
    """Check if file extension is allowed"""
    return get_file_extension(filename) in ALLOWED_EXTENSIONS


@router.post("", response_model=UploadedFileResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(
    file: UploadFile = File(...),
    db: Annotated[Session, Depends(get_db)] = None,
    current_user: Annotated[User, Depends(get_current_user)] = None,
):
    """
    Upload a file to the server

    Allowed formats: CSV, JSON, Excel, Parquet, TXT, TSV, XML, YAML
    Maximum size: 100 MB
    """
    # Validate file
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No filename provided"
        )

    # Check file extension
    if not is_allowed_file(file.filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )

    # Generate unique filename
    file_extension = get_file_extension(file.filename)
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = UPLOAD_DIR / unique_filename

    # Read and save file
    file_size = 0
    try:
        with open(file_path, "wb") as buffer:
            while chunk := await file.read(8192):  # Read in 8KB chunks
                file_size += len(chunk)

                # Check file size limit
                if file_size > MAX_FILE_SIZE:
                    buffer.close()
                    file_path.unlink()  # Delete partially uploaded file
                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail=f"File too large. Maximum size: {MAX_FILE_SIZE // (1024*1024)} MB"
                    )

                buffer.write(chunk)
    except Exception as e:
        # Clean up on error
        if file_path.exists():
            file_path.unlink()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to save file: {str(e)}"
        )

    # Detect MIME type
    mime_type = mimetypes.guess_type(file.filename)[0] or "application/octet-stream"

    # Create metadata (could be extended with file analysis)
    file_metadata = json.dumps({
        "original_mime_type": file.content_type,
        "detected_mime_type": mime_type,
    })

    # Create database record
    uploaded_file = UploadedFile(
        filename=unique_filename,
        original_filename=file.filename,
        file_path=str(file_path),
        file_size=file_size,
        mime_type=mime_type,
        file_extension=file_extension,
        uploaded_by=current_user.id,
        file_metadata=file_metadata,
    )

    db.add(uploaded_file)
    db.commit()
    db.refresh(uploaded_file)

    return UploadedFileResponse.model_validate(uploaded_file)


@router.get("", response_model=UploadedFileList)
def list_uploaded_files(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Annotated[Session, Depends(get_db)] = None,
    current_user: Annotated[User, Depends(get_current_user)] = None,
):
    """
    List uploaded files for current user
    """
    query = db.query(UploadedFile).filter(
        UploadedFile.uploaded_by == current_user.id,
        UploadedFile.is_deleted == False  # noqa: E712
    )

    total = query.count()
    files = query.order_by(UploadedFile.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()

    return UploadedFileList(
        files=[UploadedFileResponse.model_validate(f) for f in files],
        total=total
    )


@router.get("/{file_id}", response_model=UploadedFileResponse)
def get_uploaded_file(
    file_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)] = None,
    current_user: Annotated[User, Depends(get_current_user)] = None,
):
    """
    Get uploaded file details
    """
    uploaded_file = db.query(UploadedFile).filter(
        UploadedFile.id == file_id,
        UploadedFile.uploaded_by == current_user.id,
        UploadedFile.is_deleted == False  # noqa: E712
    ).first()

    if not uploaded_file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )

    return UploadedFileResponse.model_validate(uploaded_file)


@router.get("/{file_id}/download")
async def download_file(
    file_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)] = None,
    current_user: Annotated[User, Depends(get_current_user)] = None,
):
    """
    Download an uploaded file
    """
    uploaded_file = db.query(UploadedFile).filter(
        UploadedFile.id == file_id,
        UploadedFile.uploaded_by == current_user.id,
        UploadedFile.is_deleted == False  # noqa: E712
    ).first()

    if not uploaded_file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )

    file_path = Path(uploaded_file.file_path)
    if not file_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found on server"
        )

    return FileResponse(
        path=file_path,
        filename=uploaded_file.original_filename,
        media_type=uploaded_file.mime_type
    )


@router.delete("/{file_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_file(
    file_id: uuid.UUID,
    db: Annotated[Session, Depends(get_db)] = None,
    current_user: Annotated[User, Depends(get_current_user)] = None,
):
    """
    Soft delete an uploaded file
    """
    uploaded_file = db.query(UploadedFile).filter(
        UploadedFile.id == file_id,
        UploadedFile.uploaded_by == current_user.id,
        UploadedFile.is_deleted == False  # noqa: E712
    ).first()

    if not uploaded_file:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )

    # Soft delete
    from datetime import datetime
    uploaded_file.is_deleted = True
    uploaded_file.deleted_at = datetime.utcnow()

    db.commit()

    return None
