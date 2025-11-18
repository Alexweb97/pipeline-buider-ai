"""
Module Definitions - Centralized module configurations
This file contains all module definitions used for seeding and API responses
"""

MODULES_DATA = [
    # ============================================================================
    # EXTRACTORS - Data Sources (13 modules)
    # ============================================================================

    # Database Extractors
    {
        "name": "postgres-extractor",
        "display_name": "PostgreSQL",
        "description": "Extract data from PostgreSQL database with advanced query options",
        "type": "extractor",
        "category": "database",
        "python_class": "app.modules.extractors.postgres.PostgreSQLExtractor",
        "icon": "Database",
        "config_schema": {
            "type": "object",
            "properties": {
                "connection_id": {
                    "type": "string",
                    "title": "Connection",
                    "description": "Database connection ID"
                },
                "query": {
                    "type": "string",
                    "title": "SQL Query",
                    "description": "SQL query to extract data",
                    "default": "SELECT * FROM table_name",
                    "format": "sql"
                },
                "limit": {
                    "type": "integer",
                    "title": "Row Limit",
                    "description": "Maximum number of rows to extract (0 = no limit)",
                    "default": 1000,
                    "minimum": 0
                },
                "offset": {
                    "type": "integer",
                    "title": "Offset",
                    "description": "Number of rows to skip",
                    "default": 0,
                    "minimum": 0
                },
                "fetch_size": {
                    "type": "integer",
                    "title": "Fetch Size",
                    "description": "Number of rows to fetch per batch",
                    "default": 1000,
                    "minimum": 100
                },
                "timeout": {
                    "type": "integer",
                    "title": "Query Timeout (seconds)",
                    "description": "Maximum execution time for query",
                    "default": 300,
                    "minimum": 1
                }
            },
            "required": ["connection_id", "query"]
        },
        "tags": ["database", "sql", "relational", "postgresql"],
    },
    {
        "name": "csv-extractor",
        "display_name": "CSV File",
        "description": "Read data from uploaded CSV file",
        "type": "extractor",
        "category": "file",
        "python_class": "app.modules.extractors.csv.CSVExtractor",
        "icon": "Description",
        "config_schema": {
            "type": "object",
            "properties": {
                "file_id": {
                    "type": "string",
                    "title": "Uploaded File",
                    "description": "Select uploaded CSV file",
                    "format": "file-upload",
                    "accept": ".csv"
                },
                "delimiter": {
                    "type": "string",
                    "title": "Delimiter",
                    "description": "Column separator character",
                    "default": ",",
                    "enum": [",", ";", "\t", "|"]
                },
                "encoding": {
                    "type": "string",
                    "title": "Encoding",
                    "description": "File character encoding",
                    "default": "utf-8",
                    "enum": ["utf-8", "latin1", "iso-8859-1", "cp1252"]
                },
                "skip_rows": {
                    "type": "integer",
                    "title": "Skip Rows",
                    "description": "Number of rows to skip at the start",
                    "default": 0,
                    "minimum": 0
                },
                "has_header": {
                    "type": "boolean",
                    "title": "Has Header Row",
                    "description": "First row contains column names",
                    "default": True
                },
                "na_values": {
                    "type": "array",
                    "title": "NA Values",
                    "description": "Values to treat as null/missing",
                    "items": {"type": "string"},
                    "default": ["", "NA", "N/A", "null"]
                }
            },
            "required": ["file_id"]
        },
        "tags": ["file", "csv", "tabular"],
    },
    {
        "name": "excel-extractor",
        "display_name": "Excel File",
        "description": "Read data from uploaded Excel file (.xlsx, .xls)",
        "type": "extractor",
        "category": "file",
        "python_class": "app.modules.extractors.excel.ExcelExtractor",
        "icon": "TableChart",
        "config_schema": {
            "type": "object",
            "properties": {
                "file_id": {
                    "type": "string",
                    "title": "Uploaded File",
                    "description": "Select uploaded Excel file",
                    "format": "file-upload",
                    "accept": ".xlsx,.xls"
                },
                "sheet_name": {
                    "type": "string",
                    "title": "Sheet Name/Index",
                    "description": "Sheet name or index (0 for first sheet)",
                    "default": "0"
                },
                "skip_rows": {
                    "type": "integer",
                    "title": "Skip Rows",
                    "description": "Number of rows to skip",
                    "default": 0,
                    "minimum": 0
                },
                "has_header": {
                    "type": "boolean",
                    "title": "Has Header Row",
                    "default": True
                },
                "use_cols": {
                    "type": "string",
                    "title": "Columns to Use",
                    "description": "e.g. 'A:D' or '0,2,4'",
                    "default": ""
                }
            },
            "required": ["file_id"]
        },
        "tags": ["file", "excel", "spreadsheet", "tabular"],
    },
    {
        "name": "json-extractor",
        "display_name": "JSON File",
        "description": "Read data from uploaded JSON file",
        "type": "extractor",
        "category": "file",
        "python_class": "app.modules.extractors.json.JSONExtractor",
        "icon": "Code",
        "config_schema": {
            "type": "object",
            "properties": {
                "file_id": {
                    "type": "string",
                    "title": "Uploaded File",
                    "description": "Select uploaded JSON file",
                    "format": "file-upload",
                    "accept": ".json"
                },
                "json_path": {
                    "type": "string",
                    "title": "JSON Path",
                    "description": "Path to extract data from nested JSON (optional)",
                    "default": "$"
                },
                "orient": {
                    "type": "string",
                    "title": "JSON Orientation",
                    "description": "Expected JSON structure",
                    "default": "records",
                    "enum": ["records", "index", "columns", "values", "table"]
                },
                "normalize": {
                    "type": "boolean",
                    "title": "Normalize Nested Objects",
                    "description": "Flatten nested JSON structures",
                    "default": False
                }
            },
            "required": ["file_id"]
        },
        "tags": ["file", "json", "semi-structured"],
    },
    {
        "name": "parquet-extractor",
        "display_name": "Parquet File",
        "description": "Read data from uploaded Parquet file",
        "type": "extractor",
        "category": "file",
        "python_class": "app.modules.extractors.parquet.ParquetExtractor",
        "icon": "Inventory",
        "config_schema": {
            "type": "object",
            "properties": {
                "file_id": {
                    "type": "string",
                    "title": "Uploaded File",
                    "description": "Select uploaded Parquet file",
                    "format": "file-upload",
                    "accept": ".parquet"
                },
                "columns": {
                    "type": "array",
                    "title": "Columns to Read",
                    "description": "Specific columns to load (empty = all)",
                    "items": {"type": "string"},
                    "default": []
                },
                "filters": {
                    "type": "string",
                    "title": "Row Filters",
                    "description": "PyArrow filter expression (optional)",
                    "default": ""
                }
            },
            "required": ["file_id"]
        },
        "tags": ["file", "parquet", "columnar"],
    },
    {
        "name": "rest-api-extractor",
        "display_name": "REST API",
        "description": "Fetch data from REST API endpoints with custom headers and authentication",
        "type": "extractor",
        "category": "api",
        "python_class": "app.modules.extractors.rest_api.RESTAPIExtractor",
        "icon": "Api",
        "config_schema": {
            "type": "object",
            "properties": {
                "url": {
                    "type": "string",
                    "title": "API URL",
                    "description": "REST API endpoint URL",
                    "format": "uri"
                },
                "method": {
                    "type": "string",
                    "title": "HTTP Method",
                    "description": "HTTP request method",
                    "default": "GET",
                    "enum": ["GET", "POST", "PUT", "PATCH", "DELETE"]
                },
                "headers": {
                    "type": "object",
                    "title": "Headers",
                    "description": "HTTP headers as JSON object",
                    "default": {}
                },
                "params": {
                    "type": "object",
                    "title": "Query Parameters",
                    "description": "URL query parameters as JSON object",
                    "default": {}
                },
                "body": {
                    "type": "string",
                    "title": "Request Body",
                    "description": "JSON request body (for POST/PUT/PATCH)",
                    "default": ""
                },
                "auth_type": {
                    "type": "string",
                    "title": "Authentication Type",
                    "description": "Type of authentication to use",
                    "default": "none",
                    "enum": ["none", "basic", "bearer", "api_key"]
                },
                "auth_credentials": {
                    "type": "object",
                    "title": "Authentication Credentials",
                    "description": "Authentication credentials (username/password, token, or API key)",
                    "default": {}
                },
                "timeout": {
                    "type": "integer",
                    "title": "Timeout (seconds)",
                    "description": "Request timeout in seconds",
                    "default": 30,
                    "minimum": 1,
                    "maximum": 300
                },
                "pagination": {
                    "type": "object",
                    "title": "Pagination Config",
                    "description": "Pagination configuration (if applicable)",
                    "default": {}
                },
                "response_path": {
                    "type": "string",
                    "title": "JSON Response Path",
                    "description": "JSONPath to extract data from response (e.g., $.data.items)",
                    "default": "$"
                }
            },
            "required": ["url"]
        },
        "tags": ["api", "rest", "http", "web"],
    },

    # ============================================================================
    # TRANSFORMERS - Custom Code (2 modules)
    # ============================================================================

    {
        "name": "python-transformer",
        "display_name": "Python Transform",
        "description": "Execute custom Python code for data transformation",
        "type": "transformer",
        "category": "custom",
        "python_class": "app.modules.transformers.python_transform.PythonTransformer",
        "icon": "Code",
        "config_schema": {
            "type": "object",
            "properties": {
                "code": {
                    "type": "string",
                    "title": "Python Code",
                    "description": "Python code with a transform(df) function",
                    "format": "code",
                    "default": """def transform(df: pd.DataFrame) -> pd.DataFrame:
    \"\"\"
    Transform the input DataFrame

    Args:
        df: Input pandas DataFrame

    Returns:
        Transformed DataFrame
    \"\"\"
    # Your transformation code here
    # Example: Add a new column
    df['new_column'] = df['existing_column'] * 2

    # Example: Filter rows
    df = df[df['age'] > 18]

    return df
"""
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
            "required": ["code"]
        },
        "tags": ["python", "custom", "code", "flexible"],
    },
    {
        "name": "sql-transformer",
        "display_name": "SQL Transform",
        "description": "Execute SQL queries on data using DuckDB",
        "type": "transformer",
        "category": "custom",
        "python_class": "app.modules.transformers.sql_transform.SQLTransformer",
        "icon": "Storage",
        "config_schema": {
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
        },
        "tags": ["sql", "duckdb", "query", "custom"],
    },
]


def get_module_definition(module_name: str) -> dict | None:
    """
    Get module definition by name

    Args:
        module_name: The module name (e.g., 'python-transformer', 'csv-extractor')

    Returns:
        Module definition dict or None if not found
    """
    for module in MODULES_DATA:
        if module.get("name") == module_name:
            return module
    return None
