"""
Connection Pydantic Schemas
"""
from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


# Base schema
class ConnectionBase(BaseModel):
    """Base connection schema"""

    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    type: str = Field(..., min_length=1, max_length=50)
    config: dict[str, Any] = Field(default_factory=dict)


# Schema for creating a connection
class ConnectionCreate(ConnectionBase):
    """Schema for creating a connection"""

    pass


# Schema for updating a connection
class ConnectionUpdate(BaseModel):
    """Schema for updating a connection"""

    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None
    type: str | None = Field(None, min_length=1, max_length=50)
    config: dict[str, Any] | None = None
    is_active: bool | None = None


# Schema for connection response
class ConnectionResponse(ConnectionBase):
    """Schema for connection response"""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_by: UUID
    is_active: bool
    last_tested_at: str | None = None
    test_status: str | None = None
    created_at: datetime
    updated_at: datetime


# Schema for connection test
class ConnectionTest(BaseModel):
    """Schema for testing a connection"""

    type: str = Field(..., min_length=1, max_length=50)
    config: dict[str, Any] = Field(default_factory=dict)


# Schema for connection test result
class ConnectionTestResult(BaseModel):
    """Schema for connection test result"""

    success: bool
    message: str
    details: dict[str, Any] | None = None
