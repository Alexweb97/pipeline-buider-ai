"""
Schedule Model
"""
from uuid import uuid4

from sqlalchemy import String, Text, Boolean, ForeignKey, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import Mapped, relationship

from app.db.base import Base
from app.db.compat import mapped_column


class Schedule(Base):
    """Pipeline schedule configuration model"""

    __tablename__ = "schedules"

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

    pipeline_id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("pipelines.id", ondelete="CASCADE"),
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

    # Schedule frequency type: once, hourly, daily, weekly, monthly, custom
    frequency: Mapped[str] = mapped_column(
        String(50),
        nullable=False,
        default="daily",
    )

    # Cron expression for custom schedules or computed from frequency
    cron_expression: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )

    # Status: active, paused, expired
    status: Mapped[str] = mapped_column(
        String(50),
        default="active",
        nullable=False,
        index=True,
    )

    # Timezone for schedule execution
    timezone: Mapped[str] = mapped_column(
        String(100),
        default="UTC",
        nullable=False,
    )

    # Schedule configuration (minute, hour, days_of_week, etc.)
    config: Mapped[dict] = mapped_column(
        JSONB,
        default={},
        nullable=False,
    )

    # Scheduling dates
    start_date: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    end_date: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    # Next and last run tracking
    next_run_at: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
        index=True,
    )

    last_run_at: Mapped[str | None] = mapped_column(
        String(50),
        nullable=True,
    )

    # Execution statistics
    total_runs: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    successful_runs: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    failed_runs: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    # Whether to sync with Airflow DAG
    is_airflow_synced: Mapped[bool] = mapped_column(
        Boolean,
        default=False,
        nullable=False,
    )

    # Airflow DAG ID if synced
    airflow_dag_id: Mapped[str | None] = mapped_column(
        String(255),
        nullable=True,
    )

    # Relationships
    creator = relationship("User", backref="schedules")
    pipeline = relationship("Pipeline", backref="schedules")

    def __repr__(self) -> str:
        return f"<Schedule {self.name} ({self.status})>"
