"""
Pipeline API Routes
"""
from typing import Annotated, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.api.dependencies.database import get_db
from app.api.dependencies.auth import get_current_user
from app.db.models.pipeline import Pipeline
from app.db.models.user import User
from app.schemas.pipeline import (
    PipelineCreate,
    PipelineUpdate,
    PipelineResponse,
    PipelineExecuteRequest,
)

router = APIRouter()


@router.get("")
def list_pipelines(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = Query(None, alias="status"),
    search: Optional[str] = None,
    db: Annotated[Session, Depends(get_db)] = None,
    current_user: Annotated[User, Depends(get_current_user)] = None,
):
    """List all pipelines with pagination and filters"""

    # Build query
    query = db.query(Pipeline).filter(Pipeline.created_by == current_user.id)

    # Apply filters
    if status_filter:
        query = query.filter(Pipeline.status == status_filter)

    if search:
        query = query.filter(
            (Pipeline.name.ilike(f"%{search}%")) |
            (Pipeline.description.ilike(f"%{search}%"))
        )

    # Get total count
    total = query.count()

    # Apply pagination
    pipelines = (
        query
        .order_by(Pipeline.updated_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    return {
        "pipelines": [PipelineResponse.model_validate(p) for p in pipelines],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.post("", status_code=status.HTTP_201_CREATED)
def create_pipeline(
    pipeline_data: PipelineCreate,
    db: Annotated[Session, Depends(get_db)] = None,
    current_user: Annotated[User, Depends(get_current_user)] = None,
):
    """Create a new pipeline"""

    # Create pipeline instance
    pipeline = Pipeline(
        created_by=current_user.id,
        name=pipeline_data.name,
        description=pipeline_data.description,
        config=pipeline_data.config,
        schedule=pipeline_data.schedule,
        is_scheduled=pipeline_data.is_scheduled,
        tags=pipeline_data.tags,
        default_params=pipeline_data.default_params,
        status="draft",
        version="1.0.0",
    )

    db.add(pipeline)
    db.commit()
    db.refresh(pipeline)

    return PipelineResponse.model_validate(pipeline)


@router.get("/{pipeline_id}")
def get_pipeline(
    pipeline_id: UUID,
    db: Annotated[Session, Depends(get_db)] = None,
    current_user: Annotated[User, Depends(get_current_user)] = None,
):
    """Get pipeline by ID"""

    pipeline = (
        db.query(Pipeline)
        .filter(
            Pipeline.id == pipeline_id,
            Pipeline.created_by == current_user.id,
        )
        .first()
    )

    if not pipeline:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pipeline not found",
        )

    return PipelineResponse.model_validate(pipeline)


@router.put("/{pipeline_id}")
def update_pipeline(
    pipeline_id: UUID,
    pipeline_data: PipelineUpdate,
    db: Annotated[Session, Depends(get_db)] = None,
    current_user: Annotated[User, Depends(get_current_user)] = None,
):
    """Update pipeline"""

    pipeline = (
        db.query(Pipeline)
        .filter(
            Pipeline.id == pipeline_id,
            Pipeline.created_by == current_user.id,
        )
        .first()
    )

    if not pipeline:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pipeline not found",
        )

    # Update fields
    update_data = pipeline_data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(pipeline, field, value)

    db.commit()
    db.refresh(pipeline)

    return PipelineResponse.model_validate(pipeline)


@router.delete("/{pipeline_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_pipeline(
    pipeline_id: UUID,
    db: Annotated[Session, Depends(get_db)] = None,
    current_user: Annotated[User, Depends(get_current_user)] = None,
):
    """Delete pipeline"""

    pipeline = (
        db.query(Pipeline)
        .filter(
            Pipeline.id == pipeline_id,
            Pipeline.created_by == current_user.id,
        )
        .first()
    )

    if not pipeline:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pipeline not found",
        )

    db.delete(pipeline)
    db.commit()

    return None


