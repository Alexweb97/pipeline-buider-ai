"""
Connection API Routes
Manage data source connections
"""
import logging
from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, get_db
from app.db.models.user import User
from app.schemas.connection import (
    ConnectionCreate,
    ConnectionResponse,
    ConnectionUpdate,
    ConnectionTest,
    ConnectionTestResult,
)
from app.services.connection_service import ConnectionService

logger = logging.getLogger(__name__)

router = APIRouter()


@router.get("", response_model=list[ConnectionResponse])
def list_connections(
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    connection_type: str | None = Query(None, description="Filter by connection type"),
):
    """List all connections for the current user"""
    service = ConnectionService(db)
    connections = service.list_connections(
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        connection_type=connection_type,
    )
    return connections


@router.get("/{connection_id}", response_model=ConnectionResponse)
def get_connection(
    connection_id: UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Get a specific connection"""
    service = ConnectionService(db)
    connection = service.get_connection(connection_id, current_user.id)

    if not connection:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connection not found",
        )

    return connection


@router.post("", response_model=ConnectionResponse, status_code=status.HTTP_201_CREATED)
def create_connection(
    connection_data: ConnectionCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Create a new connection"""
    service = ConnectionService(db)

    try:
        connection = service.create_connection(connection_data, current_user.id)
        return connection
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Error creating connection: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create connection",
        )


@router.put("/{connection_id}", response_model=ConnectionResponse)
def update_connection(
    connection_id: UUID,
    connection_data: ConnectionUpdate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Update an existing connection"""
    service = ConnectionService(db)

    try:
        connection = service.update_connection(connection_id, connection_data, current_user.id)

        if not connection:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Connection not found",
            )

        return connection
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )
    except Exception as e:
        logger.error(f"Error updating connection: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update connection",
        )


@router.delete("/{connection_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_connection(
    connection_id: UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Delete a connection"""
    service = ConnectionService(db)

    success = service.delete_connection(connection_id, current_user.id)

    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Connection not found",
        )


@router.post("/{connection_id}/test", response_model=ConnectionTestResult)
def test_connection(
    connection_id: UUID,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Test a saved connection"""
    service = ConnectionService(db)
    result = service.test_connection(connection_id, current_user.id)
    return result


@router.post("/test", response_model=ConnectionTestResult)
def test_connection_config(
    config: ConnectionTest,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Test a connection configuration without saving it"""
    service = ConnectionService(db)
    result = service.test_connection_config(config.type, config.config)
    return result


@router.get("/types/available", response_model=list[dict])
def get_available_connection_types(
    current_user: Annotated[User, Depends(get_current_user)],
):
    """Get list of available connection types with their required fields"""
    return [
        {
            "type": "postgres",
            "name": "PostgreSQL",
            "description": "PostgreSQL database connection",
            "required_fields": ["host", "database", "user", "password"],
            "optional_fields": ["port (default: 5432)", "schema"],
        },
        {
            "type": "mysql",
            "name": "MySQL",
            "description": "MySQL database connection",
            "required_fields": ["host", "database", "user", "password"],
            "optional_fields": ["port (default: 3306)"],
        },
        {
            "type": "mongodb",
            "name": "MongoDB",
            "description": "MongoDB database connection",
            "required_fields": ["host"],
            "optional_fields": ["port (default: 27017)", "database", "user", "password"],
        },
        {
            "type": "s3",
            "name": "AWS S3",
            "description": "Amazon S3 storage connection",
            "required_fields": ["access_key_id", "secret_access_key"],
            "optional_fields": ["region (default: us-east-1)", "bucket"],
        },
        {
            "type": "rest-api",
            "name": "REST API",
            "description": "REST API connection",
            "required_fields": ["base_url"],
            "optional_fields": ["auth_type", "api_key", "token", "username", "password", "headers"],
        },
    ]
