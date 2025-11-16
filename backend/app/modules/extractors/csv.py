"""
CSV Extractor Module
Extract data from uploaded CSV files
"""
from typing import Any

import pandas as pd
from sqlalchemy.orm import Session

from app.core.file_resolver import resolve_file_path


class CSVExtractor:
    """
    Extract data from uploaded CSV files

    Configuration:
    - file_id: UUID of uploaded file
    - delimiter: Column separator (default: ',')
    - encoding: File encoding (default: 'utf-8')
    - skip_rows: Number of rows to skip (default: 0)
    - has_header: Whether first row is header (default: True)
    - na_values: Values to treat as null (default: ['', 'NA', 'N/A', 'null'])
    """

    def __init__(self, config: dict[str, Any], db: Session):
        """
        Initialize CSV Extractor

        Args:
            config: Module configuration
            db: Database session for file resolution
        """
        self.file_id = config.get('file_id')
        self.delimiter = config.get('delimiter', ',')
        self.encoding = config.get('encoding', 'utf-8')
        self.skip_rows = config.get('skip_rows', 0)
        self.has_header = config.get('has_header', True)
        self.na_values = config.get('na_values', ['', 'NA', 'N/A', 'null'])
        self.db = db

        if not self.file_id:
            raise ValueError("file_id is required")

    def execute(self) -> pd.DataFrame:
        """
        Extract data from CSV file

        Returns:
            DataFrame with extracted data

        Raises:
            RuntimeError: If extraction fails
        """
        try:
            # Resolve file_id to actual path
            file_path = resolve_file_path(self.file_id, self.db)

            # Read CSV file
            df = pd.read_csv(
                file_path,
                delimiter=self.delimiter,
                encoding=self.encoding,
                skiprows=self.skip_rows if self.skip_rows > 0 else None,
                header=0 if self.has_header else None,
                na_values=self.na_values,
            )

            # If no header, generate column names
            if not self.has_header:
                df.columns = [f'column_{i}' for i in range(len(df.columns))]

            return df

        except Exception as e:
            raise RuntimeError(f"CSV extraction failed: {str(e)}") from e

    @staticmethod
    def get_metadata() -> dict[str, Any]:
        """Get module metadata"""
        return {
            "name": "csv-extractor",
            "display_name": "CSV File",
            "description": "Read data from uploaded CSV file",
            "type": "extractor",
            "category": "file",
            "icon": "Description",
            "tags": ["file", "csv", "tabular"],
        }
