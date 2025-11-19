"""
Pipeline Execution API Routes
"""
from typing import Annotated, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.api.dependencies.database import get_db
from app.api.dependencies.auth import get_current_user
from app.db.models.execution import PipelineExecution
from app.db.models.pipeline import Pipeline
from app.db.models.user import User
from app.schemas.execution import ExecutionResponse

router = APIRouter()


@router.get("")
def list_executions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    pipeline_id: Optional[UUID] = None,
    status_filter: Optional[str] = Query(None, alias="status"),
    db: Annotated[Session, Depends(get_db)] = None,
    current_user: Annotated[User, Depends(get_current_user)] = None,
):
    """List pipeline executions with pagination and filters"""

    # Build query - only executions for user's pipelines
    query = (
        db.query(PipelineExecution)
        .join(Pipeline, PipelineExecution.pipeline_id == Pipeline.id)
        .filter(Pipeline.created_by == current_user.id)
    )

    # Apply filters
    if pipeline_id:
        query = query.filter(PipelineExecution.pipeline_id == pipeline_id)

    if status_filter:
        query = query.filter(PipelineExecution.status == status_filter)

    # Get total count
    total = query.count()

    # Apply pagination
    executions = (
        query
        .order_by(PipelineExecution.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return {
        "executions": [ExecutionResponse.model_validate(e) for e in executions],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.get("/{execution_id}")
def get_execution(
    execution_id: UUID,
    db: Annotated[Session, Depends(get_db)] = None,
    current_user: Annotated[User, Depends(get_current_user)] = None,
):
    """Get execution details"""

    execution = (
        db.query(PipelineExecution)
        .join(Pipeline, PipelineExecution.pipeline_id == Pipeline.id)
        .filter(
            PipelineExecution.id == execution_id,
            Pipeline.created_by == current_user.id,
        )
        .first()
    )

    if not execution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Execution not found",
        )

    return ExecutionResponse.model_validate(execution)


@router.post("/{execution_id}/monitor")
def monitor_execution(
    execution_id: UUID,
    db: Annotated[Session, Depends(get_db)] = None,
    current_user: Annotated[User, Depends(get_current_user)] = None,
):
    """Trigger monitoring of a running execution to update its status from Airflow"""

    execution = (
        db.query(PipelineExecution)
        .join(Pipeline, PipelineExecution.pipeline_id == Pipeline.id)
        .filter(
            PipelineExecution.id == execution_id,
            Pipeline.created_by == current_user.id,
        )
        .first()
    )

    if not execution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Execution not found",
        )

    # Trigger monitoring task
    from app.workers.tasks.pipeline import monitor_execution as monitor_task

    task = monitor_task.delay(str(execution_id))

    return {
        "execution_id": str(execution_id),
        "celery_task_id": task.id,
        "message": "Monitoring task submitted",
    }


@router.post("/{execution_id}/cancel")
def cancel_execution(
    execution_id: UUID,
    db: Annotated[Session, Depends(get_db)] = None,
    current_user: Annotated[User, Depends(get_current_user)] = None,
):
    """Cancel a running execution"""

    execution = (
        db.query(PipelineExecution)
        .join(Pipeline, PipelineExecution.pipeline_id == Pipeline.id)
        .filter(
            PipelineExecution.id == execution_id,
            Pipeline.created_by == current_user.id,
        )
        .first()
    )

    if not execution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Execution not found",
        )

    if execution.status not in ["pending", "running"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot cancel execution with status: {execution.status}",
        )

    # Trigger cancellation task
    from app.workers.tasks.pipeline import cancel_pipeline

    task = cancel_pipeline.delay(
        pipeline_id=str(execution.pipeline_id),
        execution_id=str(execution_id),
    )

    return {
        "execution_id": str(execution_id),
        "celery_task_id": task.id,
        "message": "Cancellation task submitted",
    }


@router.get("/{execution_id}/logs")
def get_execution_logs(
    execution_id: UUID,
    db: Annotated[Session, Depends(get_db)] = None,
    current_user: Annotated[User, Depends(get_current_user)] = None,
):
    """Get execution logs"""

    execution = (
        db.query(PipelineExecution)
        .join(Pipeline, PipelineExecution.pipeline_id == Pipeline.id)
        .filter(
            PipelineExecution.id == execution_id,
            Pipeline.created_by == current_user.id,
        )
        .first()
    )

    if not execution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Execution not found",
        )

    return {
        "execution_id": str(execution_id),
        "logs": execution.logs or [],
    }
