"""
Uploaded File Model - For file upload management
"""
from datetime import datetime
from uuid import uuid4

from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class UploadedFile(Base):
    """Uploaded files for use in pipelines"""

    __tablename__ = "uploaded_files"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    filename = Column(String(255), nullable=False)
    original_filename = Column(String(255), nullable=False)
    file_path = Column(String(500), nullable=False)  # Path on server
    file_size = Column(Integer, nullable=False)  # Size in bytes
    mime_type = Column(String(100), nullable=False)
    file_extension = Column(String(20), nullable=False)

    # Ownership
    uploaded_by = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Metadata
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    is_deleted = Column(Boolean, default=False, nullable=False)
    deleted_at = Column(DateTime, nullable=True)

    # Additional file metadata (encoding detection, row count, etc.)
    file_metadata = Column(String(1000), nullable=True)  # JSON string

    # Relationship
    user = relationship("User", back_populates="uploaded_files")

    def __repr__(self):
        return f"<UploadedFile {self.original_filename} by {self.uploaded_by}>"
