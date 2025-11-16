"""
SQL Transform Module
Allows users to write SQL queries on DataFrames using DuckDB
"""
from typing import Any

import pandas as pd

try:
    import duckdb
    DUCKDB_AVAILABLE = True
except ImportError:
    DUCKDB_AVAILABLE = False


class SQLTransformer:
    """
    Execute SQL queries on DataFrames using DuckDB

    Configuration:
    - query: SQL query (use {input} as table name)
    - timeout: Maximum execution time in seconds (default: 30)
    """

    def __init__(self, config: dict[str, Any]):
        """
        Initialize SQL Transformer

        Args:
            config: Module configuration containing:
                - query (str): SQL query
                - timeout (int, optional): Execution timeout in seconds
        """
        if not DUCKDB_AVAILABLE:
            raise RuntimeError(
                "DuckDB is not installed. Install it with: pip install duckdb"
            )

        self.query = config.get('query', '')
        self.timeout = config.get('timeout', 30)

        if not self.query:
            raise ValueError("SQL query is required")

    def execute(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Execute SQL query on DataFrame

        Args:
            df: Input pandas DataFrame

        Returns:
            Transformed DataFrame

        Raises:
            RuntimeError: If query execution fails
        """
        if df is None or df.empty:
            raise ValueError("Input DataFrame is empty")

        try:
            # Create in-memory DuckDB connection
            con = duckdb.connect(':memory:')

            # Register DataFrame as a table named 'input'
            con.register('input', df)

            # Execute query
            result = con.execute(self.query).fetchdf()

            # Close connection
            con.close()

            return result

        except Exception as e:
            raise RuntimeError(f"SQL transformation failed: {str(e)}") from e

    @staticmethod
    def get_config_schema() -> dict[str, Any]:
        """Get JSON schema for module configuration"""
        return {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "title": "SQL Query",
                    "description": "SQL query to transform data (use 'input' as table name)",
                    "format": "sql",
                    "default": """SELECT
    *,
    -- Add your transformations here
    column1 * 2 AS calculated_column
FROM input
WHERE column1 > 0
LIMIT 1000"""
                },
                "timeout": {
                    "type": "integer",
                    "title": "Timeout (seconds)",
                    "description": "Maximum execution time",
                    "default": 30,
                    "minimum": 1,
                    "maximum": 300
                }
            },
            "required": ["query"]
        }

    @staticmethod
    def get_metadata() -> dict[str, Any]:
        """Get module metadata"""
        return {
            "name": "sql-transformer",
            "display_name": "SQL Transform",
            "description": "Execute SQL queries on data using DuckDB",
            "type": "transformer",
            "category": "custom",
            "icon": "Storage",
            "tags": ["sql", "duckdb", "query", "custom"],
        }


def preview_sql_transform(
    df: pd.DataFrame,
    query: str,
    sample_size: int = 100
) -> dict[str, Any]:
    """
    Preview SQL transformation on a sample of data

    Args:
        df: Input DataFrame
        query: SQL query
        sample_size: Number of rows to use for preview

    Returns:
        Dict with preview results
    """
    if not DUCKDB_AVAILABLE:
        return {
            'success': False,
            'error': 'DuckDB is not installed',
        }

    try:
        # Use sample for preview
        sample_df = df.head(sample_size).copy()

        # Execute transformation
        transformer = SQLTransformer({'query': query})
        result = transformer.execute(sample_df)

        # Generate preview data
        return {
            'success': True,
            'input_shape': list(sample_df.shape),
            'output_shape': list(result.shape),
            'input_columns': list(sample_df.columns),
            'output_columns': list(result.columns),
            'preview_data': result.head(10).to_dict('records'),
            'schema': {
                col: {
                    'dtype': str(result[col].dtype),
                    'null_count': int(result[col].isnull().sum()),
                    'unique_count': int(result[col].nunique()),
                }
                for col in result.columns
            },
        }

    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'error_type': type(e).__name__,
        }
