"""
Module Model - ETL module registry
"""
from uuid import uuid4

from sqlalchemy import String, Text, Boolean, Integer
from sqlalchemy.dialects.postgresql import UUID, JSONB, ARRAY
from sqlalchemy.orm import Mapped

from app.db.compat import mapped_column

from app.db.base import Base


class Module(Base):
    """ETL Module registry model"""

    __tablename__ = "modules"

    id: Mapped[UUID] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid4,
    )

    name: Mapped[str] = mapped_column(
        String(100),
        unique=True,
        nullable=False,
        index=True,
    )

    display_name: Mapped[str] = mapped_column(
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
    )  # extractor, transformer, loader

    category: Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True,
    )  # database, api, file, cloud, ml, etc.

    version: Mapped[str] = mapped_column(
        String(20),
        default="1.0.0",
        nullable=False,
    )

    python_class: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )  # Full Python class path

    config_schema: Mapped[dict] = mapped_column(
        JSONB,
        nullable=False,
    )  # JSON Schema for module configuration

    input_schema: Mapped[dict | None] = mapped_column(
        JSONB,
        nullable=True,
    )  # Expected input data schema

    output_schema: Mapped[dict | None] = mapped_column(
        JSONB,
        nullable=True,
    )  # Expected output data schema

    required_connections: Mapped[list[str]] = mapped_column(
        ARRAY(String),
        default=[],
        nullable=False,
    )

    tags: Mapped[list[str]] = mapped_column(
        ARRAY(String),
        default=[],
        nullable=False,
    )

    is_active: Mapped[bool] = mapped_column(
        Boolean,
        default=True,
        nullable=False,
    )

    usage_count: Mapped[int] = mapped_column(
        Integer,
        default=0,
        nullable=False,
    )

    icon: Mapped[str | None] = mapped_column(
        String(100),
        nullable=True,
    )  # Icon identifier for UI

    documentation_url: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    def __repr__(self) -> str:
        return f"<Module {self.name} ({self.type})>"
