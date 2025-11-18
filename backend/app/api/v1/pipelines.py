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

        print(f"[DEBUG] Preview request for node_id: {node_id}")
        print(f"[DEBUG] Node data: {node}")
        print(f"[DEBUG] Number of nodes: {len(nodes)}")
        print(f"[DEBUG] Number of edges: {len(edges)}")

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

        print(f"[DEBUG] Execution order: {[n.get('id') for n in execution_order]}")

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

            print(f"[DEBUG] Executing node: {exec_node.get('id')}, type: {node_type}, module: {module_id}")
            print(f"[DEBUG] Config: {config}")

            # Get module definition
            module_def = get_module_definition(module_id)
            if not module_def:
                print(f"[ERROR] Module not found: {module_id}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Module {module_id} not found"
                )

            # Execute based on node type
            if node_type == "extractor":
                # Handle REST API extractor specially
                if module_id == "rest-api-extractor":
                    import requests

                    url = config.get("url", "").strip()
                    if not url:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail="URL is required for REST API extractor"
                        )

                    method = config.get("method", "GET").upper()
                    headers = config.get("headers", {})
                    params = config.get("params", {})
                    timeout = config.get("timeout", 30)

                    print(f"[DEBUG] Calling REST API: {method} {url}")
                    print(f"[DEBUG] Headers: {headers}")
                    print(f"[DEBUG] Params: {params}")

                    try:
                        response = requests.request(
                            method=method,
                            url=url,
                            headers=headers,
                            params=params,
                            timeout=timeout
                        )
                        response.raise_for_status()

                        # Detect content type
                        content_type = response.headers.get('content-type', '').lower()
                        print(f"[DEBUG] API Response Content-Type: {content_type}")

                        # Parse based on content type
                        if 'json' in content_type:
                            # JSON response
                            json_data = response.json()
                            print(f"[DEBUG] API Response keys: {json_data.keys() if isinstance(json_data, dict) else 'list'}")

                            # Extract data from JSON
                            if isinstance(json_data, dict):
                                if "data" in json_data:
                                    raw_data = json_data["data"]
                                elif "results" in json_data:
                                    raw_data = json_data["results"]
                                elif "items" in json_data:
                                    raw_data = json_data["items"]
                                elif "observations" in json_data:
                                    raw_data = json_data["observations"]
                                else:
                                    # Use the whole response
                                    raw_data = [json_data]
                            elif isinstance(json_data, list):
                                raw_data = json_data
                            else:
                                raise HTTPException(
                                    status_code=status.HTTP_400_BAD_REQUEST,
                                    detail="Unexpected JSON format"
                                )

                            # Normalize nested JSON structures
                            try:
                                data = pd.json_normalize(raw_data)
                                print(f"[DEBUG] Normalized {len(raw_data)} records with json_normalize")
                            except Exception as e:
                                # Fallback to regular DataFrame if normalization fails
                                print(f"[DEBUG] json_normalize failed: {e}, using regular DataFrame")
                                data = pd.DataFrame(raw_data)

                        elif 'xml' in content_type:
                            # XML response
                            import xml.etree.ElementTree as ET
                            from collections import Counter

                            print("[DEBUG] Parsing XML response")
                            root = ET.fromstring(response.content)
                            records = []

                            # Try to find repeating elements
                            children = list(root)
                            if children:
                                # Find most common tag (likely data rows)
                                tag_counts = Counter([child.tag.split('}')[-1] for child in children])
                                most_common_tag = tag_counts.most_common(1)[0][0]
                                data_elements = [c for c in children if c.tag.split('}')[-1] == most_common_tag]
                                print(f"[DEBUG] Found {len(data_elements)} <{most_common_tag}> elements")

                                # Extract records
                                for element in data_elements:
                                    record = {}
                                    for child in element:
                                        tag = child.tag.split('}')[-1]
                                        record[tag] = child.text
                                    if record:
                                        records.append(record)

                            if records:
                                data = pd.DataFrame(records)
                            else:
                                raise HTTPException(
                                    status_code=status.HTTP_400_BAD_REQUEST,
                                    detail="Could not extract data from XML"
                                )

                        elif 'csv' in content_type or 'text/plain' in content_type:
                            # CSV response
                            from io import StringIO
                            print("[DEBUG] Parsing CSV response")

                            try:
                                # Try to detect delimiter
                                text_content = response.text
                                # Common delimiters: comma, semicolon, tab, pipe
                                for delimiter in [',', ';', '\t', '|']:
                                    if delimiter in text_content.split('\n')[0]:
                                        data = pd.read_csv(StringIO(text_content), delimiter=delimiter)
                                        print(f"[DEBUG] Parsed CSV with delimiter '{delimiter}'")
                                        break
                                else:
                                    # Default to comma
                                    data = pd.read_csv(StringIO(text_content))
                                    print("[DEBUG] Parsed CSV with default comma delimiter")
                            except Exception as e:
                                print(f"[ERROR] CSV parsing failed: {e}")
                                raise HTTPException(
                                    status_code=status.HTTP_400_BAD_REQUEST,
                                    detail=f"Could not parse CSV: {str(e)}"
                                )

                        else:
                            # Unknown content type - try JSON, then CSV, then XML
                            print(f"[DEBUG] Unknown content type, trying multiple parsers")
                            try:
                                # Try JSON first
                                json_data = response.json()
                                if isinstance(json_data, dict):
                                    raw_data = json_data.get("data") or json_data.get("results") or [json_data]
                                elif isinstance(json_data, list):
                                    raw_data = json_data
                                else:
                                    raise ValueError("Not valid JSON structure")
                                data = pd.json_normalize(raw_data)
                                print("[DEBUG] Successfully parsed as JSON")
                            except Exception as json_err:
                                try:
                                    # Try CSV
                                    from io import StringIO
                                    data = pd.read_csv(StringIO(response.text))
                                    print("[DEBUG] Successfully parsed as CSV")
                                except Exception as csv_err:
                                    try:
                                        # Try XML
                                        import xml.etree.ElementTree as ET
                                        root = ET.fromstring(response.content)
                                        records = []
                                        for child in root:
                                            rec = {sc.tag.split('}')[-1]: sc.text for sc in child}
                                            if rec:
                                                records.append(rec)
                                        if records:
                                            data = pd.DataFrame(records)
                                            print("[DEBUG] Successfully parsed as XML")
                                        else:
                                            raise ValueError("No XML records found")
                                    except Exception as xml_err:
                                        raise HTTPException(
                                            status_code=status.HTTP_400_BAD_REQUEST,
                                            detail=f"Could not parse response as JSON, CSV, or XML. Errors: JSON={str(json_err)}, CSV={str(csv_err)}, XML={str(xml_err)}"
                                        )

                        print(f"[DEBUG] DataFrame shape: {data.shape}")
                        print(f"[DEBUG] Columns: {list(data.columns)}")

                    except requests.exceptions.RequestException as e:
                        print(f"[ERROR] REST API call failed: {str(e)}")
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"API request failed: {str(e)}"
                        )
                else:
                    # For other extractors, create sample data
                    # In a real implementation, this would extract from the actual source
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
                        transformer = SQLTransformer({"query": query})
                        data = transformer.execute(data)

                elif module_id == "clean-transformer":
                    from app.modules.transformers.clean import CleanTransformer
                    transformer = CleanTransformer(config)
                    data = transformer.execute(data)

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

            # Try to calculate unique count, but handle unhashable types (dict, list)
            try:
                unique_count = int(col_data.nunique())
            except (TypeError, ValueError):
                # If column contains unhashable types, use -1 as indicator
                unique_count = -1

            schema[col] = {
                "dtype": str(col_data.dtype),
                "null_count": int(col_data.isna().sum()),
                "unique_count": unique_count,
            }

        # Get preview data (first 10 rows)
        # Convert to dict with proper NaN/Inf handling for JSON serialization
        preview_df = data.head(10)

        # Import numpy for NaN/Inf detection in JSON serialization
        import numpy as np

        # Custom function to clean values for JSON serialization only
        # Note: This does NOT modify the actual data, only the preview display
        def clean_value(val):
            if pd.isna(val):
                return None
            if isinstance(val, (np.floating, float)):
                if np.isinf(val) or np.isnan(val):
                    return None
                return float(val)
            return val

        preview_rows = []
        for _, row in preview_df.iterrows():
            clean_row = {col: clean_value(val) for col, val in row.items()}
            preview_rows.append(clean_row)

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
