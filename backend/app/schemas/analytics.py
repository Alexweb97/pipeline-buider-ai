"""
Analytics Schemas
Pydantic models for analytics API responses
"""
from pydantic import BaseModel


class ExecutionTrend(BaseModel):
    """Execution trend data for a specific date"""

    date: str
    total: int
    success: int
    failed: int


class StatusDistribution(BaseModel):
    """Distribution of execution statuses"""

    status: str
    count: int


class PipelinePerformance(BaseModel):
    """Performance metrics for a pipeline"""

    pipeline_id: str
    pipeline_name: str
    execution_count: int
    avg_duration_seconds: float
    success_rate: float


class AnalyticsOverview(BaseModel):
    """Overview of analytics data with KPIs and trends"""

    # KPIs
    total_executions: int
    successful_executions: int
    failed_executions: int
    running_executions: int
    success_rate: float  # percentage
    avg_duration_seconds: float

    # Trends and distributions
    execution_trends: list[ExecutionTrend]
    status_distribution: list[StatusDistribution]
    pipeline_performance: list[PipelinePerformance]

    # Metadata
    period_days: int
