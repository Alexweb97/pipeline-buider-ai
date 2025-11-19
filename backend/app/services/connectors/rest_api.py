"""
REST API Connector
"""
import logging
from typing import Any

import requests

from app.schemas.connection import ConnectionTestResult
from app.services.connectors.base import BaseConnector

logger = logging.getLogger(__name__)


class RestAPIConnector(BaseConnector):
    """Connector for REST APIs"""

    def test_connection(self, config: dict[str, Any]) -> ConnectionTestResult:
        """Test REST API connection"""
        try:
            # Validate config
            is_valid, message = self.validate_config(config)
            if not is_valid:
                return ConnectionTestResult(
                    success=False, message=message, details={}
                )

            # Prepare request
            url = config.get("base_url") or config.get("url")
            method = config.get("test_method", "GET").upper()
            headers = config.get("headers", {})
            auth_type = config.get("auth_type", "none")

            # Add authentication
            auth = None
            if auth_type == "bearer" and config.get("token"):
                headers["Authorization"] = f"Bearer {config['token']}"
            elif auth_type == "api_key":
                key_name = config.get("api_key_name", "X-API-Key")
                headers[key_name] = config.get("api_key", "")
            elif auth_type == "basic":
                auth = (config.get("username", ""), config.get("password", ""))

            # Make request
            response = requests.request(
                method=method,
                url=url,
                headers=headers,
                auth=auth,
                timeout=config.get("timeout", 10),
            )

            # Consider 2xx and 401/403 as successful connection (401/403 means API is reachable but credentials might be wrong)
            success = response.status_code < 500

            return ConnectionTestResult(
                success=success,
                message=f"API responded with status {response.status_code}",
                details={
                    "status_code": response.status_code,
                    "response_time": response.elapsed.total_seconds(),
                },
            )

        except requests.exceptions.Timeout:
            logger.error("REST API connection timeout")
            return ConnectionTestResult(
                success=False,
                message="Connection timeout",
                details={},
            )
        except requests.exceptions.ConnectionError as e:
            logger.error(f"REST API connection error: {str(e)}")
            return ConnectionTestResult(
                success=False,
                message=f"Connection error: {str(e)}",
                details={},
            )
        except Exception as e:
            logger.error(f"Unexpected error testing REST API connection: {str(e)}")
            return ConnectionTestResult(
                success=False, message=f"Unexpected error: {str(e)}", details={}
            )

    def get_connection_string(self, config: dict[str, Any]) -> str:
        """Generate REST API connection string"""
        return config.get("base_url") or config.get("url", "")

    def validate_config(self, config: dict[str, Any]) -> tuple[bool, str]:
        """Validate REST API configuration"""
        url = config.get("base_url") or config.get("url")

        if not url:
            return False, "Missing required field: base_url or url"

        if not url.startswith(("http://", "https://")):
            return False, "URL must start with http:// or https://"

        return True, "Configuration is valid"
