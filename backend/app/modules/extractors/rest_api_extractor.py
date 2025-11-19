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

    def _flatten_dataframe(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Flatten nested dictionaries and lists in DataFrame columns

        Args:
            df: DataFrame with potentially nested structures

        Returns:
            Flattened DataFrame with expanded columns
        """
        # Check if there are any columns with dict or list values
        columns_to_flatten = []
        for col in df.columns:
            # Sample first non-null value to check type
            sample = df[col].dropna().head(1)
            if len(sample) > 0:
                first_val = sample.iloc[0]
                if isinstance(first_val, (dict, list)):
                    columns_to_flatten.append(col)

        if not columns_to_flatten:
            return df

        logger.info(f"Flattening nested columns: {columns_to_flatten}")

        # Flatten each column with nested structures
        result_df = df.copy()

        for col in columns_to_flatten:
            # Use pd.json_normalize to flatten nested structures
            try:
                # Extract the column as records
                nested_data = result_df[col].apply(lambda x: x if isinstance(x, dict) else {})

                # Normalize the nested data
                flattened = pd.json_normalize(nested_data)

                # Rename columns with prefix
                flattened.columns = [f"{col}.{subcol}" for subcol in flattened.columns]

                # Drop original nested column and join flattened columns
                result_df = result_df.drop(columns=[col])
                result_df = pd.concat([result_df, flattened], axis=1)

                logger.info(f"Flattened '{col}' into {len(flattened.columns)} columns")
            except Exception as e:
                logger.warning(f"Could not flatten column '{col}': {str(e)}")

        return result_df

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
                # Try to find array data in common response patterns
                # Common keys that contain the actual data array
                array_keys = ["data", "results", "items", "observations", "rows", "records", "entries"]

                # First, try to find a key that contains a list
                found_array = False
                for key in array_keys:
                    if key in data and isinstance(data[key], list) and len(data[key]) > 0:
                        df = pd.DataFrame(data[key])
                        found_array = True
                        logger.info(f"Found data array in '{key}' field with {len(data[key])} records")
                        break

                # If no common key found, look for ANY key containing a large list
                if not found_array:
                    for key, value in data.items():
                        if isinstance(value, list) and len(value) > 0:
                            # Use the first non-empty list found
                            df = pd.DataFrame(value)
                            found_array = True
                            logger.info(f"Auto-detected data array in '{key}' field with {len(value)} records")
                            break

                # If still no array found, treat the whole dict as a single record
                if not found_array:
                    df = pd.DataFrame([data])
                    logger.info("No data array found, treating response as single record")
            else:
                raise ValueError(f"Unexpected response type: {type(data)}")

            # Flatten nested structures (dictionaries and lists in columns)
            df = self._flatten_dataframe(df)

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
