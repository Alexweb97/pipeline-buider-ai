"""
Execution Pydantic Schemas
"""
from datetime import datetime
from typing import Any
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


# Base schema
class ExecutionBase(BaseModel):
    """Base execution schema"""

    status: str = Field(
        default="pending",
        pattern="^(pending|running|success|failed|cancelled)$",
    )
    trigger_type: str = Field(..., pattern="^(manual|scheduled|webhook)$")
    params: dict[str, Any] = Field(default_factory=dict)


# Schema for execution response
class ExecutionResponse(ExecutionBase):
    """Schema for execution response"""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    pipeline_id: UUID
    triggered_by: UUID | None = None
    started_at: str | None = None
    completed_at: str | None = None
    duration_seconds: int | None = None
    result: dict[str, Any] | None = None
    error_message: str | None = None
    logs: list[dict[str, Any]] = Field(default_factory=list)
    metrics: dict[str, Any] = Field(default_factory=dict)
    airflow_dag_run_id: str | None = None
    created_at: datetime
    updated_at: datetime


# Schema for execution list (summary)
class ExecutionSummary(BaseModel):
    """Schema for execution list item"""

    model_config = ConfigDict(from_attributes=True)

    id: UUID
    pipeline_id: UUID
    status: str
    trigger_type: str
    started_at: str | None
    completed_at: str | None
    duration_seconds: int | None
    created_at: datetime


# Schema for execution logs
class ExecutionLog(BaseModel):
    """Schema for execution log entry"""

    timestamp: str
    level: str = Field(..., pattern="^(debug|info|warning|error|critical)$")
    message: str
    module: str | None = None
    extra: dict[str, Any] | None = None


# Schema for execution metrics
class ExecutionMetrics(BaseModel):
    """Schema for execution metrics"""

    rows_processed: int | None = None
    data_size_bytes: int | None = None
    processing_time_seconds: float | None = None
    memory_usage_mb: float | None = None
    custom_metrics: dict[str, Any] = Field(default_factory=dict)
