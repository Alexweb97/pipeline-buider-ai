"""
Parquet Extractor Module
Extract data from uploaded Parquet files
"""
from typing import Any

import pandas as pd
from sqlalchemy.orm import Session

from app.core.file_resolver import resolve_file_path


class ParquetExtractor:
    """
    Extract data from uploaded Parquet files

    Configuration:
    - file_id: UUID of uploaded file
    - columns: List of columns to read (empty = all columns)
    - filters: PyArrow filter expression (optional)
    """

    def __init__(self, config: dict[str, Any], db: Session):
        """
        Initialize Parquet Extractor

        Args:
            config: Module configuration
            db: Database session for file resolution
        """
        self.file_id = config.get('file_id')
        self.columns = config.get('columns', [])
        self.filters = config.get('filters', '')
        self.db = db

        if not self.file_id:
            raise ValueError("file_id is required")

    def execute(self) -> pd.DataFrame:
        """
        Extract data from Parquet file

        Returns:
            DataFrame with extracted data

        Raises:
            RuntimeError: If extraction fails
        """
        try:
            # Resolve file_id to actual path
            file_path = resolve_file_path(self.file_id, self.db)

            # Prepare columns parameter
            columns = None if not self.columns else self.columns

            # Read Parquet file
            # Note: filters would require PyArrow, which we're not using here
            # For basic implementation, just read the file
            df = pd.read_parquet(
                file_path,
                columns=columns,
            )

            # TODO: Implement filters support with PyArrow if needed
            # if self.filters:
            #     import pyarrow.parquet as pq
            #     table = pq.read_table(file_path, columns=columns, filters=self.filters)
            #     df = table.to_pandas()

            return df

        except Exception as e:
            raise RuntimeError(f"Parquet extraction failed: {str(e)}") from e

    @staticmethod
    def get_metadata() -> dict[str, Any]:
        """Get module metadata"""
        return {
            "name": "parquet-extractor",
            "display_name": "Parquet File",
            "description": "Read data from uploaded Parquet file",
            "type": "extractor",
            "category": "file",
            "icon": "Inventory",
            "tags": ["file", "parquet", "columnar"],
        }
