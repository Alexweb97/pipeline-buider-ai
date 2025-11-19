"""
CSV Loader Module
Save data to CSV file with configurable output path
"""
import os
from pathlib import Path
from typing import Any

import pandas as pd
from sqlalchemy.orm import Session


class CSVLoader:
    """
    Save data to CSV file

    Configuration:
    - file_path: Output file path (supports special paths like ~/Downloads)
    - filename: Optional filename (if file_path is a directory)
    - delimiter: Column separator (default: ',')
    - encoding: File encoding (default: 'utf-8')
    - include_header: Write column names as first row (default: True)
    - quote_all: Quote all fields (default: False)
    - append_mode: Append to existing file (default: False)
    - create_dirs: Create directories if they don't exist (default: True)
    """

    def __init__(self, config: dict[str, Any], db: Session):
        """
        Initialize CSV Loader

        Args:
            config: Module configuration
            db: Database session (not used but required for interface)
        """
        self.file_path = config.get('file_path', '')
        self.filename = config.get('filename', 'output.csv')
        self.delimiter = config.get('delimiter', ',')
        self.encoding = config.get('encoding', 'utf-8')
        self.include_header = config.get('include_header', True)
        self.quote_all = config.get('quote_all', False)
        self.append_mode = config.get('append_mode', False)
        self.create_dirs = config.get('create_dirs', True)
        self.db = db

        if not self.file_path:
            raise ValueError("file_path is required")

    def _resolve_output_path(self) -> Path:
        """
        Resolve the output file path, handling special paths

        Returns:
            Resolved Path object
        """
        # Expand user paths (~ for home directory)
        path = Path(self.file_path).expanduser()

        # If path is a directory, append filename
        if path.is_dir() or (not path.suffix and not path.exists()):
            path = path / self.filename

        # Ensure .csv extension
        if not path.suffix:
            path = path.with_suffix('.csv')
        elif path.suffix.lower() != '.csv':
            path = path.with_suffix('.csv')

        return path

    def execute(self, data: pd.DataFrame) -> dict[str, Any]:
        """
        Save data to CSV file

        Args:
            data: DataFrame to save

        Returns:
            Dictionary with execution results

        Raises:
            RuntimeError: If save fails
        """
        try:
            # Resolve output path
            output_path = self._resolve_output_path()

            # Create directories if needed
            if self.create_dirs:
                output_path.parent.mkdir(parents=True, exist_ok=True)

            # Determine write mode
            mode = 'a' if self.append_mode and output_path.exists() else 'w'
            write_header = self.include_header and (mode == 'w' or not output_path.exists())

            # Configure quoting
            from csv import QUOTE_ALL, QUOTE_MINIMAL
            quoting = QUOTE_ALL if self.quote_all else QUOTE_MINIMAL

            # Save to CSV
            data.to_csv(
                output_path,
                sep=self.delimiter,
                encoding=self.encoding,
                index=False,
                header=write_header,
                mode=mode,
                quoting=quoting,
            )

            # Get file info
            file_size = output_path.stat().st_size
            row_count = len(data)
            col_count = len(data.columns)

            return {
                "success": True,
                "message": f"Data saved to {output_path}",
                "file_path": str(output_path.absolute()),
                "rows_written": row_count,
                "columns": col_count,
                "file_size_bytes": file_size,
                "mode": "append" if self.append_mode else "overwrite",
            }

        except Exception as e:
            raise RuntimeError(f"CSV save failed: {str(e)}") from e

    @staticmethod
    def get_metadata() -> dict[str, Any]:
        """Get module metadata"""
        return {
            "name": "csv-loader",
            "display_name": "CSV File",
            "description": "Save data to CSV file",
            "type": "loader",
            "category": "file",
            "icon": "Storage",
            "tags": ["file", "csv", "export"],
        }
