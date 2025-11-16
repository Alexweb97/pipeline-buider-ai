"""
Uploaded File Schemas
"""
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field


class UploadedFileBase(BaseModel):
    """Base uploaded file schema"""

    original_filename: str = Field(..., description="Original filename")
    file_size: int = Field(..., ge=0, description="File size in bytes")
    mime_type: str = Field(..., description="MIME type")


class UploadedFileCreate(UploadedFileBase):
    """Schema for creating uploaded file record"""

    filename: str = Field(..., description="Stored filename")
    file_path: str = Field(..., description="File path on server")
    file_extension: str = Field(..., description="File extension")
    file_metadata: str | None = Field(None, description="Additional metadata as JSON")


class UploadedFileResponse(UploadedFileBase):
    """Schema for uploaded file response"""

    id: UUID
    filename: str
    file_extension: str
    uploaded_by: UUID
    created_at: datetime
    is_deleted: bool
    file_metadata: str | None

    model_config = {"from_attributes": True}


class UploadedFileList(BaseModel):
    """Schema for list of uploaded files"""

    files: list[UploadedFileResponse]
    total: int
