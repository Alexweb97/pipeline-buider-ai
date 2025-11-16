"""
Unit Tests for Data Extractors
"""
import tempfile
from pathlib import Path

import pandas as pd
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.file_resolver import resolve_file_path
from app.db.base import Base
from app.db.models.uploaded_file import UploadedFile
from app.modules.extractors.csv import CSVExtractor
from app.modules.extractors.excel import ExcelExtractor
from app.modules.extractors.json import JSONExtractor
from app.modules.extractors.parquet import ParquetExtractor

# Test database setup
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test_extractors.db"
engine = create_engine(SQLALCHEMY_TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def test_db():
    """Create test database"""
    Base.metadata.create_all(bind=engine)
    yield TestingSessionLocal()
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def sample_csv_file(test_db):
    """Create a sample CSV file"""
    with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
        f.write("id,name,price,quantity\n")
        f.write("1,Product A,100,5\n")
        f.write("2,Product B,200,3\n")
        f.write("3,Product C,150,7\n")
        temp_path = f.name

    # Register in database
    uploaded_file = UploadedFile(
        filename="test.csv",
        file_path=temp_path,
        file_size=Path(temp_path).stat().st_size,
        content_type="text/csv",
        user_id="test-user-id",
    )
    test_db.add(uploaded_file)
    test_db.commit()
    test_db.refresh(uploaded_file)

    yield uploaded_file

    # Cleanup
    Path(temp_path).unlink(missing_ok=True)


@pytest.fixture
def sample_excel_file(test_db):
    """Create a sample Excel file"""
    with tempfile.NamedTemporaryFile(suffix='.xlsx', delete=False) as f:
        temp_path = f.name

    # Create Excel file
    df = pd.DataFrame({
        'id': [1, 2, 3],
        'name': ['Product A', 'Product B', 'Product C'],
        'price': [100, 200, 150],
        'quantity': [5, 3, 7],
    })
    df.to_excel(temp_path, index=False, sheet_name='Sheet1')

    # Register in database
    uploaded_file = UploadedFile(
        filename="test.xlsx",
        file_path=temp_path,
        file_size=Path(temp_path).stat().st_size,
        content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        user_id="test-user-id",
    )
    test_db.add(uploaded_file)
    test_db.commit()
    test_db.refresh(uploaded_file)

    yield uploaded_file

    # Cleanup
    Path(temp_path).unlink(missing_ok=True)


@pytest.fixture
def sample_json_file(test_db):
    """Create a sample JSON file"""
    with tempfile.NamedTemporaryFile(mode='w', suffix='.json', delete=False) as f:
        f.write('[')
        f.write('{"id": 1, "name": "Product A", "price": 100, "quantity": 5},')
        f.write('{"id": 2, "name": "Product B", "price": 200, "quantity": 3},')
        f.write('{"id": 3, "name": "Product C", "price": 150, "quantity": 7}')
        f.write(']')
        temp_path = f.name

    # Register in database
    uploaded_file = UploadedFile(
        filename="test.json",
        file_path=temp_path,
        file_size=Path(temp_path).stat().st_size,
        content_type="application/json",
        user_id="test-user-id",
    )
    test_db.add(uploaded_file)
    test_db.commit()
    test_db.refresh(uploaded_file)

    yield uploaded_file

    # Cleanup
    Path(temp_path).unlink(missing_ok=True)


@pytest.fixture
def sample_parquet_file(test_db):
    """Create a sample Parquet file"""
    with tempfile.NamedTemporaryFile(suffix='.parquet', delete=False) as f:
        temp_path = f.name

    # Create Parquet file
    df = pd.DataFrame({
        'id': [1, 2, 3],
        'name': ['Product A', 'Product B', 'Product C'],
        'price': [100, 200, 150],
        'quantity': [5, 3, 7],
    })
    df.to_parquet(temp_path, index=False)

    # Register in database
    uploaded_file = UploadedFile(
        filename="test.parquet",
        file_path=temp_path,
        file_size=Path(temp_path).stat().st_size,
        content_type="application/octet-stream",
        user_id="test-user-id",
    )
    test_db.add(uploaded_file)
    test_db.commit()
    test_db.refresh(uploaded_file)

    yield uploaded_file

    # Cleanup
    Path(temp_path).unlink(missing_ok=True)


class TestCSVExtractor:
    """Test CSV Extractor"""

    def test_csv_basic_extraction(self, sample_csv_file, test_db):
        """Test basic CSV extraction"""
        config = {'file_id': str(sample_csv_file.id)}
        extractor = CSVExtractor(config, test_db)
        df = extractor.execute()

        assert isinstance(df, pd.DataFrame)
        assert len(df) == 3
        assert list(df.columns) == ['id', 'name', 'price', 'quantity']
        assert df['name'].tolist() == ['Product A', 'Product B', 'Product C']

    def test_csv_with_custom_delimiter(self, test_db):
        """Test CSV extraction with custom delimiter"""
        # Create semicolon-separated file
        with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
            f.write("id;name;value\n")
            f.write("1;Item A;100\n")
            f.write("2;Item B;200\n")
            temp_path = f.name

        uploaded_file = UploadedFile(
            filename="test_semicolon.csv",
            file_path=temp_path,
            file_size=Path(temp_path).stat().st_size,
            content_type="text/csv",
            user_id="test-user-id",
        )
        test_db.add(uploaded_file)
        test_db.commit()
        test_db.refresh(uploaded_file)

        config = {
            'file_id': str(uploaded_file.id),
            'delimiter': ';',
        }
        extractor = CSVExtractor(config, test_db)
        df = extractor.execute()

        assert len(df) == 2
        assert list(df.columns) == ['id', 'name', 'value']

        # Cleanup
        Path(temp_path).unlink(missing_ok=True)

    def test_csv_skip_rows(self, test_db):
        """Test CSV extraction with skip_rows"""
        # Create file with header rows
        with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
            f.write("# Comment line 1\n")
            f.write("# Comment line 2\n")
            f.write("id,name,value\n")
            f.write("1,Item A,100\n")
            temp_path = f.name

        uploaded_file = UploadedFile(
            filename="test_skip.csv",
            file_path=temp_path,
            file_size=Path(temp_path).stat().st_size,
            content_type="text/csv",
            user_id="test-user-id",
        )
        test_db.add(uploaded_file)
        test_db.commit()
        test_db.refresh(uploaded_file)

        config = {
            'file_id': str(uploaded_file.id),
            'skip_rows': 2,
        }
        extractor = CSVExtractor(config, test_db)
        df = extractor.execute()

        assert len(df) == 1
        assert df.iloc[0]['name'] == 'Item A'

        # Cleanup
        Path(temp_path).unlink(missing_ok=True)

    def test_csv_no_header(self, test_db):
        """Test CSV extraction without header"""
        with tempfile.NamedTemporaryFile(mode='w', suffix='.csv', delete=False) as f:
            f.write("1,Item A,100\n")
            f.write("2,Item B,200\n")
            temp_path = f.name

        uploaded_file = UploadedFile(
            filename="test_noheader.csv",
            file_path=temp_path,
            file_size=Path(temp_path).stat().st_size,
            content_type="text/csv",
            user_id="test-user-id",
        )
        test_db.add(uploaded_file)
        test_db.commit()
        test_db.refresh(uploaded_file)

        config = {
            'file_id': str(uploaded_file.id),
            'has_header': False,
        }
        extractor = CSVExtractor(config, test_db)
        df = extractor.execute()

        assert len(df) == 2
        assert list(df.columns) == ['column_0', 'column_1', 'column_2']

        # Cleanup
        Path(temp_path).unlink(missing_ok=True)

    def test_csv_missing_file_id(self, test_db):
        """Test CSV extraction without file_id"""
        with pytest.raises(ValueError, match="file_id is required"):
            CSVExtractor({}, test_db)

    def test_csv_nonexistent_file(self, test_db):
        """Test CSV extraction with nonexistent file"""
        config = {'file_id': '00000000-0000-0000-0000-000000000000'}
        extractor = CSVExtractor(config, test_db)

        with pytest.raises(FileNotFoundError):
            extractor.execute()


class TestExcelExtractor:
    """Test Excel Extractor"""

    def test_excel_basic_extraction(self, sample_excel_file, test_db):
        """Test basic Excel extraction"""
        config = {'file_id': str(sample_excel_file.id)}
        extractor = ExcelExtractor(config, test_db)
        df = extractor.execute()

        assert isinstance(df, pd.DataFrame)
        assert len(df) == 3
        assert 'name' in df.columns
        assert df['name'].tolist() == ['Product A', 'Product B', 'Product C']

    def test_excel_sheet_selection_by_index(self, test_db):
        """Test Excel extraction with sheet index"""
        with tempfile.NamedTemporaryFile(suffix='.xlsx', delete=False) as f:
            temp_path = f.name

        # Create multi-sheet Excel file
        with pd.ExcelWriter(temp_path, engine='openpyxl') as writer:
            pd.DataFrame({'col1': [1, 2]}).to_excel(writer, sheet_name='Sheet1', index=False)
            pd.DataFrame({'col2': [3, 4]}).to_excel(writer, sheet_name='Sheet2', index=False)

        uploaded_file = UploadedFile(
            filename="test_multisheet.xlsx",
            file_path=temp_path,
            file_size=Path(temp_path).stat().st_size,
            content_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            user_id="test-user-id",
        )
        test_db.add(uploaded_file)
        test_db.commit()
        test_db.refresh(uploaded_file)

        config = {
            'file_id': str(uploaded_file.id),
            'sheet_name': '1',  # Second sheet (0-indexed)
        }
        extractor = ExcelExtractor(config, test_db)
        df = extractor.execute()

        assert 'col2' in df.columns
        assert df['col2'].tolist() == [3, 4]

        # Cleanup
        Path(temp_path).unlink(missing_ok=True)


class TestJSONExtractor:
    """Test JSON Extractor"""

    def test_json_basic_extraction(self, sample_json_file, test_db):
        """Test basic JSON extraction"""
        config = {'file_id': str(sample_json_file.id)}
        extractor = JSONExtractor(config, test_db)
        df = extractor.execute()

        assert isinstance(df, pd.DataFrame)
        assert len(df) == 3
        assert df['name'].tolist() == ['Product A', 'Product B', 'Product C']


class TestParquetExtractor:
    """Test Parquet Extractor"""

    def test_parquet_basic_extraction(self, sample_parquet_file, test_db):
        """Test basic Parquet extraction"""
        config = {'file_id': str(sample_parquet_file.id)}
        extractor = ParquetExtractor(config, test_db)
        df = extractor.execute()

        assert isinstance(df, pd.DataFrame)
        assert len(df) == 3
        assert df['name'].tolist() == ['Product A', 'Product B', 'Product C']

    def test_parquet_column_selection(self, sample_parquet_file, test_db):
        """Test Parquet extraction with column selection"""
        config = {
            'file_id': str(sample_parquet_file.id),
            'columns': ['id', 'name'],
        }
        extractor = ParquetExtractor(config, test_db)
        df = extractor.execute()

        assert len(df.columns) == 2
        assert list(df.columns) == ['id', 'name']


class TestFileResolver:
    """Test File Resolver"""

    def test_resolve_valid_file(self, sample_csv_file, test_db):
        """Test resolving valid file_id"""
        file_path = resolve_file_path(sample_csv_file.id, test_db)
        assert file_path.exists()
        assert str(file_path) == sample_csv_file.file_path

    def test_resolve_nonexistent_file(self, test_db):
        """Test resolving nonexistent file_id"""
        from uuid import uuid4
        with pytest.raises(FileNotFoundError, match="not found or deleted"):
            resolve_file_path(uuid4(), test_db)

    def test_resolve_deleted_file(self, sample_csv_file, test_db):
        """Test resolving soft-deleted file"""
        sample_csv_file.is_deleted = True
        test_db.commit()

        with pytest.raises(FileNotFoundError, match="not found or deleted"):
            resolve_file_path(sample_csv_file.id, test_db)
