"""
Module Pydantic Schemas
"""
from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


# Base schema
class ModuleBase(BaseModel):
    """Base module schema"""

    name: str = Field(..., min_length=1, max_length=100)
    display_name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    type: str = Field(..., pattern="^(extractor|transformer|loader)$")
    category: str = Field(..., min_length=1, max_length=100)
    python_class: str = Field(..., min_length=1, max_length=255)
    config_schema: dict[str, Any] = Field(default_factory=dict)
    input_schema: dict[str, Any] | None = None
    output_schema: dict[str, Any] | None = None
    required_connections: list [str | None] = Field(default_factory=list)
    tags: list [str | None] = Field(default_factory=list)
    icon: str | None = Field(None, max_length=100)
    documentation_url: str | None = Field(None, max_length=500)


# Schema for creating a module
class ModuleCreate(ModuleBase):
    """Schema for creating a module"""

    pass


# Schema for updating a module
class ModuleUpdate(BaseModel):
    """Schema for updating a module"""

    display_name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None
    category: str | None = Field(None, min_length=1, max_length=100)
    config_schema: dict[str, Any] | None = None
    input_schema: dict[str, Any] | None = None
    output_schema: dict[str, Any] | None = None
    required_connections: list[str] | None = None
    tags: list[str] | None = None
    is_active: bool | None = None
    icon: str | None = Field(None, max_length=100)
    documentation_url: str | None = Field(None, max_length=500)


# Schema for module response
class ModuleResponse(ModuleBase):
    """Schema for module response"""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    version: str
    is_active: bool
    usage_count: int
    created_at: datetime
    updated_at: datetime


# Schema for module list (summary)
class ModuleSummary(BaseModel):
    """Schema for module list item"""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    display_name: str
    type: str
    category: str
    is_active: bool
    usage_count: int
    tags: list[str]
    icon: str | None
