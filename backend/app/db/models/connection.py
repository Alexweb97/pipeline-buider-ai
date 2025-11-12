"""
Connection Model - Database and API connections
"""
from uuid import uuid4

from sqlalchemy import String, Text, Boolean, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Connection(Base):
    """Connection model for data sources"""

    __tablename__ = "connections"

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    created_by: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=False,
        index=True,
    )

    name: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    description: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        index=True,
    )  # postgres, mysql, mongodb, s3, api, etc.

    config: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False,
    )  # Encrypted connection details

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    last_tested_at: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    test_status: Mapped[str | None] = mapped_column(
        String(20),
        nullable=True,
    )  # success, failed

    # Relationships
    creator = relationship("User", back_populates="connections")

    def __repr__(self) -> str:
        return f"<Connection {self.name} ({self.type})>"
