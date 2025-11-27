"""
Dashboard API Endpoints
CRUD operations for dashboards
"""
from typing import Any
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_current_user, get_db
from app.db.models.dashboard import Dashboard
from app.db.models.dashboard_share import DashboardShare
from app.db.models.user import User
from app.schemas.dashboard import (
    DashboardCreate,
    DashboardListResponse,
    DashboardResponse,
    DashboardShareCreate,
    DashboardShareResponse,
    DashboardUpdate,
    DashboardWithShares,
)

router = APIRouter()


@router.post("", response_model=DashboardResponse, status_code=status.HTTP_201_CREATED)
def create_dashboard(
    dashboard_in: DashboardCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dashboard:
    """
    Create a new dashboard
    """
    dashboard = Dashboard(
        **dashboard_in.model_dump(),
        created_by=current_user.id,
    )
    db.add(dashboard)
    db.commit()
    db.refresh(dashboard)
    return dashboard


@router.get("", response_model=DashboardListResponse)
def list_dashboards(
    skip: int = 0,
    limit: int = 100,
    pipeline_id: UUID | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    """
    List all dashboards accessible by the current user
    """
    query = db.query(Dashboard).filter(
        (Dashboard.created_by == current_user.id)
        | (
            Dashboard.id.in_(
                db.query(DashboardShare.dashboard_id).filter(
                    DashboardShare.user_id == current_user.id
                )
            )
        )
    )

    if pipeline_id:
        query = query.filter(Dashboard.pipeline_id == pipeline_id)

    total = query.count()
    dashboards = query.offset(skip).limit(limit).all()

    return {"dashboards": dashboards, "total": total}


@router.get("/{dashboard_id}", response_model=DashboardWithShares)
def get_dashboard(
    dashboard_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dashboard:
    """
    Get a specific dashboard by ID
    """
    dashboard = db.query(Dashboard).filter(Dashboard.id == dashboard_id).first()

    if not dashboard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dashboard not found",
        )

    # Check access permissions
    is_owner = dashboard.created_by == current_user.id
    has_share = (
        db.query(DashboardShare)
        .filter(
            DashboardShare.dashboard_id == dashboard_id,
            DashboardShare.user_id == current_user.id,
        )
        .first()
    )

    if not (is_owner or has_share):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have access to this dashboard",
        )

    return dashboard


@router.put("/{dashboard_id}", response_model=DashboardResponse)
def update_dashboard(
    dashboard_id: UUID,
    dashboard_in: DashboardUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Dashboard:
    """
    Update a dashboard
    """
    dashboard = db.query(Dashboard).filter(Dashboard.id == dashboard_id).first()

    if not dashboard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dashboard not found",
        )

    # Check if user has edit permission
    is_owner = dashboard.created_by == current_user.id
    share = (
        db.query(DashboardShare)
        .filter(
            DashboardShare.dashboard_id == dashboard_id,
            DashboardShare.user_id == current_user.id,
        )
        .first()
    )
    has_edit = share and share.permission == "edit"

    if not (is_owner or has_edit):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to edit this dashboard",
        )

    # Update dashboard
    update_data = dashboard_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(dashboard, field, value)

    db.commit()
    db.refresh(dashboard)
    return dashboard


@router.delete("/{dashboard_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_dashboard(
    dashboard_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    """
    Delete a dashboard (only owner can delete)
    """
    dashboard = db.query(Dashboard).filter(Dashboard.id == dashboard_id).first()

    if not dashboard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dashboard not found",
        )

    # Only owner can delete
    if dashboard.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the owner can delete this dashboard",
        )

    db.delete(dashboard)
    db.commit()


# Dashboard Sharing Endpoints
@router.post(
    "/{dashboard_id}/shares",
    response_model=DashboardShareResponse,
    status_code=status.HTTP_201_CREATED,
)
def share_dashboard(
    dashboard_id: UUID,
    share_in: DashboardShareCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DashboardShare:
    """
    Share a dashboard with another user
    """
    dashboard = db.query(Dashboard).filter(Dashboard.id == dashboard_id).first()

    if not dashboard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dashboard not found",
        )

    # Only owner can share
    if dashboard.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the owner can share this dashboard",
        )

    # Check if already shared with this user
    existing_share = (
        db.query(DashboardShare)
        .filter(
            DashboardShare.dashboard_id == dashboard_id,
            DashboardShare.user_id == share_in.user_id,
        )
        .first()
    )

    if existing_share:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Dashboard is already shared with this user",
        )

    # Create share
    share = DashboardShare(
        dashboard_id=dashboard_id,
        **share_in.model_dump(),
    )
    db.add(share)
    db.commit()
    db.refresh(share)
    return share


@router.delete("/{dashboard_id}/shares/{share_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_dashboard_share(
    dashboard_id: UUID,
    share_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    """
    Remove a dashboard share
    """
    dashboard = db.query(Dashboard).filter(Dashboard.id == dashboard_id).first()

    if not dashboard:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Dashboard not found",
        )

    # Only owner can remove shares
    if dashboard.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only the owner can remove shares",
        )

    share = (
        db.query(DashboardShare)
        .filter(
            DashboardShare.id == share_id,
            DashboardShare.dashboard_id == dashboard_id,
        )
        .first()
    )

    if not share:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Share not found",
        )

    db.delete(share)
    db.commit()


@router.get("/{dashboard_id}/data")
def get_dashboard_data(
    dashboard_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict[str, Any]:
    """
    Get data for dashboard visualizations from the latest pipeline execution
    """
    from app.services.dashboard_data_service import DashboardDataService

    try:
        data = DashboardDataService.get_dashboard_data(
            db=db,
            dashboard_id=dashboard_id,
            user_id=current_user.id,
        )
        return data
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e),
        )
    except PermissionError as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=str(e),
        )
