"""
Pipeline API Routes
"""
from typing import Annotated, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
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
from app.core.audit import log_audit_event, get_client_ip, get_user_agent

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
    request: Request,
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

    # Log audit event
    log_audit_event(
        db=db,
        user=current_user,
        action="create",
        resource_type="pipeline",
        resource_id=pipeline.id,
        resource_name=pipeline.name,
        ip_address=get_client_ip(request),
        user_agent=get_user_agent(request),
        details={"description": pipeline.description, "tags": pipeline.tags},
    )

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
    request: Request,
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

    # Log audit event
    log_audit_event(
        db=db,
        user=current_user,
        action="update",
        resource_type="pipeline",
        resource_id=pipeline.id,
        resource_name=pipeline.name,
        ip_address=get_client_ip(request),
        user_agent=get_user_agent(request),
        details={"updated_fields": list(update_data.keys())},
    )

    return PipelineResponse.model_validate(pipeline)


@router.delete("/{pipeline_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_pipeline(
    pipeline_id: UUID,
    request: Request,
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

    # Save pipeline info before deletion for audit log
    pipeline_name = pipeline.name

    # Log audit event before deletion
    log_audit_event(
        db=db,
        user=current_user,
        action="delete",
        resource_type="pipeline",
        resource_id=pipeline.id,
        resource_name=pipeline_name,
        ip_address=get_client_ip(request),
        user_agent=get_user_agent(request),
    )

    db.delete(pipeline)
    db.commit()

    return None


@router.post("/{pipeline_id}/execute")
def execute_pipeline(
    pipeline_id: UUID,
    execute_data: PipelineExecuteRequest,
    request: Request,
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

    # Log audit event
    log_audit_event(
        db=db,
        user=current_user,
        action="execute",
        resource_type="pipeline",
        resource_id=pipeline.id,
        resource_name=pipeline.name,
        ip_address=get_client_ip(request),
        user_agent=get_user_agent(request),
        details={
            "execution_id": str(execution.id),
            "trigger_type": execute_data.trigger_type,
            "params": execute_data.params,
        },
    )

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


@router.post("/preview-node/{node_id}")
async def preview_node_output(
    node_id: str,
    request: Request,
    current_user: Annotated[User, Depends(get_current_user)] = None,
):
    """
    Preview the output data of a specific node in the pipeline

    This executes the pipeline up to the specified node and returns
    the data preview including schema, statistics, and sample rows.
    """
    import pandas as pd
    from app.data.modules_definitions import get_module_definition

    try:
        # Parse request body
        body = await request.json()
        node = body.get("node")
        nodes = body.get("nodes", [])
        edges = body.get("edges", [])

        if not node:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Node data is required"
            )

        # Build execution path from extractors to target node
        execution_order = []
        visited = set()

        def build_path(target_id: str):
            if target_id in visited:
                return
            visited.add(target_id)

            # Find incoming edges
            incoming = [e for e in edges if e.get("target") == target_id]

            # Process parent nodes first
            for edge in incoming:
                source_id = edge.get("source")
                if source_id:
                    build_path(source_id)

            # Add current node
            current_node = next((n for n in nodes if n.get("id") == target_id), None)
            if current_node:
                execution_order.append(current_node)

        build_path(node_id)

        if not execution_order:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Could not build execution path to node"
            )

        # Execute pipeline up to target node
        data = None

        for exec_node in execution_order:
            node_type = exec_node.get("type")
            node_data = exec_node.get("data", {})
            module_id = node_data.get("moduleId")
            config = node_data.get("config", {})

            # Get module definition
            module_def = get_module_definition(module_id)
            if not module_def:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Module {module_id} not found"
                )

            # Execute based on node type
            if node_type == "extractor":
                # For extractors, we need sample data
                # In a real implementation, this would extract from the actual source
                # For now, create sample data
                data = pd.DataFrame({
                    "id": range(1, 101),
                    "name": [f"Sample {i}" for i in range(1, 101)],
                    "value": [i * 10 for i in range(1, 101)],
                    "category": ["A" if i % 2 == 0 else "B" for i in range(1, 101)],
                })

            elif node_type == "transformer":
                if data is None:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Transformer requires input data"
                    )

                # Execute transformation
                if module_id == "python-transformer":
                    code = config.get("transformation_code", "")
                    if code:
                        from app.core.code_executor import CodeExecutor
                        executor = CodeExecutor()
                        result = executor.execute(code, data)
                        data = result["output"]

                elif module_id == "sql-transformer":
                    query = config.get("sql_query", "")
                    if query:
                        from app.modules.transformers.sql_transform import SQLTransformer
                        transformer = SQLTransformer()
                        data = transformer.transform(data, {"query": query})

            elif node_type == "loader":
                # For preview, we just pass through the data
                # In real execution, this would load to destination
                pass

        # Generate preview response
        if data is None or data.empty:
            return {
                "success": False,
                "error": "No data available",
                "error_type": "NoDataError"
            }

        # Calculate statistics
        input_shape = list(data.shape)
        output_shape = list(data.shape)

        # Get column info
        schema = {}
        for col in data.columns:
            col_data = data[col]
            schema[col] = {
                "dtype": str(col_data.dtype),
                "null_count": int(col_data.isna().sum()),
                "unique_count": int(col_data.nunique()),
            }

        # Get preview data (first 10 rows)
        preview_rows = data.head(10).to_dict(orient="records")

        return {
            "success": True,
            "input_shape": input_shape,
            "output_shape": output_shape,
            "input_columns": list(data.columns),
            "output_columns": list(data.columns),
            "preview_data": preview_rows,
            "schema": schema,
            "statistics": {
                "total_rows": len(data),
                "total_columns": len(data.columns),
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Preview failed: {str(e)}"
        )
