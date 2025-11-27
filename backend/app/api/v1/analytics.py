"""
Analytics API Routes
Provides aggregated statistics and metrics for pipeline executions
"""
from typing import Annotated, Optional
from datetime import datetime, timedelta
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, case

from app.api.dependencies.database import get_db
from app.api.dependencies.auth import get_current_user
from app.db.models.execution import PipelineExecution
from app.db.models.pipeline import Pipeline
from app.db.models.user import User
from app.schemas.analytics import (
    AnalyticsOverview,
    ExecutionTrend,
    PipelinePerformance,
    StatusDistribution,
)

router = APIRouter()


@router.get("/overview", response_model=AnalyticsOverview)
def get_analytics_overview(
    days: int = Query(30, ge=1, le=365, description="Number of days to analyze"),
    pipeline_id: Optional[UUID] = Query(None, description="Filter by pipeline ID"),
    db: Annotated[Session, Depends(get_db)] = None,
    current_user: Annotated[User, Depends(get_current_user)] = None,
):
    """Get analytics overview with KPIs and aggregated statistics"""

    # Calculate date range
    end_date = datetime.utcnow()
    start_date = end_date - timedelta(days=days)

    # Build base query - only executions for user's pipelines
    query = (
        db.query(PipelineExecution)
        .join(Pipeline, PipelineExecution.pipeline_id == Pipeline.id)
        .filter(Pipeline.created_by == current_user.id)
        .filter(PipelineExecution.created_at >= start_date.isoformat())
    )

    if pipeline_id:
        query = query.filter(PipelineExecution.pipeline_id == pipeline_id)

    # Get all executions
    executions = query.all()

    # Calculate KPIs
    total_executions = len(executions)
    successful_executions = sum(1 for e in executions if e.status == "success")
    failed_executions = sum(1 for e in executions if e.status == "failed")
    running_executions = sum(1 for e in executions if e.status == "running")

    success_rate = (successful_executions / total_executions * 100) if total_executions > 0 else 0

    # Calculate average duration (only for completed executions)
    completed = [e for e in executions if e.duration_seconds is not None]
    avg_duration = sum(e.duration_seconds for e in completed) / len(completed) if completed else 0

    # Get execution trends (group by day)
    trends_query = (
        db.query(
            func.date(PipelineExecution.created_at).label("date"),
            func.count(PipelineExecution.id).label("total"),
            func.sum(case((PipelineExecution.status == "success", 1), else_=0)).label("success"),
            func.sum(case((PipelineExecution.status == "failed", 1), else_=0)).label("failed"),
        )
        .join(Pipeline, PipelineExecution.pipeline_id == Pipeline.id)
        .filter(Pipeline.created_by == current_user.id)
        .filter(PipelineExecution.created_at >= start_date.isoformat())
    )

    if pipeline_id:
        trends_query = trends_query.filter(PipelineExecution.pipeline_id == pipeline_id)

    trends_data = trends_query.group_by(func.date(PipelineExecution.created_at)).all()

    execution_trends = [
        ExecutionTrend(
            date=str(row.date),
            total=row.total,
            success=row.success,
            failed=row.failed,
        )
        for row in trends_data
    ]

    # Get status distribution
    status_counts = {}
    for execution in executions:
        status = execution.status
        status_counts[status] = status_counts.get(status, 0) + 1

    status_distribution = [
        StatusDistribution(status=status, count=count)
        for status, count in status_counts.items()
    ]

    # Get pipeline performance (average duration per pipeline)
    performance_query = (
        db.query(
            Pipeline.id,
            Pipeline.name,
            func.count(PipelineExecution.id).label("execution_count"),
            func.avg(PipelineExecution.duration_seconds).label("avg_duration"),
            func.sum(case((PipelineExecution.status == "success", 1), else_=0)).label("success_count"),
        )
        .join(PipelineExecution, Pipeline.id == PipelineExecution.pipeline_id)
        .filter(Pipeline.created_by == current_user.id)
        .filter(PipelineExecution.created_at >= start_date.isoformat())
    )

    if pipeline_id:
        performance_query = performance_query.filter(Pipeline.id == pipeline_id)

    performance_data = performance_query.group_by(Pipeline.id, Pipeline.name).all()

    pipeline_performance = [
        PipelinePerformance(
            pipeline_id=str(row.id),
            pipeline_name=row.name,
            execution_count=row.execution_count,
            avg_duration_seconds=float(row.avg_duration) if row.avg_duration else 0,
            success_rate=(row.success_count / row.execution_count * 100) if row.execution_count > 0 else 0,
        )
        for row in performance_data
    ]

    return AnalyticsOverview(
        total_executions=total_executions,
        successful_executions=successful_executions,
        failed_executions=failed_executions,
        running_executions=running_executions,
        success_rate=round(success_rate, 2),
        avg_duration_seconds=round(avg_duration, 2),
        execution_trends=execution_trends,
        status_distribution=status_distribution,
        pipeline_performance=pipeline_performance,
        period_days=days,
    )
