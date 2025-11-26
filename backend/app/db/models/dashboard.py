"""
Dashboard Model
Represents interactive data dashboards with charts and visualizations
"""
from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID, uuid4

from sqlalchemy import Column, DateTime, ForeignKey, String, Text, JSON
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.db.models.pipeline import Pipeline
    from app.db.models.user import User
    from app.db.models.dashboard_share import DashboardShare


class Dashboard(Base):
    """
    Dashboard model for storing interactive data visualizations
    """

    __tablename__ = "dashboards"

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    pipeline_id = Column(
        PGUUID(as_uuid=True),
        ForeignKey("pipelines.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    config = Column(JSON, nullable=False, default=dict, server_default="{}")
    theme = Column(String(50), nullable=False, default="light", server_default="light")
    layout = Column(JSON, nullable=False, default=dict, server_default="{}")
    created_by = Column(
        PGUUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(
        DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow
    )

    # Relationships
    pipeline = relationship("Pipeline", back_populates="dashboards")
    creator = relationship("User", foreign_keys=[created_by])
    shares = relationship(
        "DashboardShare", back_populates="dashboard", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<Dashboard(id={self.id}, name='{self.name}', pipeline_id={self.pipeline_id})>"
