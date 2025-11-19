"""
MongoDB Connector
"""
import logging
from typing import Any

try:
    from pymongo import MongoClient
    from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
    MONGODB_AVAILABLE = True
except ImportError:
    MONGODB_AVAILABLE = False

from app.schemas.connection import ConnectionTestResult
from app.services.connectors.base import BaseConnector

logger = logging.getLogger(__name__)


class MongoDBConnector(BaseConnector):
    """Connector for MongoDB databases"""

    def test_connection(self, config: dict[str, Any]) -> ConnectionTestResult:
        """Test MongoDB connection"""
        if not MONGODB_AVAILABLE:
            return ConnectionTestResult(
                success=False,
                message="MongoDB connector not installed. Install pymongo",
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
            conn_string = self.get_connection_string(config)
            client = MongoClient(conn_string, serverSelectionTimeoutMS=5000)

            # Test the connection
            server_info = client.server_info()
            version = server_info.get("version", "unknown")

            client.close()

            return ConnectionTestResult(
                success=True,
                message="Successfully connected to MongoDB",
                details={"version": version},
            )

        except (ConnectionFailure, ServerSelectionTimeoutError) as e:
            logger.error(f"MongoDB connection test failed: {str(e)}")
            return ConnectionTestResult(
                success=False,
                message=f"Connection failed: {str(e)}",
                details={},
            )
        except Exception as e:
            logger.error(f"Unexpected error testing MongoDB connection: {str(e)}")
            return ConnectionTestResult(
                success=False, message=f"Unexpected error: {str(e)}", details={}
            )

    def get_connection_string(self, config: dict[str, Any]) -> str:
        """Generate MongoDB connection string"""
        host = config.get("host", "localhost")
        port = config.get("port", 27017)
        database = config.get("database", "")
        user = config.get("user")
        password = config.get("password")

        if user and password:
            return f"mongodb://{user}:{password}@{host}:{port}/{database}"
        else:
            return f"mongodb://{host}:{port}/{database}"

    def validate_config(self, config: dict[str, Any]) -> tuple[bool, str]:
        """Validate MongoDB configuration"""
        required_fields = ["host"]

        for field in required_fields:
            if field not in config or not config[field]:
                return False, f"Missing required field: {field}"

        return True, "Configuration is valid"
