"""
Airflow API Client
Wrapper for Apache Airflow REST API communication
"""
import logging
from datetime import datetime
from typing import Any, Optional
from uuid import UUID

import httpx
from airflow_client.client.api import dag_api, dag_run_api
from airflow_client.client.api_client import ApiClient
from airflow_client.client.configuration import Configuration
from airflow_client.client.model.dag_run import DAGRun

from app.core.config import settings

logger = logging.getLogger(__name__)


class AirflowClient:
    """
    Client for interacting with Apache Airflow API

    Handles:
    - DAG triggering
    - Execution monitoring
    - Status polling
    - DAG management
    """

    def __init__(self, base_url: str = None, username: str = "admin", password: str = "admin"):
        """
        Initialize Airflow API client

        Args:
            base_url: Airflow API base URL (e.g., http://airflow-webserver:8080/api/v1)
            username: Airflow username for basic auth
            password: Airflow password
        """
        self.base_url = base_url or settings.AIRFLOW_API_URL
        self.username = username
        self.password = password

        # Configure API client
        self.configuration = Configuration(
            host=self.base_url,
            username=self.username,
            password=self.password,
        )

        self.api_client = ApiClient(self.configuration)
        self.dag_api = dag_api.DAGApi(self.api_client)
        self.dag_run_api = dag_run_api.DAGRunApi(self.api_client)

        logger.info(f"Airflow client initialized with base URL: {self.base_url}")

    async def trigger_dag(
        self,
        dag_id: str,
        conf: dict[str, Any] = None,
        execution_date: datetime = None,
    ) -> dict[str, Any]:
        """
        Trigger an Airflow DAG execution

        Args:
            dag_id: DAG identifier
            conf: Configuration to pass to the DAG (pipeline config, params, etc.)
            execution_date: Optional execution date (defaults to now)

        Returns:
            DAG run information including dag_run_id

        Raises:
            Exception: If DAG trigger fails
        """
        try:
            logger.info(f"Triggering DAG: {dag_id}")

            dag_run = DAGRun(
                conf=conf or {},
                execution_date=execution_date or datetime.utcnow(),
            )

            result = self.dag_run_api.post_dag_run(dag_id, dag_run)

            logger.info(f"DAG triggered successfully: {dag_id}, run_id: {result.dag_run_id}")

            return {
                "dag_id": result.dag_id,
                "dag_run_id": result.dag_run_id,
                "execution_date": result.execution_date.isoformat() if result.execution_date else None,
                "state": result.state,
                "external_trigger": result.external_trigger,
            }

        except Exception as e:
            logger.error(f"Failed to trigger DAG {dag_id}: {str(e)}")
            raise

    async def get_dag_run_status(self, dag_id: str, dag_run_id: str) -> dict[str, Any]:
        """
        Get status of a DAG run

        Args:
            dag_id: DAG identifier
            dag_run_id: DAG run identifier

        Returns:
            DAG run status information
        """
        try:
            result = self.dag_run_api.get_dag_run(dag_id, dag_run_id)

            return {
                "dag_id": result.dag_id,
                "dag_run_id": result.dag_run_id,
                "state": result.state,
                "execution_date": result.execution_date.isoformat() if result.execution_date else None,
                "start_date": result.start_date.isoformat() if result.start_date else None,
                "end_date": result.end_date.isoformat() if result.end_date else None,
                "conf": result.conf,
            }

        except Exception as e:
            logger.error(f"Failed to get DAG run status for {dag_id}/{dag_run_id}: {str(e)}")
            raise

    async def cancel_dag_run(self, dag_id: str, dag_run_id: str) -> dict[str, Any]:
        """
        Cancel a running DAG

        Args:
            dag_id: DAG identifier
            dag_run_id: DAG run identifier

        Returns:
            Updated DAG run information
        """
        try:
            logger.info(f"Cancelling DAG run: {dag_id}/{dag_run_id}")

            # Use PATCH to update state to 'failed' (Airflow doesn't have explicit cancel)
            dag_run = DAGRun(state="failed")
            result = self.dag_run_api.patch_dag_run(dag_id, dag_run_id, dag_run)

            logger.info(f"DAG run cancelled: {dag_id}/{dag_run_id}")

            return {
                "dag_id": result.dag_id,
                "dag_run_id": result.dag_run_id,
                "state": result.state,
            }

        except Exception as e:
            logger.error(f"Failed to cancel DAG run {dag_id}/{dag_run_id}: {str(e)}")
            raise

    async def check_dag_exists(self, dag_id: str) -> bool:
        """
        Check if a DAG exists in Airflow

        Args:
            dag_id: DAG identifier

        Returns:
            True if DAG exists, False otherwise
        """
        try:
            self.dag_api.get_dag(dag_id)
            return True
        except Exception:
            return False

    async def pause_dag(self, dag_id: str) -> None:
        """
        Pause a DAG

        Args:
            dag_id: DAG identifier
        """
        try:
            logger.info(f"Pausing DAG: {dag_id}")
            self.dag_api.patch_dag(dag_id, {"is_paused": True})
            logger.info(f"DAG paused: {dag_id}")
        except Exception as e:
            logger.error(f"Failed to pause DAG {dag_id}: {str(e)}")
            raise

    async def unpause_dag(self, dag_id: str) -> None:
        """
        Unpause a DAG

        Args:
            dag_id: DAG identifier
        """
        try:
            logger.info(f"Unpausing DAG: {dag_id}")
            self.dag_api.patch_dag(dag_id, {"is_paused": False})
            logger.info(f"DAG unpaused: {dag_id}")
        except Exception as e:
            logger.error(f"Failed to unpause DAG {dag_id}: {str(e)}")
            raise

    async def get_task_instance_logs(
        self, dag_id: str, dag_run_id: str, task_id: str
    ) -> str:
        """
        Get logs for a specific task instance

        Args:
            dag_id: DAG identifier
            dag_run_id: DAG run identifier
            task_id: Task identifier

        Returns:
            Task logs as string
        """
        try:
            # Note: This requires additional API endpoint implementation
            # For now, return placeholder
            logger.warning("Task instance logs not yet implemented")
            return f"Logs for {dag_id}/{dag_run_id}/{task_id}"

        except Exception as e:
            logger.error(f"Failed to get task logs: {str(e)}")
            raise

    def close(self):
        """Close the API client"""
        if self.api_client:
            self.api_client.close()


# Global client instance
_airflow_client: Optional[AirflowClient] = None


def get_airflow_client() -> AirflowClient:
    """
    Get or create singleton Airflow client instance

    Returns:
        AirflowClient instance
    """
    global _airflow_client

    if _airflow_client is None:
        _airflow_client = AirflowClient()

    return _airflow_client
