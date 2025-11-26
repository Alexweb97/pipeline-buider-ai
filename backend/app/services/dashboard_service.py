"""
Dashboard Service
Business logic for dashboard operations
"""
import logging
from typing import Any
from uuid import UUID

from sqlalchemy.orm import Session

from app.db.models.dashboard import Dashboard
from app.db.models.dashboard_share import DashboardShare
from app.db.models.pipeline import Pipeline
from app.schemas.dashboard import DashboardCreate, DashboardUpdate

logger = logging.getLogger(__name__)


class DashboardService:
    """Service for dashboard business logic"""

    @staticmethod
    def create_dashboard(
        db: Session,
        dashboard_data: DashboardCreate,
        user_id: UUID,
    ) -> Dashboard:
        """
        Create a new dashboard

        Args:
            db: Database session
            dashboard_data: Dashboard creation data
            user_id: ID of the user creating the dashboard

        Returns:
            Created dashboard

        Raises:
            ValueError: If pipeline doesn't exist
        """
        # Verify pipeline exists and user has access
        pipeline = db.query(Pipeline).filter(Pipeline.id == dashboard_data.pipeline_id).first()
        if not pipeline:
            raise ValueError(f"Pipeline {dashboard_data.pipeline_id} not found")

        if pipeline.created_by != user_id:
            raise PermissionError("You don't have access to this pipeline")

        # Create dashboard
        dashboard = Dashboard(
            **dashboard_data.model_dump(),
            created_by=user_id,
        )

        db.add(dashboard)
        db.commit()
        db.refresh(dashboard)

        logger.info(f"Dashboard created: {dashboard.id} for pipeline {pipeline.id}")
        return dashboard

    @staticmethod
    def update_dashboard(
        db: Session,
        dashboard_id: UUID,
        dashboard_data: DashboardUpdate,
        user_id: UUID,
    ) -> Dashboard:
        """
        Update an existing dashboard

        Args:
            db: Database session
            dashboard_id: ID of the dashboard to update
            dashboard_data: Update data
            user_id: ID of the user updating the dashboard

        Returns:
            Updated dashboard

        Raises:
            ValueError: If dashboard doesn't exist
            PermissionError: If user doesn't have edit permission
        """
        dashboard = db.query(Dashboard).filter(Dashboard.id == dashboard_id).first()

        if not dashboard:
            raise ValueError(f"Dashboard {dashboard_id} not found")

        # Check permissions
        if not DashboardService.has_edit_permission(db, dashboard_id, user_id):
            raise PermissionError("You don't have permission to edit this dashboard")

        # Update fields
        update_data = dashboard_data.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(dashboard, field, value)

        db.commit()
        db.refresh(dashboard)

        logger.info(f"Dashboard updated: {dashboard_id}")
        return dashboard

    @staticmethod
    def delete_dashboard(
        db: Session,
        dashboard_id: UUID,
        user_id: UUID,
    ) -> None:
        """
        Delete a dashboard

        Args:
            db: Database session
            dashboard_id: ID of the dashboard to delete
            user_id: ID of the user deleting the dashboard

        Raises:
            ValueError: If dashboard doesn't exist
            PermissionError: If user is not the owner
        """
        dashboard = db.query(Dashboard).filter(Dashboard.id == dashboard_id).first()

        if not dashboard:
            raise ValueError(f"Dashboard {dashboard_id} not found")

        # Only owner can delete
        if dashboard.created_by != user_id:
            raise PermissionError("Only the owner can delete this dashboard")

        db.delete(dashboard)
        db.commit()

        logger.info(f"Dashboard deleted: {dashboard_id}")

    @staticmethod
    def share_dashboard(
        db: Session,
        dashboard_id: UUID,
        target_user_id: UUID,
        permission: str,
        owner_id: UUID,
    ) -> DashboardShare:
        """
        Share a dashboard with another user

        Args:
            db: Database session
            dashboard_id: ID of the dashboard to share
            target_user_id: ID of the user to share with
            permission: Permission level ('view' or 'edit')
            owner_id: ID of the dashboard owner

        Returns:
            Created dashboard share

        Raises:
            ValueError: If dashboard doesn't exist or already shared
            PermissionError: If user is not the owner
        """
        dashboard = db.query(Dashboard).filter(Dashboard.id == dashboard_id).first()

        if not dashboard:
            raise ValueError(f"Dashboard {dashboard_id} not found")

        if dashboard.created_by != owner_id:
            raise PermissionError("Only the owner can share this dashboard")

        # Check if already shared
        existing_share = (
            db.query(DashboardShare)
            .filter(
                DashboardShare.dashboard_id == dashboard_id,
                DashboardShare.user_id == target_user_id,
            )
            .first()
        )

        if existing_share:
            raise ValueError("Dashboard is already shared with this user")

        # Create share
        share = DashboardShare(
            dashboard_id=dashboard_id,
            user_id=target_user_id,
            permission=permission,
        )

        db.add(share)
        db.commit()
        db.refresh(share)

        logger.info(
            f"Dashboard {dashboard_id} shared with user {target_user_id} ({permission})"
        )
        return share

    @staticmethod
    def has_access(db: Session, dashboard_id: UUID, user_id: UUID) -> bool:
        """
        Check if user has access to dashboard

        Args:
            db: Database session
            dashboard_id: ID of the dashboard
            user_id: ID of the user

        Returns:
            True if user has access, False otherwise
        """
        dashboard = db.query(Dashboard).filter(Dashboard.id == dashboard_id).first()

        if not dashboard:
            return False

        # Owner has access
        if dashboard.created_by == user_id:
            return True

        # Check if shared
        share = (
            db.query(DashboardShare)
            .filter(
                DashboardShare.dashboard_id == dashboard_id,
                DashboardShare.user_id == user_id,
            )
            .first()
        )

        return share is not None

    @staticmethod
    def has_edit_permission(db: Session, dashboard_id: UUID, user_id: UUID) -> bool:
        """
        Check if user has edit permission for dashboard

        Args:
            db: Database session
            dashboard_id: ID of the dashboard
            user_id: ID of the user

        Returns:
            True if user has edit permission, False otherwise
        """
        dashboard = db.query(Dashboard).filter(Dashboard.id == dashboard_id).first()

        if not dashboard:
            return False

        # Owner has edit permission
        if dashboard.created_by == user_id:
            return True

        # Check if shared with edit permission
        share = (
            db.query(DashboardShare)
            .filter(
                DashboardShare.dashboard_id == dashboard_id,
                DashboardShare.user_id == user_id,
                DashboardShare.permission == "edit",
            )
            .first()
        )

        return share is not None

    @staticmethod
    def get_user_dashboards(
        db: Session,
        user_id: UUID,
        pipeline_id: UUID | None = None,
        skip: int = 0,
        limit: int = 100,
    ) -> tuple[list[Dashboard], int]:
        """
        Get all dashboards accessible by a user

        Args:
            db: Database session
            user_id: ID of the user
            pipeline_id: Optional pipeline filter
            skip: Number of records to skip
            limit: Maximum number of records to return

        Returns:
            Tuple of (dashboards list, total count)
        """
        # Build query for owned or shared dashboards
        query = db.query(Dashboard).filter(
            (Dashboard.created_by == user_id)
            | (
                Dashboard.id.in_(
                    db.query(DashboardShare.dashboard_id).filter(
                        DashboardShare.user_id == user_id
                    )
                )
            )
        )

        # Apply pipeline filter if provided
        if pipeline_id:
            query = query.filter(Dashboard.pipeline_id == pipeline_id)

        # Get total count
        total = query.count()

        # Get paginated results
        dashboards = query.offset(skip).limit(limit).all()

        return dashboards, total
