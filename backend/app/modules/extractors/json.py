"""
JSON Extractor Module
Extract data from uploaded JSON files
"""
from typing import Any

import pandas as pd
from sqlalchemy.orm import Session

from app.core.file_resolver import resolve_file_path


class JSONExtractor:
    """
    Extract data from uploaded JSON files

    Configuration:
    - file_id: UUID of uploaded file
    - json_path: Path to extract from nested JSON (default: '$' - root)
    - orient: JSON orientation (default: 'records')
    - normalize: Flatten nested objects (default: False)
    """

    def __init__(self, config: dict[str, Any], db: Session):
        """
        Initialize JSON Extractor

        Args:
            config: Module configuration
            db: Database session for file resolution
        """
        self.file_id = config.get('file_id')
        self.json_path = config.get('json_path', '$')
        self.orient = config.get('orient', 'records')
        self.normalize = config.get('normalize', False)
        self.db = db

        if not self.file_id:
            raise ValueError("file_id is required")

    def execute(self) -> pd.DataFrame:
        """
        Extract data from JSON file

        Returns:
            DataFrame with extracted data

        Raises:
            RuntimeError: If extraction fails
        """
        try:
            # Resolve file_id to actual path
            file_path = resolve_file_path(self.file_id, self.db)

            # Read JSON file
            if self.orient in ['records', 'index', 'columns', 'values']:
                df = pd.read_json(file_path, orient=self.orient)
            else:
                # For 'table' or other formats
                df = pd.read_json(file_path)

            # Apply JSON path if specified and not root
            if self.json_path and self.json_path != '$':
                # Simple JSON path support (for nested keys like 'data.items')
                keys = self.json_path.replace('$', '').strip('.').split('.')
                data = df
                for key in keys:
                    if key:
                        data = data[key]
                df = pd.DataFrame(data)

            # Normalize nested structures if requested
            if self.normalize and isinstance(df, pd.DataFrame):
                # Check if any column contains dict/list
                for col in df.columns:
                    if df[col].apply(lambda x: isinstance(x, (dict, list))).any():
                        df = pd.json_normalize(df.to_dict('records'))
                        break

            return df

        except Exception as e:
            raise RuntimeError(f"JSON extraction failed: {str(e)}") from e

    @staticmethod
    def get_metadata() -> dict[str, Any]:
        """Get module metadata"""
        return {
            "name": "json-extractor",
            "display_name": "JSON File",
            "description": "Read data from uploaded JSON file",
            "type": "extractor",
            "category": "file",
            "icon": "Code",
            "tags": ["file", "json", "semi-structured"],
        }