@router.post("/{pipeline_id}/execute")
def execute_pipeline(
    pipeline_id: UUID,
    execute_data: PipelineExecuteRequest,
    db: Annotated[Session, Depends(get_db)] = None,
    current_user: Annotated[User, Depends(get_current_user)] = None,
):
    """Execute a pipeline"""

    pipeline = (
        db.query(Pipeline)
        .filter(
            Pipeline.id == pipeline_id,
            Pipeline.created_by == current_user.id,
        )
        .first()
    )

    if not pipeline:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pipeline not found",
        )

    # TODO: Implement actual pipeline execution
    # For now, create execution record
    from app.db.models.execution import PipelineExecution
    from uuid import uuid4

    execution = PipelineExecution(
        id=uuid4(),
        pipeline_id=pipeline_id,
        triggered_by=current_user.id,
        status="pending",
        trigger_type=execute_data.trigger_type,
        params=execute_data.params,
        logs=[],
        metrics={},
    )

    db.add(execution)
    db.commit()
    db.refresh(execution)

    return {
        "execution_id": str(execution.id),
        "pipeline_id": str(pipeline_id),
        "status": execution.status,
        "message": "Pipeline execution started",
    }


@router.post("/{pipeline_id}/validate")
def validate_pipeline(
    pipeline_id: UUID,
    db: Annotated[Session, Depends(get_db)] = None,
    current_user: Annotated[User, Depends(get_current_user)] = None,
):
    """Validate pipeline configuration"""

    pipeline = (
        db.query(Pipeline)
        .filter(
            Pipeline.id == pipeline_id,
            Pipeline.created_by == current_user.id,
        )
        .first()
    )

    if not pipeline:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pipeline not found",
        )

    # Validate pipeline configuration
    errors = []
    warnings = []

    config = pipeline.config
    nodes = config.get("nodes", [])
    edges = config.get("edges", [])

    # Validation rules
    if not nodes:
        errors.append({
            "type": "empty_pipeline",
            "message": "Pipeline must contain at least one module",
        })

    # Check for orphaned nodes
    connected_nodes = set()
    for edge in edges:
        connected_nodes.add(edge.get("source"))
        connected_nodes.add(edge.get("target"))

    node_ids = {node.get("id") for node in nodes}
    orphaned = node_ids - connected_nodes

    if len(nodes) > 1 and orphaned:
        warnings.append({
            "type": "orphaned_nodes",
            "message": f"Found {len(orphaned)} disconnected nodes",
        })

    # Check for valid start (extractor)
    if nodes:
        has_extractor = any(
            node.get("type") == "extractor" for node in nodes
        )
        if not has_extractor:
            errors.append({
                "type": "missing_extractor",
                "message": "Pipeline must start with at least one extractor",
            })

    # Check for valid end (loader)
    if nodes:
        has_loader = any(
            node.get("type") == "loader" for node in nodes
        )
        if not has_loader:
            errors.append({
                "type": "missing_loader",
                "message": "Pipeline must end with at least one loader",
            })

    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "warnings": warnings,
    }


@router.post("/validate-config")
def validate_config(
    pipeline_data: PipelineCreate,
    current_user: Annotated[User, Depends(get_current_user)] = None,
):
    """Validate pipeline configuration before saving"""

    errors = []
    warnings = []

    config = pipeline_data.config
    nodes = config.get("nodes", [])
    edges = config.get("edges", [])

    # Same validation logic as above
    if not nodes:
        errors.append({
            "type": "empty_pipeline",
            "message": "Pipeline must contain at least one module",
        })

    if nodes:
        has_extractor = any(
            node.get("type") == "extractor" for node in nodes
        )
        if not has_extractor:
            errors.append({
                "type": "missing_extractor",
                "message": "Pipeline must start with at least one extractor",
            })

        has_loader = any(
            node.get("type") == "loader" for node in nodes
        )
        if not has_loader:
            errors.append({
                "type": "missing_loader",
                "message": "Pipeline must end with at least one loader",
            })

    return {
        "valid": len(errors) == 0,
        "errors": errors,
        "warnings": warnings,
    }
