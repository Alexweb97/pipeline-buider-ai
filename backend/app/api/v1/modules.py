"""Module API Routes"""
from fastapi import APIRouter

router = APIRouter()

@router.get("")
async def list_modules():
    """List all available modules"""
    return {
        "extractors": ["postgres", "mysql", "csv", "api"],
        "transformers": ["cleaner", "aggregator", "joiner"],
        "loaders": ["postgres", "s3", "parquet"]
    }

@router.get("/{module_type}/{module_name}/schema")
async def get_module_schema(module_type: str, module_name: str):
    """Get module configuration schema"""
    return {"schema": {}, "defaults": {}}
