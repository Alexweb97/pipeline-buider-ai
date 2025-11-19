"""
User Model
"""
from datetime import datetime
from uuid import uuid4

from sqlalchemy import Integer, String, Boolean, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, relationship

from app.db.base import Base
from app.db.compat import mapped_column


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

    # Security fields for account lockout
    failed_login_attempts: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    locked_until: Mapped[datetime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )

    # Relationships
    pipelines = relationship("Pipeline", back_populates="creator")
    connections = relationship("Connection", back_populates="creator")
    executions = relationship("PipelineExecution", foreign_keys="PipelineExecution.triggered_by", back_populates="triggered_by_user")
    auth_logs = relationship("AuthLog", back_populates="user", cascade="all, delete-orphan")
    active_sessions = relationship("ActiveSession", back_populates="user", cascade="all, delete-orphan")
    audit_events = relationship("AuditEvent", back_populates="user")
    uploaded_files = relationship("UploadedFile", back_populates="user", cascade="all, delete-orphan")

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

    @property
    def is_locked(self) -> bool:
        """Check if account is currently locked"""
        if self.locked_until is None:
            return False
        return datetime.utcnow() < self.locked_until

    def reset_login_attempts(self) -> None:
        """Reset failed login attempts and unlock account"""
        self.failed_login_attempts = 0
        self.locked_until = None

    def increment_failed_attempts(self, lockout_duration_minutes: int = 15) -> None:
        """
        Increment failed login attempts and lock account if threshold reached

        Args:
            lockout_duration_minutes: Duration to lock account in minutes
        """
        from datetime import timedelta

        self.failed_login_attempts += 1
        if self.failed_login_attempts >= 5:
            self.locked_until = datetime.utcnow() + timedelta(minutes=lockout_duration_minutes)
