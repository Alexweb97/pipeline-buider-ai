# Tests Documentation

## Overview

This directory contains all automated tests for the LogiData AI ETL Builder backend.

### Test Structure

```
tests/
├── unit/                      # Unit tests for individual modules
│   ├── test_extractors.py     # Tests for CSV, Excel, JSON, Parquet extractors
│   └── test_transformers.py   # Tests for Python & SQL transformers
├── test_api/                  # API endpoint tests
│   ├── test_auth.py           # Authentication endpoints
│   └── test_transforms.py     # Transformation preview/validate endpoints
├── integration/               # Integration tests (planned)
└── e2e/                       # End-to-end tests (planned)
```

## Running Tests

### Prerequisites

1. Install development dependencies:
```bash
# From backend directory
uv sync --all-extras
# OR
uv sync && uv pip install pytest pytest-asyncio pytest-cov
```

2. Ensure required packages are installed:
   - `pytest` - Test framework
   - `pytest-asyncio` - Async test support
   - `pytest-cov` - Coverage reporting
   - `openpyxl` - Excel file support
   - `duckdb` - SQL transformation support
   - `RestrictedPython` - Python sandbox

### Run All Tests

```bash
# Run all tests
python -m pytest

# Run with verbose output
python -m pytest -v

# Run with coverage report
python -m pytest --cov=app --cov-report=html
```

### Run Specific Test Files

```bash
# Run extractor tests only
python -m pytest tests/unit/test_extractors.py -v

# Run transformer tests only
python -m pytest tests/unit/test_transformers.py -v

# Run API tests only
python -m pytest tests/test_api/test_transforms.py -v
```

### Run Specific Test Classes

```bash
# Run CSV extractor tests
python -m pytest tests/unit/test_extractors.py::TestCSVExtractor -v

# Run Python transformer tests
python -m pytest tests/unit/test_transformers.py::TestPythonTransformer -v

# Run preview endpoint tests
python -m pytest tests/test_api/test_transforms.py::TestPreviewEndpoint -v
```

### Run Specific Test Methods

```bash
# Run a single test
python -m pytest tests/unit/test_extractors.py::TestCSVExtractor::test_csv_basic_extraction -v
```

## In Docker

To run tests in the Docker container:

```bash
# First, rebuild the container with updated dependencies
docker-compose build backend

# Then run tests
docker exec etl_backend python -m pytest

# Run specific tests
docker exec etl_backend python -m pytest tests/unit/test_extractors.py -v

# Run with coverage
docker exec etl_backend python -m pytest --cov=app --cov-report=term-missing
```

## Test Coverage

### Current Coverage

- **Extractors** (100% coverage goal):
  - ✅ CSVExtractor: Basic extraction, custom delimiter, skip rows, no header, error handling
  - ✅ ExcelExtractor: Basic extraction, sheet selection
  - ✅ JSONExtractor: Basic extraction
  - ✅ ParquetExtractor: Basic extraction, column selection
  - ✅ FileResolver: Valid files, nonexistent files, soft-deleted files

- **Transformers** (100% coverage goal):
  - ✅ CodeExecutor: Simple transforms, filters, aggregations, column operations, security (blocked unsafe code/imports), timeout protection, syntax validation
  - ✅ PythonTransformer: Basic transforms, filters, error handling, custom timeout, metadata
  - ✅ SQLTransformer: Basic queries, filters, aggregations, window functions, CASE WHEN, CTEs, error handling, metadata

- **API Endpoints** (90% coverage goal):
  - ✅ /transforms/preview: Python & SQL transforms, aggregations, validation errors, authentication
  - ✅ /transforms/validate: Valid/invalid code, syntax errors, authentication
  - ✅ /transforms/template: Python & SQL templates, authentication

### Coverage Report

After running tests with coverage, view the HTML report:

```bash
# Generate coverage report
python -m pytest --cov=app --cov-report=html

# Open report
firefox htmlcov/index.html
# OR
google-chrome htmlcov/index.html
```

## Test Categories

### Unit Tests

Unit tests verify individual components in isolation:
- Module classes (extractors, transformers, loaders)
- Utility functions
- Core business logic

**Characteristics:**
- Fast execution
- No external dependencies
- Uses mocks/fixtures for dependencies
- Focused on single responsibility

### Integration Tests

Integration tests verify interactions between components:
- Database operations with real PostgreSQL
- File system operations
- Module chaining (extractor → transformer → loader)

**Status:** 📅 Planned

### E2E Tests

End-to-end tests verify complete user workflows:
- Pipeline creation and execution
- User authentication flows
- File upload → transformation → export workflows

**Status:** 📅 Planned

## Writing New Tests

### Test Naming Convention

- File: `test_<module_name>.py`
- Class: `Test<ClassName>`
- Method: `test_<method_description>`

Example:
```python
class TestCSVExtractor:
    def test_csv_basic_extraction(self):
        ...

    def test_csv_with_custom_delimiter(self):
        ...
```

### Test Structure (AAA Pattern)

```python
def test_example(self):
    # Arrange: Setup test data and dependencies
    config = {'file_id': 'test-id'}
    extractor = CSVExtractor(config, db_session)

    # Act: Execute the operation
    result = extractor.execute()

    # Assert: Verify the results
    assert len(result) == expected_rows
    assert 'column_name' in result.columns
```

### Using Fixtures

```python
import pytest

@pytest.fixture
def sample_dataframe():
    """Create a sample DataFrame for testing"""
    return pd.DataFrame({
        'id': [1, 2, 3],
        'name': ['A', 'B', 'C'],
    })

def test_with_fixture(sample_dataframe):
    # Use the fixture
    assert len(sample_dataframe) == 3
```

### Testing Exceptions

```python
def test_missing_file_id(self):
    """Test that ValueError is raised when file_id is missing"""
    with pytest.raises(ValueError, match="file_id is required"):
        CSVExtractor({}, db_session)
```

## CI/CD Integration

Tests are automatically run on:
- Pull request creation/updates
- Push to main branch
- Scheduled nightly builds (planned)

**GitHub Actions workflow:** `.github/workflows/backend-tests.yml` (📅 To be created)

## Best Practices

1. **Test Isolation**: Each test should be independent and not rely on other tests
2. **Clear Naming**: Test names should describe what is being tested
3. **Single Responsibility**: Each test should verify one specific behavior
4. **Fast Execution**: Keep unit tests fast (<100ms per test)
5. **Use Fixtures**: Reuse common setup code with pytest fixtures
6. **Clean Up**: Always clean up test artifacts (temp files, database records)
7. **Mock External Dependencies**: Use mocks for external APIs, services, etc.

## Troubleshooting

### Tests Fail with "No module named X"

Install missing dependencies:
```bash
uv sync --all-extras
```

### Database Connection Errors

Ensure PostgreSQL is running:
```bash
docker-compose up postgres
```

### File Permission Errors

Tests create temporary files. Ensure the test directory has write permissions.

### Tests Pass Locally but Fail in CI

- Check Python version compatibility
- Verify all dependencies are in `pyproject.toml`
- Check for environment-specific code paths

## Additional Resources

- [pytest documentation](https://docs.pytest.org/)
- [pytest-asyncio](https://pytest-asyncio.readthedocs.io/)
- [Coverage.py](https://coverage.readthedocs.io/)
- [Testing Best Practices](https://docs.python-guide.org/writing/tests/)
