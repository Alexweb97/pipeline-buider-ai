"""
Unit Tests for Data Transformers
"""
import pandas as pd
import pytest

from app.core.code_executor import CodeExecutor
from app.modules.transformers.python_transform import PythonTransformer
from app.modules.transformers.sql_transform import SQLTransformer


@pytest.fixture
def sample_dataframe():
    """Create a sample DataFrame for testing"""
    return pd.DataFrame({
        'id': [1, 2, 3, 4, 5],
        'name': ['Alice', 'Bob', 'Charlie', 'David', 'Eve'],
        'age': [25, 30, 35, 28, 32],
        'salary': [50000, 60000, 75000, 55000, 65000],
        'department': ['IT', 'HR', 'IT', 'Finance', 'HR'],
    })


class TestCodeExecutor:
    """Test Code Executor (Python sandbox)"""

    def test_simple_transform(self, sample_dataframe):
        """Test simple transformation"""
        code = """
def transform(df: pd.DataFrame) -> pd.DataFrame:
    df['age_in_months'] = df['age'] * 12
    return df
"""
        executor = CodeExecutor()
        result = executor.execute_python(code, sample_dataframe)

        assert 'age_in_months' in result.columns
        assert result['age_in_months'].tolist() == [300, 360, 420, 336, 384]

    def test_filter_transform(self, sample_dataframe):
        """Test filtering transformation"""
        code = """
def transform(df: pd.DataFrame) -> pd.DataFrame:
    return df[df['age'] > 30]
"""
        executor = CodeExecutor()
        result = executor.execute_python(code, sample_dataframe)

        assert len(result) == 2
        assert result['name'].tolist() == ['Charlie', 'Eve']

    def test_aggregation_transform(self, sample_dataframe):
        """Test aggregation transformation"""
        code = """
def transform(df: pd.DataFrame) -> pd.DataFrame:
    return df.groupby('department').agg({
        'salary': 'mean',
        'age': 'mean'
    }).reset_index()
"""
        executor = CodeExecutor()
        result = executor.execute_python(code, sample_dataframe)

        assert len(result) == 3
        assert 'department' in result.columns
        it_salary = result[result['department'] == 'IT']['salary'].iloc[0]
        assert it_salary == 62500  # (50000 + 75000) / 2

    def test_column_rename(self, sample_dataframe):
        """Test column renaming"""
        code = """
def transform(df: pd.DataFrame) -> pd.DataFrame:
    return df.rename(columns={'name': 'employee_name', 'age': 'employee_age'})
"""
        executor = CodeExecutor()
        result = executor.execute_python(code, sample_dataframe)

        assert 'employee_name' in result.columns
        assert 'employee_age' in result.columns
        assert 'name' not in result.columns
        assert 'age' not in result.columns

    def test_type_conversion(self, sample_dataframe):
        """Test type conversion"""
        code = """
def transform(df: pd.DataFrame) -> pd.DataFrame:
    df['id'] = df['id'].astype(str)
    df['salary'] = df['salary'].astype(float)
    return df
"""
        executor = CodeExecutor()
        result = executor.execute_python(code, sample_dataframe)

        assert result['id'].dtype == object  # string type
        assert result['salary'].dtype == float

    def test_unsafe_code_blocked(self):
        """Test that unsafe code is blocked"""
        df = pd.DataFrame({'col1': [1, 2, 3]})

        # Test file operations
        code = """
def transform(df: pd.DataFrame) -> pd.DataFrame:
    with open('/etc/passwd', 'r') as f:
        content = f.read()
    return df
"""
        executor = CodeExecutor()
        with pytest.raises(Exception):  # Should raise NameError or similar
            executor.execute_python(code, df)

    def test_unsafe_imports_blocked(self):
        """Test that unsafe imports are blocked"""
        df = pd.DataFrame({'col1': [1, 2, 3]})

        code = """
import os
def transform(df: pd.DataFrame) -> pd.DataFrame:
    os.system('ls')
    return df
"""
        executor = CodeExecutor()
        with pytest.raises(Exception):  # Should raise ImportError or similar
            executor.execute_python(code, df)

    def test_timeout_protection(self):
        """Test timeout protection for infinite loops"""
        df = pd.DataFrame({'col1': [1, 2, 3]})

        code = """
def transform(df: pd.DataFrame) -> pd.DataFrame:
    while True:
        pass
    return df
"""
        executor = CodeExecutor(timeout=2)
        with pytest.raises(TimeoutError):
            executor.execute_python(code, df)

    def test_invalid_syntax(self):
        """Test handling of invalid Python syntax"""
        df = pd.DataFrame({'col1': [1, 2, 3]})

        code = """
def transform(df: pd.DataFrame) -> pd.DataFrame:
    this is not valid python
    return df
"""
        executor = CodeExecutor()
        with pytest.raises(SyntaxError):
            executor.execute_python(code, df)

    def test_missing_transform_function(self):
        """Test handling of missing transform function"""
        df = pd.DataFrame({'col1': [1, 2, 3]})

        code = """
def wrong_function_name(df: pd.DataFrame) -> pd.DataFrame:
    return df
"""
        executor = CodeExecutor()
        with pytest.raises(Exception):  # Should raise KeyError or NameError
            executor.execute_python(code, df)


