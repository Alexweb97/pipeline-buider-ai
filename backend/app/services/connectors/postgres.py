"""
PostgreSQL Connector
"""
import logging
from typing import Any

import psycopg2

from app.schemas.connection import ConnectionTestResult
from app.services.connectors.base import BaseConnector

logger = logging.getLogger(__name__)


class PostgresConnector(BaseConnector):
    """Connector for PostgreSQL databases"""

    def test_connection(self, config: dict[str, Any]) -> ConnectionTestResult:
        """Test PostgreSQL connection"""
        try:
            # Validate config
            is_valid, message = self.validate_config(config)
            if not is_valid:
                return ConnectionTestResult(
                    success=False, message=message, details={}
                )

            # Try to connect
            conn_string = self.get_connection_string(config)
            conn = psycopg2.connect(conn_string)

            # Execute a simple query
            cursor = conn.cursor()
            cursor.execute("SELECT version();")
            version = cursor.fetchone()[0]

            cursor.close()
            conn.close()

            return ConnectionTestResult(
                success=True,
                message="Successfully connected to PostgreSQL",
                details={"version": version},
            )

        except psycopg2.Error as e:
            logger.error(f"PostgreSQL connection test failed: {str(e)}")
            return ConnectionTestResult(
                success=False,
                message=f"Connection failed: {str(e)}",
                details={"error_code": e.pgcode if hasattr(e, "pgcode") else None},
            )
        except Exception as e:
            logger.error(f"Unexpected error testing PostgreSQL connection: {str(e)}")
            return ConnectionTestResult(
                success=False, message=f"Unexpected error: {str(e)}", details={}
            )

    def get_connection_string(self, config: dict[str, Any]) -> str:
        """Generate PostgreSQL connection string"""
        host = config.get("host", "localhost")
        port = config.get("port", 5432)
        database = config.get("database", "")
        user = config.get("user", "")
        password = config.get("password", "")

        return f"host={host} port={port} dbname={database} user={user} password={password}"

    def validate_config(self, config: dict[str, Any]) -> tuple[bool, str]:
        """Validate PostgreSQL configuration"""
        required_fields = ["host", "database", "user"]

        for field in required_fields:
            if field not in config or not config[field]:
                return False, f"Missing required field: {field}"

        return True, "Configuration is valid"
