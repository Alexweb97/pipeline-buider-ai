"""
Audit Event Model
"""
from datetime import datetime
from uuid import uuid4

from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship

from app.db.base import Base


class AuditEvent(Base):
    """Audit events for tracking all user actions"""

    __tablename__ = "audit_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    username = Column(String(100), nullable=False)
    action = Column(String(50), nullable=False, index=True)  # 'create', 'read', 'update', 'delete', 'execute'
    resource_type = Column(String(50), nullable=False, index=True)  # 'pipeline', 'module', 'connection', 'user'
    resource_id = Column(UUID(as_uuid=True), nullable=True, index=True)
    resource_name = Column(String(255), nullable=True)
    ip_address = Column(String(45), nullable=True)
    user_agent = Column(Text, nullable=True)
    details = Column(JSONB, nullable=True)

    # Relationship
    user = relationship("User", back_populates="audit_events")

    def __repr__(self):
        return f"<AuditEvent {self.action} on {self.resource_type} by {self.username}>"
