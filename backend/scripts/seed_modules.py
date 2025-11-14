#!/usr/bin/env python3
"""
Seed script to populate modules table with initial module definitions
Enhanced with comprehensive configurations
"""
import sys
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.db.session import SessionLocal
from app.db.models.module import Module

# Module definitions with enriched configurations
MODULES = [
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
                    "default": "SELECT * FROM table_name"
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
        "name": "mysql-extractor",
        "display_name": "MySQL",
        "description": "Extract data from MySQL/MariaDB database",
        "type": "extractor",
        "category": "database",
        "python_class": "app.modules.extractors.mysql.MySQLExtractor",
        "icon": "Database",
        "config_schema": {
            "type": "object",
            "properties": {
                "connection_id": {
                    "type": "string",
                    "title": "Connection",
                    "description": "MySQL connection ID"
                },
                "query": {
                    "type": "string",
                    "title": "SQL Query",
                    "description": "SQL query to extract data",
                    "default": "SELECT * FROM table_name"
                },
                "limit": {
                    "type": "integer",
                    "title": "Row Limit",
                    "description": "Maximum number of rows to extract",
                    "default": 1000,
                    "minimum": 0
                },
                "charset": {
                    "type": "string",
                    "title": "Character Set",
                    "description": "Database character set",
                    "default": "utf8mb4",
                    "enum": ["utf8", "utf8mb4", "latin1"]
                }
            },
            "required": ["connection_id", "query"]
        },
        "tags": ["database", "sql", "relational", "mysql"],
    },
    {
        "name": "mongodb-extractor",
        "display_name": "MongoDB",
        "description": "Extract documents from MongoDB collection",
        "type": "extractor",
        "category": "database",
        "python_class": "app.modules.extractors.mongodb.MongoDBExtractor",
        "icon": "Database",
        "config_schema": {
            "type": "object",
            "properties": {
                "connection_id": {
                    "type": "string",
                    "title": "Connection",
                    "description": "MongoDB connection ID"
                },
                "database": {
                    "type": "string",
                    "title": "Database Name",
                    "description": "MongoDB database name"
                },
                "collection": {
                    "type": "string",
                    "title": "Collection Name",
                    "description": "Collection to query"
                },
                "query": {
                    "type": "object",
                    "title": "Query Filter",
                    "description": "MongoDB query filter (JSON)",
                    "default": {}
                },
                "projection": {
                    "type": "object",
                    "title": "Projection",
                    "description": "Fields to include/exclude",
                    "default": {}
                },
                "limit": {
                    "type": "integer",
                    "title": "Document Limit",
                    "description": "Maximum documents to extract",
                    "default": 1000,
                    "minimum": 0
                },
                "sort": {
                    "type": "object",
                    "title": "Sort Order",
                    "description": "Sort criteria (e.g., {\"created_at\": -1})",
                    "default": {}
                }
            },
            "required": ["connection_id", "database", "collection"]
        },
        "tags": ["database", "nosql", "document", "mongodb"],
    },
    {
        "name": "redis-extractor",
        "display_name": "Redis",
        "description": "Extract data from Redis cache/database",
        "type": "extractor",
        "category": "database",
        "python_class": "app.modules.extractors.redis.RedisExtractor",
        "icon": "Memory",
        "config_schema": {
            "type": "object",
            "properties": {
                "connection_id": {
                    "type": "string",
                    "title": "Connection",
                    "description": "Redis connection ID"
                },
                "pattern": {
                    "type": "string",
                    "title": "Key Pattern",
                    "description": "Redis key pattern (e.g., 'user:*')",
                    "default": "*"
                },
                "data_type": {
                    "type": "string",
                    "title": "Data Type",
                    "description": "Type of Redis data structure",
                    "enum": ["string", "hash", "list", "set", "zset"],
                    "default": "string"
                },
                "scan_count": {
                    "type": "integer",
                    "title": "Scan Count",
                    "description": "Number of keys per SCAN iteration",
                    "default": 100,
                    "minimum": 1
                }
            },
            "required": ["connection_id", "pattern"]
        },
        "tags": ["database", "cache", "redis", "nosql"],
    },
    {
        "name": "elasticsearch-extractor",
        "display_name": "Elasticsearch",
        "description": "Search and extract data from Elasticsearch",
        "type": "extractor",
        "category": "database",
        "python_class": "app.modules.extractors.elasticsearch.ElasticsearchExtractor",
        "icon": "Search",
        "config_schema": {
            "type": "object",
            "properties": {
                "connection_id": {
                    "type": "string",
                    "title": "Connection",
                    "description": "Elasticsearch connection ID"
                },
                "index": {
                    "type": "string",
                    "title": "Index Pattern",
                    "description": "Index name or pattern (e.g., 'logs-*')"
                },
                "query": {
                    "type": "object",
                    "title": "Query DSL",
                    "description": "Elasticsearch query in DSL format",
                    "default": {"match_all": {}}
                },
                "size": {
                    "type": "integer",
                    "title": "Result Size",
                    "description": "Number of documents to return",
                    "default": 1000,
                    "minimum": 1
                },
                "scroll": {
                    "type": "boolean",
                    "title": "Use Scroll API",
                    "description": "Enable scroll for large result sets",
                    "default": False
                }
            },
            "required": ["connection_id", "index"]
        },
        "tags": ["database", "search", "elasticsearch", "nosql"],
    },
    {
        "name": "cassandra-extractor",
        "display_name": "Cassandra",
        "description": "Extract data from Apache Cassandra",
        "type": "extractor",
        "category": "database",
        "python_class": "app.modules.extractors.cassandra.CassandraExtractor",
        "icon": "Database",
        "config_schema": {
            "type": "object",
            "properties": {
                "connection_id": {
                    "type": "string",
                    "title": "Connection",
                    "description": "Cassandra connection ID"
                },
                "keyspace": {
                    "type": "string",
                    "title": "Keyspace",
                    "description": "Cassandra keyspace name"
                },
                "query": {
                    "type": "string",
                    "title": "CQL Query",
                    "description": "CQL query to execute",
                    "default": "SELECT * FROM table_name"
                },
                "fetch_size": {
                    "type": "integer",
                    "title": "Fetch Size",
                    "description": "Number of rows per fetch",
                    "default": 1000,
                    "minimum": 100
                }
            },
            "required": ["connection_id", "keyspace", "query"]
        },
        "tags": ["database", "nosql", "cassandra", "distributed"],
    },

    # File Extractors (with file_id instead of file_path)
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
                "has_header": {
                    "type": "boolean",
                    "title": "Has Header Row",
                    "description": "First row contains column names",
                    "default": True
                },
                "skip_rows": {
                    "type": "integer",
                    "title": "Skip Rows",
                    "description": "Number of rows to skip at start",
                    "default": 0,
                    "minimum": 0
                },
                "na_values": {
                    "type": "array",
                    "title": "NULL Values",
                    "description": "Additional strings to recognize as NULL",
                    "items": {"type": "string"},
                    "default": ["", "NULL", "null", "N/A", "n/a"]
                }
            },
            "required": ["file_id"]
        },
        "tags": ["file", "csv", "tabular"],
    },
    {
        "name": "excel-extractor",
        "display_name": "Excel",
        "description": "Read data from uploaded Excel file (.xlsx, .xls)",
        "type": "extractor",
        "category": "file",
        "python_class": "app.modules.extractors.excel.ExcelExtractor",
        "icon": "Description",
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
                    "type": ["string", "integer"],
                    "title": "Sheet Name/Index",
                    "description": "Sheet name or index (0 for first sheet)",
                    "default": 0
                },
                "has_header": {
                    "type": "boolean",
                    "title": "Has Header Row",
                    "description": "First row contains column names",
                    "default": True
                },
                "skip_rows": {
                    "type": "integer",
                    "title": "Skip Rows",
                    "description": "Number of rows to skip",
                    "default": 0,
                    "minimum": 0
                },
                "use_columns": {
                    "type": "array",
                    "title": "Use Columns",
                    "description": "Specific columns to read (e.g., ['A', 'C', 'E'])",
                    "items": {"type": "string"}
                }
            },
            "required": ["file_id"]
        },
        "tags": ["file", "excel", "spreadsheet", "xlsx"],
    },
    {
        "name": "json-extractor",
        "display_name": "JSON File",
        "description": "Read data from uploaded JSON file",
        "type": "extractor",
        "category": "file",
        "python_class": "app.modules.extractors.json.JSONExtractor",
        "icon": "Description",
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
                    "description": "Path to extract data (e.g., '$.data.items')",
                    "default": "$"
                },
                "orient": {
                    "type": "string",
                    "title": "JSON Orientation",
                    "description": "JSON structure format",
                    "enum": ["records", "index", "columns", "values"],
                    "default": "records"
                },
                "encoding": {
                    "type": "string",
                    "title": "Encoding",
                    "description": "File character encoding",
                    "default": "utf-8",
                    "enum": ["utf-8", "latin1", "iso-8859-1"]
                }
            },
            "required": ["file_id"]
        },
        "tags": ["file", "json", "nested"],
    },
    {
        "name": "parquet-extractor",
        "display_name": "Parquet File",
        "description": "Read data from uploaded Parquet file",
        "type": "extractor",
        "category": "file",
        "python_class": "app.modules.extractors.parquet.ParquetExtractor",
        "icon": "Description",
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
                    "items": {"type": "string"}
                },
                "use_threads": {
                    "type": "boolean",
                    "title": "Use Multithreading",
                    "description": "Enable parallel reading",
                    "default": True
                }
            },
            "required": ["file_id"]
        },
        "tags": ["file", "parquet", "columnar", "big-data"],
    },

    # API Extractors
    {
        "name": "rest-api-extractor",
        "display_name": "REST API",
        "description": "Extract data from REST API endpoint",
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
                    "description": "Full endpoint URL",
                    "format": "uri"
                },
                "method": {
                    "type": "string",
                    "title": "HTTP Method",
                    "description": "Request method",
                    "enum": ["GET", "POST", "PUT", "PATCH"],
                    "default": "GET"
                },
                "headers": {
                    "type": "object",
                    "title": "HTTP Headers",
                    "description": "Custom headers (e.g., {'Accept': 'application/json'})",
                    "default": {}
                },
                "params": {
                    "type": "object",
                    "title": "Query Parameters",
                    "description": "URL query parameters",
                    "default": {}
                },
                "body": {
                    "type": "object",
                    "title": "Request Body",
                    "description": "JSON request body (for POST/PUT/PATCH)",
                    "default": {}
                },
                "auth_type": {
                    "type": "string",
                    "title": "Authentication Type",
                    "description": "Authentication method",
                    "enum": ["none", "bearer", "basic", "api_key"],
                    "default": "none"
                },
                "auth_token": {
                    "type": "string",
                    "title": "Auth Token/Key",
                    "description": "Bearer token, API key, or Basic auth",
                    "format": "password"
                },
                "timeout": {
                    "type": "integer",
                    "title": "Timeout (seconds)",
                    "description": "Request timeout",
                    "default": 30,
                    "minimum": 1
                },
                "pagination": {
                    "type": "object",
                    "title": "Pagination Config",
                    "description": "Pagination settings for multi-page requests",
                    "properties": {
                        "enabled": {"type": "boolean", "default": False},
                        "type": {"type": "string", "enum": ["offset", "page", "cursor"], "default": "page"},
                        "page_param": {"type": "string", "default": "page"},
                        "size_param": {"type": "string", "default": "size"}
                    }
                }
            },
            "required": ["url"]
        },
        "tags": ["api", "rest", "http", "web"],
    },
    {
        "name": "graphql-extractor",
        "display_name": "GraphQL",
        "description": "Query data from GraphQL API",
        "type": "extractor",
        "category": "api",
        "python_class": "app.modules.extractors.graphql.GraphQLExtractor",
        "icon": "GraphicEq",
        "config_schema": {
            "type": "object",
            "properties": {
                "url": {
                    "type": "string",
                    "title": "GraphQL Endpoint",
                    "description": "GraphQL API URL",
                    "format": "uri"
                },
                "query": {
                    "type": "string",
                    "title": "GraphQL Query",
                    "description": "Query or mutation to execute"
                },
                "variables": {
                    "type": "object",
                    "title": "Query Variables",
                    "description": "GraphQL variables (JSON)",
                    "default": {}
                },
                "headers": {
                    "type": "object",
                    "title": "HTTP Headers",
                    "description": "Custom headers",
                    "default": {}
                },
                "auth_token": {
                    "type": "string",
                    "title": "Auth Token",
                    "description": "Bearer token for authentication",
                    "format": "password"
                }
            },
            "required": ["url", "query"]
        },
        "tags": ["api", "graphql", "query"],
    },

    # Cloud Storage Extractors
    {
        "name": "s3-extractor",
        "display_name": "AWS S3 / MinIO",
        "description": "Extract files from S3-compatible storage",
        "type": "extractor",
        "category": "cloud",
        "python_class": "app.modules.extractors.s3.S3Extractor",
        "icon": "Cloud",
        "config_schema": {
            "type": "object",
            "properties": {
                "connection_id": {
                    "type": "string",
                    "title": "S3 Connection",
                    "description": "AWS S3 or MinIO connection ID"
                },
                "bucket": {
                    "type": "string",
                    "title": "Bucket Name",
                    "description": "S3 bucket name"
                },
                "key": {
                    "type": "string",
                    "title": "Object Key/Path",
                    "description": "File path in bucket (supports wildcards)"
                },
                "prefix": {
                    "type": "string",
                    "title": "Prefix Filter",
                    "description": "Filter objects by prefix"
                },
                "format": {
                    "type": "string",
                    "title": "File Format",
                    "description": "Expected file format",
                    "enum": ["csv", "json", "parquet", "excel", "auto"],
                    "default": "auto"
                },
                "endpoint_url": {
                    "type": "string",
                    "title": "Endpoint URL",
                    "description": "Custom endpoint (for MinIO or S3-compatible)"
                }
            },
            "required": ["connection_id", "bucket", "key"]
        },
        "tags": ["cloud", "s3", "storage", "aws"],
    },

    # ============================================================================
    # TRANSFORMERS - Data Processing (18 modules)
    # ============================================================================

    # Data Cleaning
    {
        "name": "filter-transformer",
        "display_name": "Filter Rows",
        "description": "Filter rows based on column conditions",
        "type": "transformer",
        "category": "cleaning",
        "python_class": "app.modules.transformers.filter.FilterTransformer",
        "icon": "FilterAlt",
        "config_schema": {
            "type": "object",
            "properties": {
                "conditions": {
                    "type": "array",
                    "title": "Filter Conditions",
                    "description": "List of conditions to apply",
                    "items": {
                        "type": "object",
                        "properties": {
                            "column": {"type": "string", "title": "Column"},
                            "operator": {
                                "type": "string",
                                "title": "Operator",
                                "enum": ["==", "!=", ">", "<", ">=", "<=", "contains", "startswith", "endswith", "in", "not in", "is null", "is not null"]
                            },
                            "value": {"type": ["string", "number", "boolean"], "title": "Value"}
                        },
                        "required": ["column", "operator"]
                    },
                    "minItems": 1
                },
                "logic": {
                    "type": "string",
                    "title": "Condition Logic",
                    "description": "How to combine multiple conditions",
                    "enum": ["AND", "OR"],
                    "default": "AND"
                }
            },
            "required": ["conditions"]
        },
        "tags": ["cleaning", "filtering", "conditional"],
    },
    {
        "name": "deduplicate-transformer",
        "display_name": "Remove Duplicates",
        "description": "Remove duplicate rows based on columns",
        "type": "transformer",
        "category": "cleaning",
        "python_class": "app.modules.transformers.deduplicate.DeduplicateTransformer",
        "icon": "FilterList",
        "config_schema": {
            "type": "object",
            "properties": {
                "columns": {
                    "type": "array",
                    "title": "Columns to Check",
                    "description": "Columns for uniqueness check (empty = all columns)",
                    "items": {"type": "string"}
                },
                "keep": {
                    "type": "string",
                    "title": "Keep Which Row",
                    "description": "Which duplicate to keep",
                    "enum": ["first", "last", "none"],
                    "default": "first"
                },
                "ignore_case": {
                    "type": "boolean",
                    "title": "Ignore Case",
                    "description": "Case-insensitive comparison for strings",
                    "default": False
                }
            }
        },
        "tags": ["cleaning", "deduplication", "unique"],
    },
    {
        "name": "remove-nulls-transformer",
        "display_name": "Remove Null Values",
        "description": "Remove rows with null/missing values",
        "type": "transformer",
        "category": "cleaning",
        "python_class": "app.modules.transformers.remove_nulls.RemoveNullsTransformer",
        "icon": "FilterAlt",
        "config_schema": {
            "type": "object",
            "properties": {
                "columns": {
                    "type": "array",
                    "title": "Columns to Check",
                    "description": "Columns to check for nulls (empty = all)",
                    "items": {"type": "string"}
                },
                "how": {
                    "type": "string",
                    "title": "Removal Strategy",
                    "description": "How to determine row removal",
                    "enum": ["any", "all"],
                    "default": "any"
                }
            }
        },
        "tags": ["cleaning", "null-handling", "missing-data"],
    },
    {
        "name": "fill-missing-transformer",
        "display_name": "Fill Missing Values",
        "description": "Fill null/missing values with specified strategy",
        "type": "transformer",
        "category": "cleaning",
        "python_class": "app.modules.transformers.fill_missing.FillMissingTransformer",
        "icon": "Build",
        "config_schema": {
            "type": "object",
            "properties": {
                "strategy": {
                    "type": "string",
                    "title": "Fill Strategy",
                    "description": "Method to fill missing values",
                    "enum": ["constant", "mean", "median", "mode", "forward_fill", "backward_fill"],
                    "default": "constant"
                },
                "fill_value": {
                    "type": ["string", "number"],
                    "title": "Fill Value",
                    "description": "Value to use for 'constant' strategy",
                    "default": ""
                },
                "columns": {
                    "type": "array",
                    "title": "Columns",
                    "description": "Columns to fill (empty = all)",
                    "items": {"type": "string"}
                }
            },
            "required": ["strategy"]
        },
        "tags": ["cleaning", "imputation", "missing-data"],
    },
    {
        "name": "validate-transformer",
        "display_name": "Validate Data",
        "description": "Validate data against schema and rules",
        "type": "transformer",
        "category": "cleaning",
        "python_class": "app.modules.transformers.validate.ValidateTransformer",
        "icon": "CheckCircle",
        "config_schema": {
            "type": "object",
            "properties": {
                "rules": {
                    "type": "array",
                    "title": "Validation Rules",
                    "description": "List of validation rules",
                    "items": {
                        "type": "object",
                        "properties": {
                            "column": {"type": "string", "title": "Column"},
                            "type": {"type": "string", "enum": ["string", "number", "integer", "boolean", "date", "email", "url", "regex"]},
                            "min": {"type": "number", "title": "Min Value"},
                            "max": {"type": "number", "title": "Max Value"},
                            "pattern": {"type": "string", "title": "Regex Pattern"},
                            "required": {"type": "boolean", "default": False}
                        },
                        "required": ["column", "type"]
                    }
                },
                "on_error": {
                    "type": "string",
                    "title": "On Validation Error",
                    "description": "Action when validation fails",
                    "enum": ["drop_row", "flag_row", "raise_error"],
                    "default": "flag_row"
                }
            },
            "required": ["rules"]
        },
        "tags": ["validation", "quality", "schema"],
    },
    {
        "name": "clean-text-transformer",
        "display_name": "Clean Text",
        "description": "Clean and normalize text data",
        "type": "transformer",
        "category": "cleaning",
        "python_class": "app.modules.transformers.clean_text.CleanTextTransformer",
        "icon": "CleaningServices",
        "config_schema": {
            "type": "object",
            "properties": {
                "columns": {
                    "type": "array",
                    "title": "Columns to Clean",
                    "description": "Text columns to process",
                    "items": {"type": "string"}
                },
                "lowercase": {
                    "type": "boolean",
                    "title": "Convert to Lowercase",
                    "default": False
                },
                "remove_whitespace": {
                    "type": "boolean",
                    "title": "Remove Extra Whitespace",
                    "default": True
                },
                "remove_html": {
                    "type": "boolean",
                    "title": "Remove HTML Tags",
                    "default": False
                },
                "remove_urls": {
                    "type": "boolean",
                    "title": "Remove URLs",
                    "default": False
                },
                "remove_special_chars": {
                    "type": "boolean",
                    "title": "Remove Special Characters",
                    "default": False
                }
            },
            "required": ["columns"]
        },
        "tags": ["cleaning", "text", "normalization"],
    },

    # Data Shaping
    {
        "name": "map-transformer",
        "display_name": "Map Values",
        "description": "Transform values using mapping rules",
        "type": "transformer",
        "category": "shaping",
        "python_class": "app.modules.transformers.map.MapTransformer",
        "icon": "Transform",
        "config_schema": {
            "type": "object",
            "properties": {
                "column": {
                    "type": "string",
                    "title": "Column to Transform",
                    "description": "Source column"
                },
                "mapping": {
                    "type": "object",
                    "title": "Value Mapping",
                    "description": "Key-value mapping (e.g., {'old': 'new'})",
                    "default": {}
                },
                "default_value": {
                    "type": ["string", "number", "null"],
                    "title": "Default Value",
                    "description": "Value for unmapped items"
                },
                "output_column": {
                    "type": "string",
                    "title": "Output Column",
                    "description": "Target column (empty = overwrite source)"
                }
            },
            "required": ["column", "mapping"]
        },
        "tags": ["transformation", "mapping", "replacement"],
    },
    {
        "name": "aggregate-transformer",
        "display_name": "Aggregate Data",
        "description": "Group and aggregate data with functions",
        "type": "transformer",
        "category": "shaping",
        "python_class": "app.modules.transformers.aggregate.AggregateTransformer",
        "icon": "Functions",
        "config_schema": {
            "type": "object",
            "properties": {
                "group_by": {
                    "type": "array",
                    "title": "Group By Columns",
                    "description": "Columns to group by",
                    "items": {"type": "string"},
                    "minItems": 1
                },
                "aggregations": {
                    "type": "array",
                    "title": "Aggregations",
                    "description": "Aggregation functions to apply",
                    "items": {
                        "type": "object",
                        "properties": {
                            "column": {"type": "string", "title": "Column"},
                            "function": {
                                "type": "string",
                                "title": "Function",
                                "enum": ["sum", "mean", "median", "min", "max", "count", "std", "var", "first", "last"]
                            },
                            "output_name": {"type": "string", "title": "Output Name"}
                        },
                        "required": ["column", "function"]
                    },
                    "minItems": 1
                }
            },
            "required": ["group_by", "aggregations"]
        },
        "tags": ["aggregation", "grouping", "statistics"],
    },
    {
        "name": "sort-transformer",
        "display_name": "Sort Data",
        "description": "Sort rows by one or more columns",
        "type": "transformer",
        "category": "shaping",
        "python_class": "app.modules.transformers.sort.SortTransformer",
        "icon": "Sort",
        "config_schema": {
            "type": "object",
            "properties": {
                "columns": {
                    "type": "array",
                    "title": "Sort Columns",
                    "description": "Columns to sort by (in order)",
                    "items": {
                        "type": "object",
                        "properties": {
                            "column": {"type": "string", "title": "Column"},
                            "order": {"type": "string", "enum": ["asc", "desc"], "default": "asc"}
                        },
                        "required": ["column"]
                    },
                    "minItems": 1
                },
                "null_position": {
                    "type": "string",
                    "title": "Null Position",
                    "description": "Where to place null values",
                    "enum": ["first", "last"],
                    "default": "last"
                }
            },
            "required": ["columns"]
        },
        "tags": ["sorting", "ordering"],
    },
    {
        "name": "pivot-transformer",
        "display_name": "Pivot Table",
        "description": "Create pivot table from data",
        "type": "transformer",
        "category": "shaping",
        "python_class": "app.modules.transformers.pivot.PivotTransformer",
        "icon": "TableChart",
        "config_schema": {
            "type": "object",
            "properties": {
                "index": {
                    "type": "array",
                    "title": "Row Index",
                    "description": "Columns to use as row index",
                    "items": {"type": "string"},
                    "minItems": 1
                },
                "columns": {
                    "type": "string",
                    "title": "Column to Pivot",
                    "description": "Column to spread into columns"
                },
                "values": {
                    "type": "string",
                    "title": "Values Column",
                    "description": "Column containing values"
                },
                "aggfunc": {
                    "type": "string",
                    "title": "Aggregation Function",
                    "description": "Function for duplicate entries",
                    "enum": ["sum", "mean", "count", "min", "max", "first", "last"],
                    "default": "sum"
                }
            },
            "required": ["index", "columns", "values"]
        },
        "tags": ["pivot", "reshape", "wide-format"],
    },
    {
        "name": "unpivot-transformer",
        "display_name": "Unpivot Table",
        "description": "Convert wide format to long format (melt)",
        "type": "transformer",
        "category": "shaping",
        "python_class": "app.modules.transformers.unpivot.UnpivotTransformer",
        "icon": "TableChart",
        "config_schema": {
            "type": "object",
            "properties": {
                "id_vars": {
                    "type": "array",
                    "title": "ID Variables",
                    "description": "Columns to keep as identifiers",
                    "items": {"type": "string"}
                },
                "value_vars": {
                    "type": "array",
                    "title": "Value Variables",
                    "description": "Columns to unpivot (empty = all others)",
                    "items": {"type": "string"}
                },
                "var_name": {
                    "type": "string",
                    "title": "Variable Name",
                    "description": "Name for variable column",
                    "default": "variable"
                },
                "value_name": {
                    "type": "string",
                    "title": "Value Name",
                    "description": "Name for value column",
                    "default": "value"
                }
            },
            "required": ["id_vars"]
        },
        "tags": ["unpivot", "melt", "reshape", "long-format"],
    },
    {
        "name": "rename-columns-transformer",
        "display_name": "Rename Columns",
        "description": "Rename one or more columns",
        "type": "transformer",
        "category": "shaping",
        "python_class": "app.modules.transformers.rename_columns.RenameColumnsTransformer",
        "icon": "DriveFileRenameOutline",
        "config_schema": {
            "type": "object",
            "properties": {
                "mapping": {
                    "type": "object",
                    "title": "Column Mapping",
                    "description": "Old to new column names (e.g., {'old_name': 'new_name'})"
                },
                "case_style": {
                    "type": "string",
                    "title": "Case Style",
                    "description": "Apply naming convention to all columns",
                    "enum": ["none", "snake_case", "camelCase", "PascalCase", "UPPER_CASE"],
                    "default": "none"
                }
            }
        },
        "tags": ["rename", "columns", "naming"],
    },

    # Data Enrichment
    {
        "name": "join-transformer",
        "display_name": "Join Tables",
        "description": "Join two datasets using a key",
        "type": "transformer",
        "category": "enrichment",
        "python_class": "app.modules.transformers.join.JoinTransformer",
        "icon": "MergeType",
        "config_schema": {
            "type": "object",
            "properties": {
                "right_dataset": {
                    "type": "string",
                    "title": "Right Dataset",
                    "description": "Dataset to join with (from previous node)"
                },
                "left_on": {
                    "type": "string",
                    "title": "Left Join Key",
                    "description": "Column from left dataset"
                },
                "right_on": {
                    "type": "string",
                    "title": "Right Join Key",
                    "description": "Column from right dataset"
                },
                "join_type": {
                    "type": "string",
                    "title": "Join Type",
                    "description": "Type of join operation",
                    "enum": ["inner", "left", "right", "outer", "cross"],
                    "default": "inner"
                },
                "suffixes": {
                    "type": "array",
                    "title": "Column Suffixes",
                    "description": "Suffixes for duplicate columns [left, right]",
                    "items": {"type": "string"},
                    "default": ["_left", "_right"],
                    "minItems": 2,
                    "maxItems": 2
                }
            },
            "required": ["right_dataset", "left_on", "right_on"]
        },
        "tags": ["join", "merge", "combine"],
    },
    {
        "name": "lookup-transformer",
        "display_name": "Lookup Values",
        "description": "Enrich data by looking up values from another table",
        "type": "transformer",
        "category": "enrichment",
        "python_class": "app.modules.transformers.lookup.LookupTransformer",
        "icon": "Search",
        "config_schema": {
            "type": "object",
            "properties": {
                "lookup_table": {
                    "type": "string",
                    "title": "Lookup Table",
                    "description": "Reference table for lookups"
                },
                "key_column": {
                    "type": "string",
                    "title": "Key Column",
                    "description": "Column to match on"
                },
                "lookup_key": {
                    "type": "string",
                    "title": "Lookup Key",
                    "description": "Column in lookup table to match"
                },
                "return_columns": {
                    "type": "array",
                    "title": "Return Columns",
                    "description": "Columns to add from lookup table",
                    "items": {"type": "string"},
                    "minItems": 1
                },
                "default_value": {
                    "type": ["string", "number", "null"],
                    "title": "Default Value",
                    "description": "Value when no match found"
                }
            },
            "required": ["lookup_table", "key_column", "lookup_key", "return_columns"]
        },
        "tags": ["lookup", "enrichment", "reference"],
    },

    # Data Splitting
    {
        "name": "split-transformer",
        "display_name": "Split Column",
        "description": "Split text column into multiple columns",
        "type": "transformer",
        "category": "splitting",
        "python_class": "app.modules.transformers.split.SplitTransformer",
        "icon": "CallSplit",
        "config_schema": {
            "type": "object",
            "properties": {
                "column": {
                    "type": "string",
                    "title": "Column to Split",
                    "description": "Source column"
                },
                "delimiter": {
                    "type": "string",
                    "title": "Delimiter",
                    "description": "Character(s) to split on",
                    "default": ","
                },
                "max_splits": {
                    "type": "integer",
                    "title": "Max Splits",
                    "description": "Maximum number of splits (-1 = unlimited)",
                    "default": -1,
                    "minimum": -1
                },
                "output_columns": {
                    "type": "array",
                    "title": "Output Column Names",
                    "description": "Names for split columns",
                    "items": {"type": "string"}
                },
                "keep_original": {
                    "type": "boolean",
                    "title": "Keep Original Column",
                    "default": False
                }
            },
            "required": ["column", "delimiter"]
        },
        "tags": ["split", "parsing", "text"],
    },
    {
        "name": "split-by-condition-transformer",
        "display_name": "Split by Condition",
        "description": "Split dataset into multiple outputs based on conditions",
        "type": "transformer",
        "category": "splitting",
        "python_class": "app.modules.transformers.split_by_condition.SplitByConditionTransformer",
        "icon": "CallSplit",
        "config_schema": {
            "type": "object",
            "properties": {
                "conditions": {
                    "type": "array",
                    "title": "Split Conditions",
                    "description": "Conditions for each output",
                    "items": {
                        "type": "object",
                        "properties": {
                            "name": {"type": "string", "title": "Output Name"},
                            "column": {"type": "string", "title": "Column"},
                            "operator": {"type": "string", "enum": ["==", "!=", ">", "<", ">=", "<=", "in", "contains"]},
                            "value": {"type": ["string", "number", "boolean"], "title": "Value"}
                        },
                        "required": ["name", "column", "operator", "value"]
                    },
                    "minItems": 2
                },
                "default_output": {
                    "type": "string",
                    "title": "Default Output",
                    "description": "Name for rows not matching any condition",
                    "default": "other"
                }
            },
            "required": ["conditions"]
        },
        "tags": ["split", "routing", "conditional"],
    },

    # Custom Processing
    {
        "name": "python-code-transformer",
        "display_name": "Python Code",
        "description": "Execute custom Python transformation code",
        "type": "transformer",
        "category": "custom",
        "python_class": "app.modules.transformers.python_code.PythonCodeTransformer",
        "icon": "Code",
        "config_schema": {
            "type": "object",
            "properties": {
                "code": {
                    "type": "string",
                    "title": "Python Code",
                    "description": "Code to execute (input: df, output: df)",
                    "format": "code",
                    "default": "# Transform dataframe\ndf['new_column'] = df['old_column'] * 2\nreturn df"
                },
                "imports": {
                    "type": "array",
                    "title": "Required Imports",
                    "description": "Python packages to import",
                    "items": {"type": "string"},
                    "default": ["pandas", "numpy"]
                }
            },
            "required": ["code"]
        },
        "tags": ["custom", "python", "code", "advanced"],
    },
    {
        "name": "sql-transform-transformer",
        "display_name": "SQL Transform",
        "description": "Transform data using SQL query",
        "type": "transformer",
        "category": "custom",
        "python_class": "app.modules.transformers.sql_transform.SQLTransformTransformer",
        "icon": "Code",
        "config_schema": {
            "type": "object",
            "properties": {
                "query": {
                    "type": "string",
                    "title": "SQL Query",
                    "description": "SQL query to transform data (FROM table_name AS t)",
                    "format": "sql",
                    "default": "SELECT * FROM input_table WHERE value > 100"
                }
            },
            "required": ["query"]
        },
        "tags": ["sql", "query", "transform", "advanced"],
    },

    # ============================================================================
    # LOADERS - Data Destinations (13 modules)
    # ============================================================================

    # Database Loaders
    {
        "name": "postgres-loader",
        "display_name": "PostgreSQL",
        "description": "Load data into PostgreSQL database table",
        "type": "loader",
        "category": "database",
        "python_class": "app.modules.loaders.postgres.PostgreSQLLoader",
        "icon": "Storage",
        "config_schema": {
            "type": "object",
            "properties": {
                "connection_id": {
                    "type": "string",
                    "title": "Connection",
                    "description": "PostgreSQL connection ID"
                },
                "table": {
                    "type": "string",
                    "title": "Table Name",
                    "description": "Target table name"
                },
                "schema": {
                    "type": "string",
                    "title": "Schema",
                    "description": "Database schema",
                    "default": "public"
                },
                "if_exists": {
                    "type": "string",
                    "title": "If Table Exists",
                    "description": "Action when table exists",
                    "enum": ["fail", "replace", "append", "truncate"],
                    "default": "append"
                },
                "batch_size": {
                    "type": "integer",
                    "title": "Batch Size",
                    "description": "Rows per insert batch",
                    "default": 1000,
                    "minimum": 100
                },
                "create_table": {
                    "type": "boolean",
                    "title": "Create Table if Missing",
                    "description": "Auto-create table from data",
                    "default": True
                }
            },
            "required": ["connection_id", "table"]
        },
        "tags": ["database", "sql", "postgresql", "loader"],
    },
    {
        "name": "mysql-loader",
        "display_name": "MySQL",
        "description": "Load data into MySQL/MariaDB database",
        "type": "loader",
        "category": "database",
        "python_class": "app.modules.loaders.mysql.MySQLLoader",
        "icon": "Storage",
        "config_schema": {
            "type": "object",
            "properties": {
                "connection_id": {
                    "type": "string",
                    "title": "Connection",
                    "description": "MySQL connection ID"
                },
                "table": {
                    "type": "string",
                    "title": "Table Name",
                    "description": "Target table name"
                },
                "if_exists": {
                    "type": "string",
                    "title": "If Table Exists",
                    "description": "Action when table exists",
                    "enum": ["fail", "replace", "append", "truncate"],
                    "default": "append"
                },
                "batch_size": {
                    "type": "integer",
                    "title": "Batch Size",
                    "description": "Rows per insert batch",
                    "default": 1000,
                    "minimum": 100
                }
            },
            "required": ["connection_id", "table"]
        },
        "tags": ["database", "sql", "mysql", "loader"],
    },
    {
        "name": "mongodb-loader",
        "display_name": "MongoDB",
        "description": "Load documents into MongoDB collection",
        "type": "loader",
        "category": "database",
        "python_class": "app.modules.loaders.mongodb.MongoDBLoader",
        "icon": "Storage",
        "config_schema": {
            "type": "object",
            "properties": {
                "connection_id": {
                    "type": "string",
                    "title": "Connection",
                    "description": "MongoDB connection ID"
                },
                "database": {
                    "type": "string",
                    "title": "Database Name",
                    "description": "MongoDB database"
                },
                "collection": {
                    "type": "string",
                    "title": "Collection Name",
                    "description": "Target collection"
                },
                "if_exists": {
                    "type": "string",
                    "title": "If Collection Exists",
                    "description": "Action when collection exists",
                    "enum": ["replace", "append", "upsert"],
                    "default": "append"
                },
                "upsert_key": {
                    "type": "string",
                    "title": "Upsert Key",
                    "description": "Field for upsert operations"
                },
                "batch_size": {
                    "type": "integer",
                    "title": "Batch Size",
                    "description": "Documents per batch",
                    "default": 1000,
                    "minimum": 100
                }
            },
            "required": ["connection_id", "database", "collection"]
        },
        "tags": ["database", "nosql", "mongodb", "loader"],
    },
    {
        "name": "redis-loader",
        "display_name": "Redis",
        "description": "Load data into Redis cache/database",
        "type": "loader",
        "category": "database",
        "python_class": "app.modules.loaders.redis.RedisLoader",
        "icon": "Storage",
        "config_schema": {
            "type": "object",
            "properties": {
                "connection_id": {
                    "type": "string",
                    "title": "Connection",
                    "description": "Redis connection ID"
                },
                "key_pattern": {
                    "type": "string",
                    "title": "Key Pattern",
                    "description": "Pattern for generating keys (e.g., 'user:{id}')"
                },
                "key_column": {
                    "type": "string",
                    "title": "Key Column",
                    "description": "Column to use as key"
                },
                "data_type": {
                    "type": "string",
                    "title": "Data Type",
                    "description": "Redis data structure",
                    "enum": ["string", "hash", "list", "set"],
                    "default": "hash"
                },
                "ttl": {
                    "type": "integer",
                    "title": "TTL (seconds)",
                    "description": "Time to live for keys (0 = no expiry)",
                    "default": 0,
                    "minimum": 0
                }
            },
            "required": ["connection_id", "key_pattern"]
        },
        "tags": ["database", "cache", "redis", "loader"],
    },
    {
        "name": "elasticsearch-loader",
        "display_name": "Elasticsearch",
        "description": "Index data into Elasticsearch",
        "type": "loader",
        "category": "database",
        "python_class": "app.modules.loaders.elasticsearch.ElasticsearchLoader",
        "icon": "Storage",
        "config_schema": {
            "type": "object",
            "properties": {
                "connection_id": {
                    "type": "string",
                    "title": "Connection",
                    "description": "Elasticsearch connection ID"
                },
                "index": {
                    "type": "string",
                    "title": "Index Name",
                    "description": "Target index name"
                },
                "id_column": {
                    "type": "string",
                    "title": "ID Column",
                    "description": "Column to use as document ID"
                },
                "if_exists": {
                    "type": "string",
                    "title": "If Document Exists",
                    "description": "Action for existing documents",
                    "enum": ["update", "replace", "skip"],
                    "default": "update"
                },
                "batch_size": {
                    "type": "integer",
                    "title": "Batch Size",
                    "description": "Documents per bulk request",
                    "default": 500,
                    "minimum": 100
                }
            },
            "required": ["connection_id", "index"]
        },
        "tags": ["database", "search", "elasticsearch", "loader"],
    },
    {
        "name": "cassandra-loader",
        "display_name": "Cassandra",
        "description": "Load data into Apache Cassandra",
        "type": "loader",
        "category": "database",
        "python_class": "app.modules.loaders.cassandra.CassandraLoader",
        "icon": "Storage",
        "config_schema": {
            "type": "object",
            "properties": {
                "connection_id": {
                    "type": "string",
                    "title": "Connection",
                    "description": "Cassandra connection ID"
                },
                "keyspace": {
                    "type": "string",
                    "title": "Keyspace",
                    "description": "Cassandra keyspace"
                },
                "table": {
                    "type": "string",
                    "title": "Table Name",
                    "description": "Target table"
                },
                "if_exists": {
                    "type": "string",
                    "title": "If Table Exists",
                    "description": "Action when table exists",
                    "enum": ["append", "truncate"],
                    "default": "append"
                },
                "batch_size": {
                    "type": "integer",
                    "title": "Batch Size",
                    "description": "Rows per batch",
                    "default": 100,
                    "minimum": 10
                }
            },
            "required": ["connection_id", "keyspace", "table"]
        },
        "tags": ["database", "nosql", "cassandra", "loader"],
    },

    # File Loaders
    {
        "name": "csv-loader",
        "display_name": "CSV File",
        "description": "Save data to CSV file",
        "type": "loader",
        "category": "file",
        "python_class": "app.modules.loaders.csv.CSVLoader",
        "icon": "Storage",
        "config_schema": {
            "type": "object",
            "properties": {
                "file_path": {
                    "type": "string",
                    "title": "Output File Path",
                    "description": "Path for output CSV file"
                },
                "delimiter": {
                    "type": "string",
                    "title": "Delimiter",
                    "description": "Column separator",
                    "default": ",",
                    "enum": [",", ";", "\t", "|"]
                },
                "encoding": {
                    "type": "string",
                    "title": "Encoding",
                    "description": "File character encoding",
                    "default": "utf-8",
                    "enum": ["utf-8", "latin1", "iso-8859-1"]
                },
                "include_header": {
                    "type": "boolean",
                    "title": "Include Header",
                    "description": "Write column names as first row",
                    "default": True
                },
                "quote_all": {
                    "type": "boolean",
                    "title": "Quote All Fields",
                    "description": "Wrap all values in quotes",
                    "default": False
                }
            },
            "required": ["file_path"]
        },
        "tags": ["file", "csv", "export"],
    },
    {
        "name": "json-loader",
        "display_name": "JSON File",
        "description": "Save data to JSON file",
        "type": "loader",
        "category": "file",
        "python_class": "app.modules.loaders.json.JSONLoader",
        "icon": "Storage",
        "config_schema": {
            "type": "object",
            "properties": {
                "file_path": {
                    "type": "string",
                    "title": "Output File Path",
                    "description": "Path for output JSON file"
                },
                "orient": {
                    "type": "string",
                    "title": "JSON Orientation",
                    "description": "JSON structure format",
                    "enum": ["records", "index", "columns", "values"],
                    "default": "records"
                },
                "indent": {
                    "type": "integer",
                    "title": "Indentation",
                    "description": "JSON indentation spaces (0 = compact)",
                    "default": 2,
                    "minimum": 0,
                    "maximum": 8
                },
                "encoding": {
                    "type": "string",
                    "title": "Encoding",
                    "default": "utf-8"
                }
            },
            "required": ["file_path"]
        },
        "tags": ["file", "json", "export"],
    },
    {
        "name": "excel-loader",
        "display_name": "Excel File",
        "description": "Save data to Excel file (.xlsx)",
        "type": "loader",
        "category": "file",
        "python_class": "app.modules.loaders.excel.ExcelLoader",
        "icon": "Storage",
        "config_schema": {
            "type": "object",
            "properties": {
                "file_path": {
                    "type": "string",
                    "title": "Output File Path",
                    "description": "Path for output Excel file"
                },
                "sheet_name": {
                    "type": "string",
                    "title": "Sheet Name",
                    "description": "Name for worksheet",
                    "default": "Sheet1"
                },
                "include_header": {
                    "type": "boolean",
                    "title": "Include Header",
                    "default": True
                },
                "freeze_panes": {
                    "type": "boolean",
                    "title": "Freeze Header Row",
                    "default": True
                }
            },
            "required": ["file_path"]
        },
        "tags": ["file", "excel", "export", "xlsx"],
    },
    {
        "name": "parquet-loader",
        "display_name": "Parquet File",
        "description": "Save data to Parquet file",
        "type": "loader",
        "category": "file",
        "python_class": "app.modules.loaders.parquet.ParquetLoader",
        "icon": "Storage",
        "config_schema": {
            "type": "object",
            "properties": {
                "file_path": {
                    "type": "string",
                    "title": "Output File Path",
                    "description": "Path for output Parquet file"
                },
                "compression": {
                    "type": "string",
                    "title": "Compression",
                    "description": "Compression algorithm",
                    "enum": ["snappy", "gzip", "brotli", "lz4", "none"],
                    "default": "snappy"
                },
                "row_group_size": {
                    "type": "integer",
                    "title": "Row Group Size",
                    "description": "Rows per row group",
                    "default": 10000,
                    "minimum": 1000
                }
            },
            "required": ["file_path"]
        },
        "tags": ["file", "parquet", "columnar", "big-data"],
    },

    # Cloud Storage Loaders
    {
        "name": "s3-loader",
        "display_name": "AWS S3 / MinIO",
        "description": "Upload data to S3-compatible storage",
        "type": "loader",
        "category": "cloud",
        "python_class": "app.modules.loaders.s3.S3Loader",
        "icon": "CloudUpload",
        "config_schema": {
            "type": "object",
            "properties": {
                "connection_id": {
                    "type": "string",
                    "title": "S3 Connection",
                    "description": "AWS S3 or MinIO connection ID"
                },
                "bucket": {
                    "type": "string",
                    "title": "Bucket Name",
                    "description": "S3 bucket name"
                },
                "key": {
                    "type": "string",
                    "title": "Object Key/Path",
                    "description": "File path in bucket"
                },
                "format": {
                    "type": "string",
                    "title": "File Format",
                    "description": "Output file format",
                    "enum": ["csv", "json", "parquet", "excel"],
                    "default": "csv"
                },
                "acl": {
                    "type": "string",
                    "title": "ACL",
                    "description": "Access control list",
                    "enum": ["private", "public-read", "authenticated-read"],
                    "default": "private"
                },
                "endpoint_url": {
                    "type": "string",
                    "title": "Endpoint URL",
                    "description": "Custom endpoint (for MinIO)"
                }
            },
            "required": ["connection_id", "bucket", "key"]
        },
        "tags": ["cloud", "s3", "storage", "aws"],
    },
    {
        "name": "gcs-loader",
        "display_name": "Google Cloud Storage",
        "description": "Upload data to Google Cloud Storage",
        "type": "loader",
        "category": "cloud",
        "python_class": "app.modules.loaders.gcs.GCSLoader",
        "icon": "CloudUpload",
        "config_schema": {
            "type": "object",
            "properties": {
                "connection_id": {
                    "type": "string",
                    "title": "GCS Connection",
                    "description": "Google Cloud Storage connection ID"
                },
                "bucket": {
                    "type": "string",
                    "title": "Bucket Name",
                    "description": "GCS bucket name"
                },
                "blob_name": {
                    "type": "string",
                    "title": "Blob Name/Path",
                    "description": "File path in bucket"
                },
                "format": {
                    "type": "string",
                    "title": "File Format",
                    "description": "Output file format",
                    "enum": ["csv", "json", "parquet"],
                    "default": "csv"
                }
            },
            "required": ["connection_id", "bucket", "blob_name"]
        },
        "tags": ["cloud", "gcs", "google", "storage"],
    },
    {
        "name": "azure-blob-loader",
        "display_name": "Azure Blob Storage",
        "description": "Upload data to Azure Blob Storage",
        "type": "loader",
        "category": "cloud",
        "python_class": "app.modules.loaders.azure_blob.AzureBlobLoader",
        "icon": "CloudUpload",
        "config_schema": {
            "type": "object",
            "properties": {
                "connection_id": {
                    "type": "string",
                    "title": "Azure Connection",
                    "description": "Azure Blob Storage connection ID"
                },
                "container": {
                    "type": "string",
                    "title": "Container Name",
                    "description": "Azure container name"
                },
                "blob_name": {
                    "type": "string",
                    "title": "Blob Name/Path",
                    "description": "File path in container"
                },
                "format": {
                    "type": "string",
                    "title": "File Format",
                    "description": "Output file format",
                    "enum": ["csv", "json", "parquet"],
                    "default": "csv"
                }
            },
            "required": ["connection_id", "container", "blob_name"]
        },
        "tags": ["cloud", "azure", "blob", "storage"],
    },
]


