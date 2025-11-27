"""
Dashboard Share Model
Represents sharing permissions for dashboards
"""
from datetime import datetime
from typing import TYPE_CHECKING
from uuid import UUID, uuid4

from sqlalchemy import Column, DateTime, ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID as PGUUID
from sqlalchemy.orm import relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.db.models.dashboard import Dashboard
    from app.db.models.user import User


class DashboardShare(Base):
    """
    Dashboard sharing model for managing access permissions
    """

    __tablename__ = "dashboard_shares"
    __table_args__ = (
        UniqueConstraint("dashboard_id", "user_id", name="unique_dashboard_user_share"),
    )

    id = Column(PGUUID(as_uuid=True), primary_key=True, default=uuid4)
    dashboard_id = Column(
        PGUUID(as_uuid=True),
        ForeignKey("dashboards.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    user_id = Column(
        PGUUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    permission = Column(String(50), nullable=False, default="view", server_default="view")
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    # Relationships
    dashboard = relationship("Dashboard", back_populates="shares")
    user = relationship("User")

    def __repr__(self) -> str:
        return f"<DashboardShare(id={self.id}, dashboard_id={self.dashboard_id}, user_id={self.user_id}, permission='{self.permission}')>"
