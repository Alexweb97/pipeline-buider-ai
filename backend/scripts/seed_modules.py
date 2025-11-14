#!/usr/bin/env python3
"""
Seed script to populate modules table with initial module definitions
"""
import sys
from pathlib import Path

# Add parent directory to path to import app modules
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.db.session import SessionLocal
from app.db.models.module import Module

# Module definitions matching frontend structure
MODULES = [
    # EXTRACTORS
    {
        "name": "postgres-extractor",
        "display_name": "PostgreSQL",
        "description": "Extract data from PostgreSQL database",
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
                    "description": "Maximum number of rows to extract",
                    "default": 1000
                }
            },
            "required": ["connection_id", "query"]
        },
        "tags": ["database", "sql", "relational"],
    },
    {
        "name": "mysql-extractor",
        "display_name": "MySQL",
        "description": "Extract data from MySQL database",
        "type": "extractor",
        "category": "database",
        "python_class": "app.modules.extractors.mysql.MySQLExtractor",
        "icon": "Database",
        "config_schema": {
            "type": "object",
            "properties": {
                "connection_id": {"type": "string", "title": "Connection"},
                "query": {"type": "string", "title": "SQL Query", "default": "SELECT * FROM table_name"}
            },
            "required": ["connection_id", "query"]
        },
        "tags": ["database", "sql", "relational"],
    },
    {
        "name": "mongodb-extractor",
        "display_name": "MongoDB",
        "description": "Extract data from MongoDB collection",
        "type": "extractor",
        "category": "database",
        "python_class": "app.modules.extractors.mongodb.MongoDBExtractor",
        "icon": "Database",
        "config_schema": {
            "type": "object",
            "properties": {
                "connection_id": {"type": "string", "title": "Connection"},
                "collection": {"type": "string", "title": "Collection Name"},
                "query": {"type": "object", "title": "Query Filter"}
            },
            "required": ["connection_id", "collection"]
        },
        "tags": ["database", "nosql", "document"],
    },
    {
        "name": "csv-extractor",
        "display_name": "CSV File",
        "description": "Read data from CSV file",
        "type": "extractor",
        "category": "file",
        "python_class": "app.modules.extractors.csv.CSVExtractor",
        "icon": "Description",
        "config_schema": {
            "type": "object",
            "properties": {
                "file_path": {"type": "string", "title": "File Path"},
                "delimiter": {"type": "string", "title": "Delimiter", "default": ","},
                "hasHeader": {"type": "boolean", "title": "Has Header", "default": True}
            },
            "required": ["file_path"]
        },
        "tags": ["file", "csv"],
    },
    {
        "name": "excel-extractor",
        "display_name": "Excel",
        "description": "Read data from Excel file",
        "type": "extractor",
        "category": "file",
        "python_class": "app.modules.extractors.excel.ExcelExtractor",
        "icon": "Description",
        "config_schema": {
            "type": "object",
            "properties": {
                "file_path": {"type": "string", "title": "File Path"},
                "sheet_name": {"type": "string", "title": "Sheet Name", "default": "0"}
            },
            "required": ["file_path"]
        },
        "tags": ["file", "excel", "spreadsheet"],
    },
    {
        "name": "json-extractor",
        "display_name": "JSON File",
        "description": "Read data from JSON file",
        "type": "extractor",
        "category": "file",
        "python_class": "app.modules.extractors.json.JSONExtractor",
        "icon": "Description",
        "config_schema": {
            "type": "object",
            "properties": {
                "file_path": {"type": "string", "title": "File Path"}
            },
            "required": ["file_path"]
        },
        "tags": ["file", "json"],
    },
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
                "url": {"type": "string", "title": "API URL", "format": "uri"},
                "method": {"type": "string", "title": "HTTP Method", "enum": ["GET", "POST"], "default": "GET"},
                "headers": {"type": "object", "title": "Headers"},
                "auth_type": {"type": "string", "title": "Auth Type", "enum": ["none", "bearer", "basic"], "default": "none"}
            },
            "required": ["url"]
        },
        "tags": ["api", "rest", "http"],
    },
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
                "bucket": {"type": "string", "title": "Bucket Name"},
                "key": {"type": "string", "title": "Object Key/Path"},
                "endpoint_url": {"type": "string", "title": "Endpoint URL (for MinIO)"}
            },
            "required": ["bucket", "key"]
        },
        "tags": ["cloud", "s3", "storage"],
    },

    # TRANSFORMERS
    {
        "name": "filter-transformer",
        "display_name": "Filter Rows",
        "description": "Filter rows based on conditions",
        "type": "transformer",
        "category": "cleaning",
        "python_class": "app.modules.transformers.filter.FilterTransformer",
        "icon": "FilterAlt",
        "config_schema": {
            "type": "object",
            "properties": {
                "column": {"type": "string", "title": "Column"},
                "operator": {"type": "string", "title": "Operator", "enum": ["==", "!=", ">", "<", ">=", "<=", "contains", "startswith"]},
                "value": {"type": "string", "title": "Value"}
            },
            "required": ["column", "operator"]
        },
        "tags": ["cleaning", "filtering"],
    },
    {
        "name": "deduplicate-transformer",
        "display_name": "Remove Duplicates",
        "description": "Remove duplicate rows",
        "type": "transformer",
        "category": "cleaning",
        "python_class": "app.modules.transformers.deduplicate.DeduplicateTransformer",
        "icon": "FilterList",
        "config_schema": {
            "type": "object",
            "properties": {
                "columns": {"type": "array", "title": "Columns to check", "items": {"type": "string"}},
                "keep": {"type": "string", "title": "Keep", "enum": ["first", "last"], "default": "first"}
            }
        },
        "tags": ["cleaning", "deduplication"],
    },
    {
        "name": "remove-nulls-transformer",
        "display_name": "Remove Null Values",
        "description": "Remove rows with null values",
        "type": "transformer",
        "category": "cleaning",
        "python_class": "app.modules.transformers.remove_nulls.RemoveNullsTransformer",
        "icon": "FilterAlt",
        "config_schema": {
            "type": "object",
            "properties": {
                "columns": {"type": "array", "title": "Columns", "items": {"type": "string"}},
                "how": {"type": "string", "title": "How", "enum": ["any", "all"], "default": "any"}
            }
        },
        "tags": ["cleaning", "null-handling"],
    },

    # LOADERS
    {
        "name": "postgres-loader",
        "display_name": "PostgreSQL",
        "description": "Load data into PostgreSQL database",
        "type": "loader",
        "category": "database",
        "python_class": "app.modules.loaders.postgres.PostgreSQLLoader",
        "icon": "Storage",
        "config_schema": {
            "type": "object",
            "properties": {
                "connection_id": {"type": "string", "title": "Connection"},
                "table": {"type": "string", "title": "Table Name"},
                "if_exists": {"type": "string", "title": "If Table Exists", "enum": ["fail", "replace", "append"], "default": "append"}
            },
            "required": ["connection_id", "table"]
        },
        "tags": ["database", "sql"],
    },
    {
        "name": "mysql-loader",
        "display_name": "MySQL",
        "description": "Load data into MySQL database",
        "type": "loader",
        "category": "database",
        "python_class": "app.modules.loaders.mysql.MySQLLoader",
        "icon": "Storage",
        "config_schema": {
            "type": "object",
            "properties": {
                "connection_id": {"type": "string", "title": "Connection"},
                "table": {"type": "string", "title": "Table Name"},
                "if_exists": {"type": "string", "title": "If Table Exists", "enum": ["fail", "replace", "append"], "default": "append"}
            },
            "required": ["connection_id", "table"]
        },
        "tags": ["database", "sql"],
    },
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
                "file_path": {"type": "string", "title": "File Path"},
                "delimiter": {"type": "string", "title": "Delimiter", "default": ","},
                "include_header": {"type": "boolean", "title": "Include Header", "default": True}
            },
            "required": ["file_path"]
        },
        "tags": ["file", "csv"],
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

        print(f"✅ Successfully seeded {created} modules!")
        print(f"   - Extractors: {sum(1 for m in MODULES if m['type'] == 'extractor')}")
        print(f"   - Transformers: {sum(1 for m in MODULES if m['type'] == 'transformer')}")
        print(f"   - Loaders: {sum(1 for m in MODULES if m['type'] == 'loader')}")

    except Exception as e:
        db.rollback()
        print(f"❌ Error seeding modules: {e}")
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("🌱 Seeding modules...")
    seed_modules()