def seed_modules():
    """Seed modules into database"""
    db = SessionLocal()

    try:
        # Check if modules already exist
        existing_count = db.query(Module).count()

        if existing_count > 0:
            print(f"⚠️  Found {existing_count} existing modules. Skipping seed.")
            print("   To re-seed, delete existing modules first.")
            return

        # Create modules
        created = 0
        for module_data in MODULES:
            module = Module(**module_data, version="1.0.0", is_active=True, usage_count=0)
            db.add(module)
            created += 1

        db.commit()

        # Count by type
        extractors = sum(1 for m in MODULES if m['type'] == 'extractor')
        transformers = sum(1 for m in MODULES if m['type'] == 'transformer')
        loaders = sum(1 for m in MODULES if m['type'] == 'loader')

        print(f"✅ Successfully seeded {created} modules!")
        print(f"   - Extractors: {extractors}")
        print(f"   - Transformers: {transformers}")
        print(f"   - Loaders: {loaders}")
        print(f"\n📊 Module breakdown:")
        print(f"   Database extractors: {sum(1 for m in MODULES if m['type'] == 'extractor' and m['category'] == 'database')}")
        print(f"   File extractors: {sum(1 for m in MODULES if m['type'] == 'extractor' and m['category'] == 'file')}")
        print(f"   API extractors: {sum(1 for m in MODULES if m['type'] == 'extractor' and m['category'] == 'api')}")
        print(f"   Cloud extractors: {sum(1 for m in MODULES if m['type'] == 'extractor' and m['category'] == 'cloud')}")

    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding modules: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("🌱 Seeding modules with enriched configurations...")
    seed_modules()