class TestPythonTransformer:
    """Test Python Transformer Module"""

    def test_python_transformer_basic(self, sample_dataframe):
        """Test basic Python transformation"""
        config = {
            'code': """
def transform(df: pd.DataFrame) -> pd.DataFrame:
    df['salary_k'] = df['salary'] / 1000
    return df
""",
        }
        transformer = PythonTransformer(config)
        result = transformer.execute(sample_dataframe)

        assert 'salary_k' in result.columns
        assert result['salary_k'].tolist() == [50.0, 60.0, 75.0, 55.0, 65.0]

    def test_python_transformer_filter(self, sample_dataframe):
        """Test filtering with Python transformer"""
        config = {
            'code': """
def transform(df: pd.DataFrame) -> pd.DataFrame:
    return df[df['department'] == 'IT']
""",
        }
        transformer = PythonTransformer(config)
        result = transformer.execute(sample_dataframe)

        assert len(result) == 2
        assert all(result['department'] == 'IT')

    def test_python_transformer_error_handling(self, sample_dataframe):
        """Test error handling in Python transformer"""
        config = {
            'code': """
def transform(df: pd.DataFrame) -> pd.DataFrame:
    raise ValueError("Intentional error")
    return df
""",
        }
        transformer = PythonTransformer(config)

        with pytest.raises(RuntimeError, match="Python transformation failed"):
            transformer.execute(sample_dataframe)

    def test_python_transformer_custom_timeout(self, sample_dataframe):
        """Test custom timeout configuration"""
        config = {
            'code': """
def transform(df: pd.DataFrame) -> pd.DataFrame:
    import time
    time.sleep(5)
    return df
""",
            'timeout': 1,
        }
        transformer = PythonTransformer(config)

        with pytest.raises(RuntimeError):
            transformer.execute(sample_dataframe)

    def test_python_transformer_metadata(self):
        """Test module metadata"""
        metadata = PythonTransformer.get_metadata()

        assert metadata['name'] == 'python-transformer'
        assert metadata['type'] == 'transformer'
        assert 'python' in metadata['tags']


