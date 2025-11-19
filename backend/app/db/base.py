"""
SQLAlchemy Base Model
"""
from datetime import datetime
from typing import Any
from sqlalchemy import DateTime, func
from sqlalchemy.orm import Mapped

# Import from compat layer for SQLAlchemy 1.4/2.0 compatibility
from app.db.compat import mapped_column, DeclarativeBase, HAS_SQLALCHEMY_20

# Create Base class depending on SQLAlchemy version
if HAS_SQLALCHEMY_20:
    # SQLAlchemy 2.0+
    class Base(DeclarativeBase):
        """Base class for all database models"""

        # Common columns for all tables
        created_at: Mapped[datetime] = mapped_column(
            DateTime(timezone=True),
            server_default=func.now(),
            nullable=False,
        )

        updated_at: Mapped[datetime] = mapped_column(
            DateTime(timezone=True),
            server_default=func.now(),
            onupdate=func.now(),
            nullable=False,
        )

        def to_dict(self) -> dict[str, Any]:
            """Convert model to dictionary"""
            return {
                column.name: getattr(self, column.name)
                for column in self.__table__.columns
            }
else:
    # SQLAlchemy 1.4.x
    from sqlalchemy.ext.declarative import declarative_base
    Base = declarative_base()

    # Add common columns to Base
    Base.created_at = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    Base.updated_at = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    def _to_dict(self) -> dict[str, Any]:
        """Convert model to dictionary"""
        return {
            column.name: getattr(self, column.name)
            for column in self.__table__.columns
        }

    Base.to_dict = _to_dict
