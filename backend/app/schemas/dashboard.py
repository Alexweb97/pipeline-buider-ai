"""
Dashboard Schemas
Pydantic models for dashboard API requests and responses
"""
from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field


# Dashboard Share Schemas
class DashboardShareBase(BaseModel):
    """Base schema for dashboard sharing"""

    user_id: UUID
    permission: str = Field(default="view", pattern="^(view|edit)$")


class DashboardShareCreate(DashboardShareBase):
    """Schema for creating a dashboard share"""

    pass


class DashboardShareResponse(DashboardShareBase):
    """Schema for dashboard share response"""

    id: UUID
    dashboard_id: UUID
    created_at: datetime

    class Config:
        from_attributes = True


# Dashboard Schemas
class DashboardBase(BaseModel):
    """Base schema for dashboards"""

    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    theme: str = Field(default="light", pattern="^(light|dark)$")


class DashboardCreate(DashboardBase):
    """Schema for creating a dashboard"""

    pipeline_id: UUID
    config: dict[str, Any] = Field(default_factory=dict)
    layout: dict[str, Any] = Field(default_factory=dict)


class DashboardUpdate(BaseModel):
    """Schema for updating a dashboard"""

    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None
    config: dict[str, Any] | None = None
    theme: str | None = Field(None, pattern="^(light|dark)$")
    layout: dict[str, Any] | None = None


class DashboardResponse(DashboardBase):
    """Schema for dashboard response"""

    id: UUID
    pipeline_id: UUID
    config: dict[str, Any]
    layout: dict[str, Any]
    created_by: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DashboardWithShares(DashboardResponse):
    """Schema for dashboard with shares information"""

    shares: list[DashboardShareResponse] = []

    class Config:
        from_attributes = True


class DashboardListResponse(BaseModel):
    """Schema for dashboard list response"""

    dashboards: list[DashboardResponse]
    total: int
