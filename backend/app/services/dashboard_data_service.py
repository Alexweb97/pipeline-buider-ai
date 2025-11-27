"""
Dashboard Data Service
Fetches and processes data for dashboard visualizations
"""
import logging
from typing import Any
from uuid import UUID

import pandas as pd
from sqlalchemy.orm import Session

from app.db.models.dashboard import Dashboard
from app.db.models.execution import PipelineExecution
from app.db.models.pipeline import Pipeline

logger = logging.getLogger(__name__)


class DashboardDataService:
    """Service for fetching dashboard data from pipeline executions"""

    @staticmethod
    def get_dashboard_data(
        db: Session,
        dashboard_id: UUID,
        user_id: UUID,
    ) -> dict[str, Any]:
        """
        Get data for a dashboard from the latest pipeline execution

        Args:
            db: Database session
            dashboard_id: ID of the dashboard
            user_id: ID of the user requesting data

        Returns:
            Dictionary containing dashboard data and metadata

        Raises:
            ValueError: If dashboard doesn't exist
            PermissionError: If user doesn't have access
        """
        # Get dashboard
        dashboard = db.query(Dashboard).filter(Dashboard.id == dashboard_id).first()

        if not dashboard:
            raise ValueError(f"Dashboard {dashboard_id} not found")

        # Check access permission
        from app.services.dashboard_service import DashboardService

        if not DashboardService.has_access(db, dashboard_id, user_id):
            raise PermissionError("You don't have access to this dashboard")

        # Get latest successful execution for the pipeline
        latest_execution = (
            db.query(PipelineExecution)
            .filter(
                PipelineExecution.pipeline_id == dashboard.pipeline_id,
                PipelineExecution.status == "completed",
            )
            .order_by(PipelineExecution.started_at.desc())
            .first()
        )

        if not latest_execution:
            logger.warning(
                f"No completed execution found for pipeline {dashboard.pipeline_id}"
            )
            return {
                "dashboard_id": str(dashboard_id),
                "pipeline_id": str(dashboard.pipeline_id),
                "execution_id": None,
                "data": None,
                "metadata": {
                    "rows": 0,
                    "columns": 0,
                    "last_updated": None,
                },
                "message": "No data available - pipeline has not been executed yet",
            }

        # Extract data from execution result
        execution_result = latest_execution.result or {}

        # Try to get output data from the execution
        # This depends on how your pipeline stores execution results
        data = DashboardDataService._extract_execution_data(execution_result)

        return {
            "dashboard_id": str(dashboard_id),
            "pipeline_id": str(dashboard.pipeline_id),
            "execution_id": str(latest_execution.id),
            "data": data,
            "metadata": {
                "rows": len(data) if isinstance(data, list) else 0,
                "columns": (
                    len(data[0].keys()) if data and isinstance(data, list) else 0
                ),
                "last_updated": latest_execution.completed_at.isoformat()
                if latest_execution.completed_at
                else None,
                "execution_time": latest_execution.duration,
            },
        }

    @staticmethod
    def _extract_execution_data(execution_result: dict[str, Any]) -> list[dict] | None:
        """
        Extract data from execution result

        Args:
            execution_result: Result dictionary from pipeline execution

        Returns:
            List of records or None if no data available
        """
        # Try different keys where data might be stored
        data_keys = ["data", "output", "result", "records"]

        for key in data_keys:
            if key in execution_result:
                data = execution_result[key]

                # Convert to list of dicts if it's a DataFrame
                if isinstance(data, pd.DataFrame):
                    return data.to_dict("records")

                # Return as-is if already list of dicts
                if isinstance(data, list):
                    return data

        # If no data found, return empty list
        logger.warning("No data found in execution result")
        return []

    @staticmethod
    def get_chart_data(
        db: Session,
        dashboard_id: UUID,
        chart_config: dict[str, Any],
        user_id: UUID,
    ) -> dict[str, Any]:
        """
        Get data for a specific chart based on its configuration

        Args:
            db: Database session
            dashboard_id: ID of the dashboard
            chart_config: Chart configuration (type, columns, aggregation, etc.)
            user_id: ID of the user requesting data

        Returns:
            Processed data for the chart
        """
        # Get raw dashboard data
        dashboard_data = DashboardDataService.get_dashboard_data(
            db, dashboard_id, user_id
        )

        raw_data = dashboard_data.get("data", [])

        if not raw_data:
            return {
                "chart_type": chart_config.get("type"),
                "data": [],
                "message": "No data available",
            }

        # Process data based on chart configuration
        chart_type = chart_config.get("type", "bar")
        x_axis = chart_config.get("xAxis")
        y_axis = chart_config.get("yAxis")
        aggregation = chart_config.get("aggregation", "sum")

        # Convert to DataFrame for easier processing
        df = pd.DataFrame(raw_data)

        # Apply filters if specified
        filters = chart_config.get("filters", {})
        for column, filter_value in filters.items():
            if column in df.columns:
                df = df[df[column] == filter_value]

        # Process based on chart type
        if chart_type in ["bar", "line", "area"]:
            processed_data = DashboardDataService._process_xy_chart(
                df, x_axis, y_axis, aggregation
            )
        elif chart_type == "pie":
            processed_data = DashboardDataService._process_pie_chart(
                df, x_axis, y_axis, aggregation
            )
        elif chart_type == "scatter":
            processed_data = DashboardDataService._process_scatter_chart(
                df, x_axis, y_axis
            )
        elif chart_type == "table":
            processed_data = df.to_dict("records")
        else:
            processed_data = df.to_dict("records")

        return {
            "chart_type": chart_type,
            "data": processed_data,
            "config": chart_config,
        }

    @staticmethod
    def _process_xy_chart(
        df: pd.DataFrame,
        x_column: str,
        y_column: str,
        aggregation: str = "sum",
    ) -> list[dict]:
        """Process data for bar, line, area charts"""
        if x_column not in df.columns or y_column not in df.columns:
            return []

        # Group by x_column and aggregate y_column
        if aggregation == "sum":
            grouped = df.groupby(x_column)[y_column].sum()
        elif aggregation == "avg":
            grouped = df.groupby(x_column)[y_column].mean()
        elif aggregation == "count":
            grouped = df.groupby(x_column)[y_column].count()
        elif aggregation == "min":
            grouped = df.groupby(x_column)[y_column].min()
        elif aggregation == "max":
            grouped = df.groupby(x_column)[y_column].max()
        else:
            grouped = df.groupby(x_column)[y_column].sum()

        return [
            {"x": str(x), "y": float(y)} for x, y in grouped.items()
        ]

    @staticmethod
    def _process_pie_chart(
        df: pd.DataFrame,
        label_column: str,
        value_column: str,
        aggregation: str = "sum",
    ) -> list[dict]:
        """Process data for pie/donut charts"""
        if label_column not in df.columns or value_column not in df.columns:
            return []

        # Group and aggregate
        if aggregation == "sum":
            grouped = df.groupby(label_column)[value_column].sum()
        elif aggregation == "count":
            grouped = df.groupby(label_column)[value_column].count()
        else:
            grouped = df.groupby(label_column)[value_column].sum()

        return [
            {"name": str(name), "value": float(value)}
            for name, value in grouped.items()
        ]

    @staticmethod
    def _process_scatter_chart(
        df: pd.DataFrame,
        x_column: str,
        y_column: str,
    ) -> list[dict]:
        """Process data for scatter charts"""
        if x_column not in df.columns or y_column not in df.columns:
            return []

        return [
            {"x": float(row[x_column]), "y": float(row[y_column])}
            for _, row in df.iterrows()
        ]
