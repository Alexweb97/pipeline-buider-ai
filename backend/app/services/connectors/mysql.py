"""
MySQL Connector
"""
import logging
from typing import Any

try:
    import mysql.connector
    MYSQL_AVAILABLE = True
except ImportError:
    MYSQL_AVAILABLE = False

from app.schemas.connection import ConnectionTestResult
from app.services.connectors.base import BaseConnector

logger = logging.getLogger(__name__)


class MySQLConnector(BaseConnector):
    """Connector for MySQL databases"""

    def test_connection(self, config: dict[str, Any]) -> ConnectionTestResult:
        """Test MySQL connection"""
        if not MYSQL_AVAILABLE:
            return ConnectionTestResult(
                success=False,
                message="MySQL connector not installed. Install mysql-connector-python",
                details={}
            )

        try:
            # Validate config
            is_valid, message = self.validate_config(config)
            if not is_valid:
                return ConnectionTestResult(
                    success=False, message=message, details={}
                )

            # Try to connect
            conn = mysql.connector.connect(
                host=config.get("host", "localhost"),
                port=config.get("port", 3306),
                database=config.get("database", ""),
                user=config.get("user", ""),
                password=config.get("password", ""),
            )

            # Execute a simple query
            cursor = conn.cursor()
            cursor.execute("SELECT VERSION();")
            version = cursor.fetchone()[0]

            cursor.close()
            conn.close()

            return ConnectionTestResult(
                success=True,
                message="Successfully connected to MySQL",
                details={"version": version},
            )

        except mysql.connector.Error as e:
            logger.error(f"MySQL connection test failed: {str(e)}")
            return ConnectionTestResult(
                success=False,
                message=f"Connection failed: {str(e)}",
                details={"error_code": e.errno if hasattr(e, "errno") else None},
            )
        except Exception as e:
            logger.error(f"Unexpected error testing MySQL connection: {str(e)}")
            return ConnectionTestResult(
                success=False, message=f"Unexpected error: {str(e)}", details={}
            )

    def get_connection_string(self, config: dict[str, Any]) -> str:
        """Generate MySQL connection string"""
        host = config.get("host", "localhost")
        port = config.get("port", 3306)
        database = config.get("database", "")
        user = config.get("user", "")
        password = config.get("password", "")

        return f"mysql://{user}:{password}@{host}:{port}/{database}"

    def validate_config(self, config: dict[str, Any]) -> tuple[bool, str]:
        """Validate MySQL configuration"""
        required_fields = ["host", "database", "user"]

        for field in required_fields:
            if field not in config or not config[field]:
                return False, f"Missing required field: {field}"

        return True, "Configuration is valid"
