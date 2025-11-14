"""
Authentication Log Model
"""
from datetime import datetime
from uuid import uuid4

from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship

from app.db.base import Base


class AuthLog(Base):
    """Authentication log for tracking login attempts"""

    __tablename__ = "auth_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    username = Column(String(100), nullable=False, index=True)
    email = Column(String(255), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)
    ip_address = Column(String(45), nullable=True)  # IPv6 max length
    user_agent = Column(Text, nullable=True)
    status = Column(String(20), nullable=False, index=True)  # 'success' or 'failed'
    failure_reason = Column(String(255), nullable=True)

    # Relationship
    user = relationship("User", back_populates="auth_logs")

    def __repr__(self):
        return f"<AuthLog {self.username} - {self.status} at {self.timestamp}>"
