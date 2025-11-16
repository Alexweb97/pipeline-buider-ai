"""
Excel Extractor Module
Extract data from uploaded Excel files (.xlsx, .xls)
"""
from typing import Any

import pandas as pd
from sqlalchemy.orm import Session

from app.core.file_resolver import resolve_file_path


class ExcelExtractor:
    """
    Extract data from uploaded Excel files

    Configuration:
    - file_id: UUID of uploaded file
    - sheet_name: Sheet name or index (default: '0')
    - skip_rows: Number of rows to skip (default: 0)
    - has_header: Whether first row is header (default: True)
    - use_cols: Columns to use (e.g., 'A:D' or '0,2,4')
    """

    def __init__(self, config: dict[str, Any], db: Session):
        """
        Initialize Excel Extractor

        Args:
            config: Module configuration
            db: Database session for file resolution
        """
        self.file_id = config.get('file_id')
        self.sheet_name = config.get('sheet_name', '0')
        self.skip_rows = config.get('skip_rows', 0)
        self.has_header = config.get('has_header', True)
        self.use_cols = config.get('use_cols', '')
        self.db = db

        if not self.file_id:
            raise ValueError("file_id is required")

        # Convert sheet_name to int if it's a numeric string
        try:
            self.sheet_name = int(self.sheet_name)
        except (ValueError, TypeError):
            pass  # Keep as string (sheet name)

    def execute(self) -> pd.DataFrame:
        """
        Extract data from Excel file

        Returns:
            DataFrame with extracted data

        Raises:
            RuntimeError: If extraction fails
        """
        try:
            # Resolve file_id to actual path
            file_path = resolve_file_path(self.file_id, self.db)

            # Prepare usecols parameter
            usecols = None
            if self.use_cols:
                # Handle Excel column ranges (e.g., 'A:D')
                if ':' in self.use_cols:
                    usecols = self.use_cols
                # Handle comma-separated column indices (e.g., '0,2,4')
                elif ',' in self.use_cols:
                    usecols = [int(x.strip()) for x in self.use_cols.split(',')]

            # Read Excel file
            df = pd.read_excel(
                file_path,
                sheet_name=self.sheet_name,
                skiprows=self.skip_rows if self.skip_rows > 0 else None,
                header=0 if self.has_header else None,
                usecols=usecols,
            )

            # If no header, generate column names
            if not self.has_header:
                df.columns = [f'column_{i}' for i in range(len(df.columns))]

            return df

        except Exception as e:
            raise RuntimeError(f"Excel extraction failed: {str(e)}") from e

    @staticmethod
    def get_metadata() -> dict[str, Any]:
        """Get module metadata"""
        return {
            "name": "excel-extractor",
            "display_name": "Excel File",
            "description": "Read data from uploaded Excel file (.xlsx, .xls)",
            "type": "extractor",
            "category": "file",
            "icon": "TableChart",
            "tags": ["file", "excel", "spreadsheet", "tabular"],
        }