class TestSQLTransformer:
    """Test SQL Transformer Module"""

    def test_sql_transformer_basic(self, sample_dataframe):
        """Test basic SQL transformation"""
        config = {
            'query': """
SELECT id, name, age, salary / 1000 AS salary_k
FROM input
""",
        }
        transformer = SQLTransformer(config)
        result = transformer.execute(sample_dataframe)

        assert 'salary_k' in result.columns
        assert len(result) == 5
        assert result['salary_k'].tolist() == [50.0, 60.0, 75.0, 55.0, 65.0]

    def test_sql_transformer_filter(self, sample_dataframe):
        """Test filtering with SQL"""
        config = {
            'query': """
SELECT * FROM input
WHERE age > 30
""",
        }
        transformer = SQLTransformer(config)
        result = transformer.execute(sample_dataframe)

        assert len(result) == 2
        assert result['name'].tolist() == ['Charlie', 'Eve']

    def test_sql_transformer_aggregation(self, sample_dataframe):
        """Test aggregation with SQL"""
        config = {
            'query': """
SELECT
    department,
    AVG(salary) AS avg_salary,
    AVG(age) AS avg_age,
    COUNT(*) AS employee_count
FROM input
GROUP BY department
ORDER BY department
""",
        }
        transformer = SQLTransformer(config)
        result = transformer.execute(sample_dataframe)

        assert len(result) == 3
        assert 'avg_salary' in result.columns
        it_row = result[result['department'] == 'IT'].iloc[0]
        assert it_row['avg_salary'] == 62500
        assert it_row['employee_count'] == 2

    def test_sql_transformer_join(self):
        """Test SQL join operations"""
        df1 = pd.DataFrame({
            'employee_id': [1, 2, 3],
            'name': ['Alice', 'Bob', 'Charlie'],
        })

        # SQL Transformer only works with single input named 'input'
        # For join testing, we'd need to extend the transformer
        # This is a limitation to document
        config = {
            'query': """
SELECT * FROM input
WHERE employee_id IN (1, 2)
""",
        }
        transformer = SQLTransformer(config)
        result = transformer.execute(df1)

        assert len(result) == 2

    def test_sql_transformer_window_function(self, sample_dataframe):
        """Test window functions in SQL"""
        config = {
            'query': """
SELECT
    *,
    ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary DESC) AS rank_in_dept
FROM input
""",
        }
        transformer = SQLTransformer(config)
        result = transformer.execute(sample_dataframe)

        assert 'rank_in_dept' in result.columns
        # Check that ranking is correct
        it_employees = result[result['department'] == 'IT'].sort_values('salary', ascending=False)
        assert it_employees.iloc[0]['rank_in_dept'] == 1
        assert it_employees.iloc[1]['rank_in_dept'] == 2

    def test_sql_transformer_case_when(self, sample_dataframe):
        """Test CASE WHEN in SQL"""
        config = {
            'query': """
SELECT
    *,
    CASE
        WHEN salary > 70000 THEN 'High'
        WHEN salary > 55000 THEN 'Medium'
        ELSE 'Low'
    END AS salary_category
FROM input
""",
        }
        transformer = SQLTransformer(config)
        result = transformer.execute(sample_dataframe)

        assert 'salary_category' in result.columns
        assert result[result['name'] == 'Charlie']['salary_category'].iloc[0] == 'High'
        assert result[result['name'] == 'Alice']['salary_category'].iloc[0] == 'Low'

    def test_sql_transformer_cte(self, sample_dataframe):
        """Test Common Table Expressions (CTE)"""
        config = {
            'query': """
WITH high_earners AS (
    SELECT * FROM input WHERE salary > 60000
)
SELECT department, COUNT(*) AS count
FROM high_earners
GROUP BY department
""",
        }
        transformer = SQLTransformer(config)
        result = transformer.execute(sample_dataframe)

        assert 'count' in result.columns
        assert len(result) >= 1

    def test_sql_transformer_invalid_query(self, sample_dataframe):
        """Test handling of invalid SQL"""
        config = {
            'query': "SELECT * FROM nonexistent_table",
        }
        transformer = SQLTransformer(config)

        with pytest.raises(RuntimeError, match="SQL transformation failed"):
            transformer.execute(sample_dataframe)

    def test_sql_transformer_metadata(self):
        """Test module metadata"""
        metadata = SQLTransformer.get_metadata()

        assert metadata['name'] == 'sql-transformer'
        assert metadata['type'] == 'transformer'
        assert 'sql' in metadata['tags']


class TestTransformerIntegration:
    """Integration tests for chaining transformers"""

    def test_python_then_sql(self, sample_dataframe):
        """Test Python transformer followed by SQL transformer"""
        # First: Python transformation
        python_config = {
            'code': """
def transform(df: pd.DataFrame) -> pd.DataFrame:
    df['salary_k'] = df['salary'] / 1000
    return df
""",
        }
        python_transformer = PythonTransformer(python_config)
        intermediate = python_transformer.execute(sample_dataframe)

        # Second: SQL transformation
        sql_config = {
            'query': """
SELECT department, AVG(salary_k) AS avg_salary_k
FROM input
GROUP BY department
""",
        }
        sql_transformer = SQLTransformer(sql_config)
        final = sql_transformer.execute(intermediate)

        assert 'avg_salary_k' in final.columns
        assert len(final) == 3

    def test_sql_then_python(self, sample_dataframe):
        """Test SQL transformer followed by Python transformer"""
        # First: SQL transformation
        sql_config = {
            'query': "SELECT * FROM input WHERE age > 28",
        }
        sql_transformer = SQLTransformer(sql_config)
        intermediate = sql_transformer.execute(sample_dataframe)

        # Second: Python transformation
        python_config = {
            'code': """
def transform(df: pd.DataFrame) -> pd.DataFrame:
    df['experience_years'] = df['age'] - 22
    return df
""",
        }
        python_transformer = PythonTransformer(python_config)
        final = python_transformer.execute(intermediate)

        assert 'experience_years' in final.columns
        assert len(final) == 4  # age > 28
