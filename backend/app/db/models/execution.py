"""
Execution Model - Pipeline execution tracking
"""
from uuid import uuid4

from sqlalchemy import String, Text, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, relationship

from app.db.base import Base
from app.db.compat import mapped_column


class PipelineExecution(Base):
    """Pipeline execution tracking model"""

    __tablename__ = "pipeline_executions"

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    pipeline_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("pipelines.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )

    triggered_by: Mapped[UUID | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id"),
        nullable=True,
        index=True,
    )

    status: Mapped[str] = mapped_column(
        String(50),
        default="pending",
        nullable=False,
        index=True,
    )  # pending, running, success, failed, cancelled

    trigger_type: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
    )  # manual, scheduled, webhook

    started_at: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    completed_at: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    duration_seconds: Mapped[int | None] = mapped_column(
        Integer,
        nullable=True,
    )

    params: Mapped[dict] = mapped_column(
        JSONB,
        default={},
        nullable=False,
    )

    result: Mapped[dict | None] = mapped_column(
        JSONB,
        nullable=True,
    )

    error_message: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    error_trace: Mapped[str | None] = mapped_column(
        Text,
        nullable=True,
    )

    logs: Mapped[list] = mapped_column(
        JSONB,
        default=[],
        nullable=False,
    )

    metrics: Mapped[dict] = mapped_column(
        JSONB,
        default={},
        nullable=False,
    )  # rows_processed, data_size, etc.

    airflow_dag_run_id: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
        index=True,
    )

    # Relationships
    pipeline = relationship("Pipeline", back_populates="executions")
    triggered_by_user = relationship("User")

    def __repr__(self) -> str:
        return f"<PipelineExecution {self.id} ({self.status})>"
