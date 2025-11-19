"""
Base Connector Interface
"""
from abc import ABC, abstractmethod
from typing import Any

from app.schemas.connection import ConnectionTestResult


class BaseConnector(ABC):
    """Base class for all data source connectors"""

    @abstractmethod
    def test_connection(self, config: dict[str, Any]) -> ConnectionTestResult:
        """Test the connection with the given configuration"""
        pass

    @abstractmethod
    def get_connection_string(self, config: dict[str, Any]) -> str:
        """Generate connection string from config"""
        pass

    def validate_config(self, config: dict[str, Any]) -> tuple[bool, str]:
        """Validate configuration (override in subclasses for specific validation)"""
        return True, "Configuration is valid"
