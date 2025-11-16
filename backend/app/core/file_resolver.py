"""
File Resolver - Helper to resolve file_id to actual file path
"""
from pathlib import Path
from uuid import UUID

from sqlalchemy.orm import Session

from app.db.models.uploaded_file import UploadedFile


class FileNotFoundError(Exception):
    """Raised when file_id cannot be resolved"""
    pass


def resolve_file_path(file_id: str | UUID, db: Session) -> Path:
    """
    Resolve a file_id to its actual file path

    Args:
        file_id: UUID of the uploaded file
        db: Database session

    Returns:
        Path to the uploaded file

    Raises:
        FileNotFoundError: If file doesn't exist or is deleted
    """
    # Convert string to UUID if needed
    if isinstance(file_id, str):
        try:
            file_id = UUID(file_id)
        except ValueError as e:
            raise FileNotFoundError(f"Invalid file_id format: {file_id}") from e

    # Query the database for the file
    uploaded_file = db.query(UploadedFile).filter(
        UploadedFile.id == file_id,
        UploadedFile.is_deleted == False  # noqa: E712
    ).first()

    if not uploaded_file:
        raise FileNotFoundError(
            f"File with id {file_id} not found or has been deleted"
        )

    # Return the file path
    file_path = Path(uploaded_file.file_path)

    # Verify file actually exists on disk
    if not file_path.exists():
        raise FileNotFoundError(
            f"File {file_path} not found on disk (file_id: {file_id})"
        )

    return file_path


def get_file_info(file_id: str | UUID, db: Session) -> dict:
    """
    Get information about an uploaded file

    Args:
        file_id: UUID of the uploaded file
        db: Database session

    Returns:
        Dictionary with file information
    """
    if isinstance(file_id, str):
        file_id = UUID(file_id)

    uploaded_file = db.query(UploadedFile).filter(
        UploadedFile.id == file_id,
        UploadedFile.is_deleted == False  # noqa: E712
    ).first()

    if not uploaded_file:
        raise FileNotFoundError(f"File with id {file_id} not found")

    return {
        'id': str(uploaded_file.id),
        'filename': uploaded_file.filename,
        'original_filename': uploaded_file.original_filename,
        'file_path': uploaded_file.file_path,
        'file_size': uploaded_file.file_size,
        'mime_type': uploaded_file.mime_type,
        'file_extension': uploaded_file.file_extension,
        'created_at': uploaded_file.created_at,
    }
