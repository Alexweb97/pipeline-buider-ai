"""
Pipeline Model
"""
from uuid import uuid4

from sqlalchemy import String, Text, Boolean, ForeignKey, ARRAY
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class Pipeline(Base):
    """Pipeline configuration model"""

    __tablename__ = "pipelines"

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

    version: Mapped[str] = mapped_column(
        String(20),
        default="1.0.0",
        nullable=False,
    )

    config: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False,
    )

    schedule: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    is_scheduled: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(50),
        default="draft",
        nullable=False,
        index=True,
    )

    tags: Mapped[list[str]] = mapped_column(
        ARRAY(Text),
        default=[],
        nullable=False,
    )

    default_params: Mapped[dict] = mapped_column(
        JSONB,
        default={},
        nullable=False,
    )

    # Relationships
    creator = relationship("User", back_populates="pipelines")
    executions = relationship("PipelineExecution", back_populates="pipeline")

    def __repr__(self) -> str:
        return f"<Pipeline {self.name} ({self.status})>"
