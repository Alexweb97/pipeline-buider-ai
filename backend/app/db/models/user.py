"""
User Model
"""
from datetime import datetime
from uuid import uuid4

from sqlalchemy import String, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class User(Base):
    """User model"""

    __tablename__ = "users"

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    email: Mapped[str] = mapped_column(
        String(255),
        unique=True,
        index=True,
        nullable=False,
    )

    username: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        index=True,
        nullable=False,
    )

    password_hash: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    full_name: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    role: Mapped[str] = mapped_column(
        String(50),
        default="viewer",
        nullable=False,
        index=True,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    email_verified: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    last_login_at: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # Relationships
    pipelines = relationship("Pipeline", back_populates="creator")
    connections = relationship("Connection", back_populates="creator")
    executions = relationship("PipelineExecution", foreign_keys="PipelineExecution.triggered_by", back_populates="triggered_by_user")

    def __repr__(self) -> str:
        return f"<User {self.username} ({self.email})>"

    @property
    def is_admin(self) -> bool:
        """Check if user is admin"""
        return self.role == "admin"

    @property
    def is_developer(self) -> bool:
        """Check if user is developer"""
        return self.role in ("admin", "developer")
