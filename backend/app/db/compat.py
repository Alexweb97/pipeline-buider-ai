"""
SQLAlchemy Compatibility Layer
Provides compatibility between SQLAlchemy 1.4.x and 2.0.x
"""
import sys

# Check SQLAlchemy version
try:
    from sqlalchemy.orm import mapped_column, DeclarativeBase
    # SQLAlchemy 2.0+
    HAS_SQLALCHEMY_20 = True
    Base = DeclarativeBase
except ImportError:
    # SQLAlchemy 1.4.x
    from sqlalchemy import Column as mapped_column
    from sqlalchemy.ext.declarative import declarative_base
    HAS_SQLALCHEMY_20 = False
    # Create a base class factory
    _base_factory = declarative_base

    # Create a dummy DeclarativeBase for compatibility
    class DeclarativeBase:
        """Compatibility shim for SQLAlchemy 1.4.x"""
        pass

__all__ = ["mapped_column", "DeclarativeBase", "HAS_SQLALCHEMY_20"]
