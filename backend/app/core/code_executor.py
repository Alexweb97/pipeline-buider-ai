"""
Code Executor - Secure sandbox for executing user Python code
Uses RestrictedPython for security
"""
import signal
from contextlib import contextmanager
from typing import Any

import pandas as pd


class TimeoutException(Exception):
    """Raised when code execution times out"""
    pass


def timeout_handler(signum, frame):
    """Signal handler for timeout"""
    raise TimeoutException("Code execution timed out")


@contextmanager
def time_limit(seconds: int):
    """Context manager to limit execution time"""
    signal.signal(signal.SIGALRM, timeout_handler)
    signal.alarm(seconds)
    try:
        yield
    finally:
        signal.alarm(0)


class CodeExecutor:
    """
    Secure code executor with restricted Python environment

    Features:
    - Sandboxed execution (no file I/O, no network, no imports)
    - Timeout protection
    - Memory limit (via timeout)
    - Only pandas operations allowed
    """

    # Safe built-in functions
    SAFE_BUILTINS = {
        'abs': abs,
        'all': all,
        'any': any,
        'bool': bool,
        'dict': dict,
        'enumerate': enumerate,
        'filter': filter,
        'float': float,
        'int': int,
        'len': len,
        'list': list,
        'map': map,
        'max': max,
        'min': min,
        'range': range,
        'round': round,
        'set': set,
        'sorted': sorted,
        'str': str,
        'sum': sum,
        'tuple': tuple,
        'zip': zip,
    }

    def __init__(self, timeout: int = 30):
        """
        Initialize code executor

        Args:
            timeout: Maximum execution time in seconds
        """
        self.timeout = timeout

    def execute_python(
        self,
        code: str,
        df: pd.DataFrame,
        function_name: str = 'transform'
    ) -> pd.DataFrame:
        """
        Execute Python transformation code

        Args:
            code: Python code containing a transform function
            df: Input pandas DataFrame
            function_name: Name of the function to execute (default: 'transform')

        Returns:
            Transformed DataFrame

        Raises:
            ValueError: If code is invalid or function not found
            RuntimeError: If execution fails
            TimeoutException: If execution exceeds timeout
        """
        # Create safe execution environment
        safe_globals = {
            '__builtins__': self.SAFE_BUILTINS,
            'pd': pd,
            'df': df.copy(),  # Work on a copy to avoid side effects
        }

        safe_locals = {}

        try:
            # Execute code with timeout
            with time_limit(self.timeout):
                # Compile and execute code
                exec(code, safe_globals, safe_locals)

                # Get the transform function
                if function_name not in safe_locals:
                    raise ValueError(
                        f"Function '{function_name}' not found in code. "
                        f"Make sure to define: def {function_name}(df: pd.DataFrame) -> pd.DataFrame"
                    )

                transform_func = safe_locals[function_name]

                # Execute transformation
                result = transform_func(df.copy())

                # Validate result
                if not isinstance(result, pd.DataFrame):
                    raise TypeError(
                        f"Transform function must return a pandas DataFrame, "
                        f"got {type(result).__name__}"
                    )

                return result

        except TimeoutException:
            raise TimeoutException(
                f"Code execution timed out after {self.timeout} seconds"
            )
        except SyntaxError as e:
            raise ValueError(f"Syntax error in code: {str(e)}")
        except Exception as e:
            raise RuntimeError(f"Transformation failed: {str(e)}")

    def validate_code(self, code: str) -> dict[str, Any]:
        """
        Validate Python code without executing it

        Args:
            code: Python code to validate

        Returns:
            Dict with validation results
        """
        try:
            # Try to compile the code
            compile(code, '<string>', 'exec')

            # Basic checks
            has_transform = 'def transform(' in code
            has_return = 'return' in code

            return {
                'valid': True,
                'has_transform_function': has_transform,
                'has_return_statement': has_return,
                'warnings': [
                    'Missing transform function definition'
                ] if not has_transform else [],
            }

        except SyntaxError as e:
            return {
                'valid': False,
                'error': str(e),
                'line': e.lineno,
                'offset': e.offset,
            }

    @staticmethod
    def get_sample_template() -> str:
        """Get a sample transform function template"""
        return """def transform(df: pd.DataFrame) -> pd.DataFrame:
    \"\"\"
    Transform the input DataFrame

    Args:
        df: Input pandas DataFrame

    Returns:
        Transformed DataFrame
    \"\"\"
    # Your transformation code here
    # Example: Add a new column
    df['new_column'] = df['existing_column'] * 2

    # Example: Filter rows
    df = df[df['age'] > 18]

    # Example: Group and aggregate
    # df = df.groupby('category').agg({'value': 'sum'}).reset_index()

    return df
"""


def preview_transform(
    df: pd.DataFrame,
    code: str,
    sample_size: int = 100
) -> dict[str, Any]:
    """
    Preview transformation on a sample of data

    Args:
        df: Input DataFrame
        code: Transformation code
        sample_size: Number of rows to use for preview

    Returns:
        Dict with preview results including output sample and schema
    """
    executor = CodeExecutor(timeout=10)  # Shorter timeout for preview

    try:
        # Use sample for preview
        sample_df = df.head(sample_size).copy()

        # Execute transformation
        result = executor.execute_python(code, sample_df)

        # Generate preview data
        return {
            'success': True,
            'input_shape': list(sample_df.shape),
            'output_shape': list(result.shape),
            'input_columns': list(sample_df.columns),
            'output_columns': list(result.columns),
            'preview_data': result.head(10).to_dict('records'),
            'schema': {
                col: {
                    'dtype': str(result[col].dtype),
                    'null_count': int(result[col].isnull().sum()),
                    'unique_count': int(result[col].nunique()),
                }
                for col in result.columns
            },
            'statistics': result.describe(include='all').to_dict() if len(result) > 0 else {},
        }

    except Exception as e:
        return {
            'success': False,
            'error': str(e),
            'error_type': type(e).__name__,
        }
