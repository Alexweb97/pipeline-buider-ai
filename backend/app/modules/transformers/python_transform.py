"""
Python Transform Module
Allows users to write custom Python code for data transformation
"""
from typing import Any, Dict
import pandas as pd
from app.core.code_executor import CodeExecutor


class PythonTransformer:
    """
    Execute custom Python transformation code in a secure sandbox

    Configuration:
    - code: Python code with a 'transform' function
    - timeout: Maximum execution time in seconds (default: 30)
    """

    def __init__(self, config: Dict[str, Any]):
        """
        Initialize Python Transformer

        Args:
            config: Module configuration containing:
                - code (str): Python code with transform function
                - timeout (int, optional): Execution timeout in seconds
        """
        self.code = config.get('code', '')
        self.timeout = config.get('timeout', 30)

        if not self.code:
            raise ValueError("Python code is required")

        self.executor = CodeExecutor(timeout=self.timeout)

    def execute(self, df: pd.DataFrame) -> pd.DataFrame:
        """
        Execute the transformation

        Args:
            df: Input pandas DataFrame

        Returns:
            Transformed DataFrame

        Raises:
            RuntimeError: If transformation fails
        """
        if df is None or df.empty:
            raise ValueError("Input DataFrame is empty")

        try:
            result = self.executor.execute_python(
                code=self.code,
                df=df,
                function_name='transform'
            )

            return result

        except Exception as e:
            raise RuntimeError(f"Python transformation failed: {str(e)}")

    @staticmethod
    def get_config_schema() -> Dict[str, Any]:
        """Get JSON schema for module configuration"""
        return {
            "type": "object",
            "properties": {
                "code": {
                    "type": "string",
                    "title": "Python Code",
                    "description": "Python code with a transform(df) function",
                    "format": "code",
                    "default": CodeExecutor.get_sample_template()
                },
                "timeout": {
                    "type": "integer",
                    "title": "Timeout (seconds)",
                    "description": "Maximum execution time",
                    "default": 30,
                    "minimum": 1,
                    "maximum": 300
                }
            },
            "required": ["code"]
        }

    @staticmethod
    def get_metadata() -> Dict[str, Any]:
        """Get module metadata"""
        return {
            "name": "python-transformer",
            "display_name": "Python Transform",
            "description": "Execute custom Python code for data transformation",
            "type": "transformer",
            "category": "custom",
            "icon": "Code",
            "tags": ["python", "custom", "code", "flexible"],
        }
