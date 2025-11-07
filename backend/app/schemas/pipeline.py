"""
Pipeline Pydantic Schemas
"""
from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


# Base schema
class PipelineBase(BaseModel):
    """Base pipeline schema"""
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    config: dict[str, Any] = Field(default_factory=dict)
    schedule: str | None = Field(None, max_length=100)
    is_scheduled: bool = False
    tags: list[str | None] = Field(default_factory=list)
    default_params: dict[str, Any] = Field(default_factory=dict)


# Schema for creating a pipeline
class PipelineCreate(PipelineBase):
    """Schema for creating a pipeline"""
    pass


# Schema for updating a pipeline
class PipelineUpdate(BaseModel):
    """Schema for updating a pipeline"""
    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None
    config: dict[str, Any] | None = None
    schedule: str | None = Field(None, max_length=100)
    is_scheduled: bool | None = None
    status: str | None = Field(None, pattern="^(draft|active|paused|archived)$")
    tags: list[str] | None = None
    default_params: dict[str, Any] | None = None


# Schema for pipeline response
class PipelineResponse(PipelineBase):
    """Schema for pipeline response"""
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    created_by: UUID
    version: str
    status: str
    created_at: datetime
    updated_at: datetime


# Schema for pipeline execution request
class PipelineExecuteRequest(BaseModel):
    """Schema for executing a pipeline"""
    params: dict[str, Any] = Field(default_factory=dict)
    trigger_type: str = Field(default="manual", pattern="^(manual|scheduled|webhook)$")


# Schema for pipeline list (summary)
class PipelineSummary(BaseModel):
    """Schema for pipeline list item"""
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    description: (str)
    status: str
    is_scheduled: bool
    tags: list[str]
    created_at: datetime
    updated_at: datetime
