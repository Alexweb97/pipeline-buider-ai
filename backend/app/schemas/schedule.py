"""
Schedule Pydantic Schemas
"""
from datetime import datetime
from typing import Any, Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field, field_validator


# Types
ScheduleFrequency = Literal["once", "hourly", "daily", "weekly", "monthly", "custom"]
ScheduleStatus = Literal["active", "paused", "expired"]
DayOfWeek = Literal["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]


class ScheduleConfigSchema(BaseModel):
    """Schedule configuration schema"""
    # For hourly
    minute: int | None = Field(None, ge=0, le=59)

    # For daily
    hour: int | None = Field(None, ge=0, le=23)

    # For weekly
    days_of_week: list[DayOfWeek] | None = None

    # For monthly
    day_of_month: int | None = Field(None, ge=1, le=31)

    # For custom (cron)
    cron_expression: str | None = None

    # Common options
    max_retries: int = Field(default=3, ge=0, le=10)
    retry_delay_minutes: int = Field(default=5, ge=1, le=60)
    timeout_minutes: int = Field(default=60, ge=1, le=1440)
    send_notifications: bool = False
    notification_emails: list[str] = Field(default_factory=list)


# Base schema
class ScheduleBase(BaseModel):
    """Base schedule schema"""
    name: str = Field(..., min_length=1, max_length=255)
    description: str | None = None
    pipeline_id: UUID
    frequency: ScheduleFrequency = "daily"
    timezone: str = Field(default="UTC", max_length=100)
    start_date: str | None = None
    end_date: str | None = None
    config: ScheduleConfigSchema = Field(default_factory=ScheduleConfigSchema)


# Schema for creating a schedule
class ScheduleCreate(ScheduleBase):
    """Schema for creating a schedule"""
    pass


# Schema for updating a schedule
class ScheduleUpdate(BaseModel):
    """Schema for updating a schedule"""
    name: str | None = Field(None, min_length=1, max_length=255)
    description: str | None = None
    frequency: ScheduleFrequency | None = None
    status: ScheduleStatus | None = None
    timezone: str | None = None
    start_date: str | None = None
    end_date: str | None = None
    config: ScheduleConfigSchema | None = None


# Schema for schedule response
class ScheduleResponse(BaseModel):
    """Schema for schedule response"""
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    description: str | None
    pipeline_id: UUID
    pipeline_name: str | None = None
    frequency: str
    cron_expression: str | None
    status: str
    timezone: str
    config: dict[str, Any]
    start_date: str | None
    end_date: str | None
    next_run_at: str | None
    last_run_at: str | None
    total_runs: int
    successful_runs: int
    failed_runs: int
    is_airflow_synced: bool
    airflow_dag_id: str | None
    created_by: UUID
    created_at: datetime
    updated_at: datetime


# Schema for schedule list (summary)
class ScheduleSummary(BaseModel):
    """Schema for schedule list item"""
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    name: str
    description: str | None
    pipeline_id: UUID
    pipeline_name: str | None = None
    frequency: str
    status: str
    next_run_at: str | None
    last_run_at: str | None
    total_runs: int
    successful_runs: int
    failed_runs: int
    created_at: datetime


# Schema for toggle status request
class ScheduleToggleRequest(BaseModel):
    """Schema for toggling schedule status"""
    status: ScheduleStatus


# Schema for schedule statistics
class ScheduleStats(BaseModel):
    """Schema for schedule statistics"""
    total_schedules: int
    active_schedules: int
    paused_schedules: int
    runs_today: int
    success_rate: float
    upcoming_runs: list["ScheduleUpcoming"]


class ScheduleUpcoming(BaseModel):
    """Schema for upcoming schedule run"""
    schedule_id: UUID
    schedule_name: str
    pipeline_name: str
    next_run_at: str
    frequency: str


# Schema for schedule run history
class ScheduleRun(BaseModel):
    """Schema for schedule run record"""
    id: UUID
    schedule_id: UUID
    pipeline_id: UUID
    execution_id: UUID | None
    status: str
    started_at: str
    completed_at: str | None
    duration_seconds: int | None
    error_message: str | None


# Paginated response
class ScheduleListResponse(BaseModel):
    """Paginated schedule list response"""
    schedules: list[ScheduleSummary]
    total: int
    page: int
    page_size: int
