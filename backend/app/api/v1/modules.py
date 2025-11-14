"""Module API Routes"""
from typing import Annotated, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from app.api.dependencies.database import get_db
from app.db.models.module import Module
from app.schemas.module import ModuleResponse, ModuleCreate

router = APIRouter()


@router.post("", status_code=status.HTTP_201_CREATED)
def create_module(
    module: ModuleCreate,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """Create a new module"""

    # Check if module with same name already exists
    existing = db.query(Module).filter(Module.name == module.name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Module with name '{module.name}' already exists"
        )

    # Create new module
    db_module = Module(
        **module.model_dump(),
        version="1.0.0",
        is_active=True,
        usage_count=0
    )

    db.add(db_module)
    db.commit()
    db.refresh(db_module)

    return ModuleResponse.model_validate(db_module)


@router.get("")
def list_modules(
    type_filter: Optional[str] = Query(None, alias="type"),
    category: Optional[str] = None,
    is_active: Optional[bool] = None,
    search: Optional[str] = None,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """List all available modules"""

    # Build query
    query = db.query(Module)

    # Apply filters
    if type_filter:
        query = query.filter(Module.type == type_filter)

    if category:
        query = query.filter(Module.category == category)

    if is_active is not None:
        query = query.filter(Module.is_active == is_active)

    if search:
        query = query.filter(
            (Module.name.ilike(f"%{search}%")) |
            (Module.display_name.ilike(f"%{search}%")) |
            (Module.description.ilike(f"%{search}%"))
        )

    # Get modules
    modules = query.order_by(Module.type, Module.display_name).all()

    return {
        "modules": [ModuleResponse.model_validate(m) for m in modules],
        "total": len(modules),
    }


@router.get("/{module_id}")
def get_module(
    module_id: UUID,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """Get module by ID"""

    module = db.query(Module).filter(Module.id == module_id).first()

    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Module not found",
        )

    return ModuleResponse.model_validate(module)


@router.get("/{module_type}/{module_name}/schema")
def get_module_schema(
    module_type: str,
    module_name: str,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """Get module configuration schema"""

    # Find module by type and name
    module = (
        db.query(Module)
        .filter(
            Module.type == module_type,
            Module.name == module_name,
        )
        .first()
    )

    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Module {module_type}/{module_name} not found",
        )

    # Extract defaults from config schema
    defaults = {}
    if module.config_schema and "properties" in module.config_schema:
        for key, value in module.config_schema["properties"].items():
            if "default" in value:
                defaults[key] = value["default"]

    return {
        "schema": module.config_schema,
        "defaults": defaults,
    }


@router.post("/{module_id}/increment-usage")
def increment_usage(
    module_id: UUID,
    db: Annotated[Session, Depends(get_db)] = None,
):
    """Increment module usage count"""

    module = db.query(Module).filter(Module.id == module_id).first()

    if not module:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Module not found",
        )

    module.usage_count += 1
    db.commit()

    return {"message": "Usage count incremented", "usage_count": module.usage_count}


@router.post("/seed", status_code=status.HTTP_201_CREATED)
def seed_modules(
    db: Annotated[Session, Depends(get_db)] = None,
):
    """Seed initial module definitions (admin endpoint)"""

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

    # Check if modules already exist
    existing_count = db.query(Module).count()

    if existing_count > 0:
        return {
            "message": f"Modules already seeded ({existing_count} modules exist)",
            "count": existing_count,
            "skipped": True
        }

    # Create modules
    created = 0
    for module_data in MODULES:
        module = Module(**module_data, version="1.0.0", is_active=True, usage_count=0)
        db.add(module)
        created += 1

    db.commit()

    return {
        "message": f"Successfully seeded {created} modules",
        "count": created,
        "extractors": sum(1 for m in MODULES if m['type'] == 'extractor'),
        "transformers": sum(1 for m in MODULES if m['type'] == 'transformer'),
        "loaders": sum(1 for m in MODULES if m['type'] == 'loader'),
    }
