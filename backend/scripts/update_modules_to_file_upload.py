#!/usr/bin/env python3
"""
Update existing file extractor modules to use file_id with file-upload format
"""
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from sqlalchemy import text
from app.db.session import engine

# Updated schemas for file extractors
UPDATED_MODULES = {
    "csv-extractor": {
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
    "excel-extractor": {
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
    "json-extractor": {
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
    "parquet-extractor": {
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
    }
}

def main():
    print("Updating file extractor modules to use file-upload format...")

    import json

    with engine.connect() as conn:
        for module_name, config_schema in UPDATED_MODULES.items():
            print(f"\nUpdating {module_name}...")

            # Update the config_schema
            result = conn.execute(
                text("""
                    UPDATE modules
                    SET config_schema = :schema::jsonb,
                        display_name = :display_name
                    WHERE name = :name
                    RETURNING name, display_name
                """),
                {
                    "name": module_name,
                    "schema": json.dumps(config_schema),
                    "display_name": {
                        "csv-extractor": "CSV File",
                        "excel-extractor": "Excel File",
                        "json-extractor": "JSON File",
                        "parquet-extractor": "Parquet File"
                    }[module_name]
                }
            )

            updated = result.fetchone()
            if updated:
                print(f"  ✓ Updated: {updated[1]}")
            else:
                print(f"  ✗ Module not found: {module_name}")

        conn.commit()

    print("\n✅ Module update complete!")
    print("\nUpdated modules:")
    print("  - CSV File: now uses file_id with file-upload format")
    print("  - Excel File: now uses file_id with file-upload format")
    print("  - JSON File: now uses file_id with file-upload format")
    print("  - Parquet File: now uses file_id with file-upload format")

if __name__ == "__main__":
    main()
