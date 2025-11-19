"""
REST API Extractor Module
Extracts data from REST APIs
"""
import logging
from typing import Any

import pandas as pd
import requests
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)


class RestAPIExtractor:
    """
    Extract data from REST API endpoints

    Configuration:
        - url: API endpoint URL (required)
        - method: HTTP method (GET, POST, etc.) - default: GET
        - headers: Request headers - default: {}
        - params: URL parameters - default: {}
        - body: Request body (for POST/PUT) - default: None
        - auth_type: Authentication type (none, bearer, basic, api_key) - default: none
        - auth_credentials: Authentication credentials - default: {}
        - timeout: Request timeout in seconds - default: 30
    """

    def __init__(self, config: dict[str, Any], db: Session):
        self.config = config
        self.db = db
        self.url = config.get("url")
        self.method = config.get("method", "GET").upper()
        self.headers = config.get("headers", {})
        self.params = config.get("params", {})
        self.body = config.get("body")
        self.auth_type = config.get("auth_type", "none")
        self.auth_credentials = config.get("auth_credentials", {})
        self.timeout = config.get("timeout", 30)

        if not self.url:
            raise ValueError("URL is required for REST API extractor")

    def execute(self) -> pd.DataFrame:
        """
        Execute REST API request and return data as DataFrame

        Returns:
            DataFrame containing the API response data
        """
        logger.info(f"Extracting data from REST API: {self.method} {self.url}")

        try:
            # Prepare authentication
            auth = None
            if self.auth_type == "bearer":
                token = self.auth_credentials.get("token")
                self.headers["Authorization"] = f"Bearer {token}"
            elif self.auth_type == "basic":
                username = self.auth_credentials.get("username")
                password = self.auth_credentials.get("password")
                auth = (username, password)
            elif self.auth_type == "api_key":
                api_key = self.auth_credentials.get("api_key")
                key_name = self.auth_credentials.get("key_name", "X-API-Key")
                self.headers[key_name] = api_key

            # Make request
            response = requests.request(
                method=self.method,
                url=self.url,
                headers=self.headers,
                params=self.params,
                json=self.body if self.method in ["POST", "PUT", "PATCH"] else None,
                auth=auth,
                timeout=self.timeout
            )

            response.raise_for_status()

            # Parse response
            data = response.json()

            # Convert to DataFrame
            if isinstance(data, list):
                df = pd.DataFrame(data)
            elif isinstance(data, dict):
                # Check for common pagination patterns
                if "data" in data and isinstance(data["data"], list):
                    df = pd.DataFrame(data["data"])
                elif "results" in data and isinstance(data["results"], list):
                    df = pd.DataFrame(data["results"])
                elif "items" in data and isinstance(data["items"], list):
                    df = pd.DataFrame(data["items"])
                else:
                    # Treat dict as single record
                    df = pd.DataFrame([data])
            else:
                raise ValueError(f"Unexpected response type: {type(data)}")

            logger.info(f"Extracted {len(df)} records from API")

            return df

        except requests.exceptions.RequestException as e:
            logger.error(f"API request failed: {str(e)}")
            raise
        except Exception as e:
            logger.error(f"Error extracting data from API: {str(e)}")
            raise

    def validate(self) -> bool:
        """
        Validate extractor configuration

        Returns:
            True if configuration is valid
        """
        if not self.url:
            return False

        if self.method not in ["GET", "POST", "PUT", "PATCH", "DELETE"]:
            return False

        return True
