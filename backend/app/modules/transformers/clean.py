"""
Data Cleaning Transformer Module
Provides common data cleaning operations
"""
from typing import Any

import pandas as pd


class CleanTransformer:
    """
    Clean and normalize data with various cleaning operations

    Configuration:
    - trim_whitespace: Remove leading/trailing whitespace from string columns
    - remove_nulls: Remove rows containing any null values
    - lowercase_columns: Convert column names to lowercase
    """

    def __init__(self, config: dict[str, Any]):
        """
        Initialize Clean Transformer

        Args:
            config: Module configuration containing:
                - trim_whitespace (bool): Trim whitespace from strings
                - remove_nulls (bool): Remove rows with null values
                - lowercase_columns (bool): Convert column names to lowercase
        """
        self.trim_whitespace = config.get('trim_whitespace', True)
        self.remove_nulls = config.get('remove_nulls', False)
        self.lowercase_columns = config.get('lowercase_columns', False)

    def execute(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Execute data cleaning operations

        Args:
            df: Input pandas DataFrame

        Returns:
            Cleaned DataFrame

        Raises:
            ValueError: If input DataFrame is empty
        """
        if df is None or df.empty:
            raise ValueError("Input DataFrame is empty")

        # Create a copy to avoid modifying the original
        result = df.copy()

        # Lowercase column names
        if self.lowercase_columns:
            result.columns = result.columns.str.lower()

        # Trim whitespace from string columns
        if self.trim_whitespace:
            for col in result.columns:
                if result[col].dtype == 'object':
                    # Only trim if the column contains strings
                    result[col] = result[col].apply(
                        lambda x: x.strip() if isinstance(x, str) else x
                    )

        # Remove rows with null values
        if self.remove_nulls:
            result = result.dropna()

        return result

    @staticmethod
    def get_config_schema() -> dict[str, Any]:
        """Get JSON schema for module configuration"""
        return {
            "type": "object",
            "properties": {
                "trim_whitespace": {
                    "type": "boolean",
                    "title": "Trim Whitespace",
                    "description": "Remove leading and trailing whitespace from string columns",
                    "default": True
                },
                "remove_nulls": {
                    "type": "boolean",
                    "title": "Remove Null Rows",
                    "description": "Remove rows that contain any null values",
                    "default": False
                },
                "lowercase_columns": {
                    "type": "boolean",
                    "title": "Lowercase Column Names",
                    "description": "Convert all column names to lowercase",
                    "default": False
                }
            }
        }

    @staticmethod
    def get_metadata() -> dict[str, Any]:
        """Get module metadata"""
        return {
            "name": "clean-transformer",
            "display_name": "Data Cleaning",
            "description": "Clean and normalize data with various cleaning operations",
            "type": "transformer",
            "category": "transform",
            "icon": "FilterAlt",
            "tags": ["data-quality", "cleaning", "normalization"],
        }
