"""
API Tests for Transformation Endpoints
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.api.dependencies.database import get_db
from app.core.security import hash_password
from app.db.base import Base
from app.db.models.user import User
from app.main import app

# Test database setup
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test_transforms.db"
engine = create_engine(SQLALCHEMY_TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override database dependency for testing"""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


# Override dependency
app.dependency_overrides[get_db] = override_get_db

# Create test client
client = TestClient(app)


@pytest.fixture(scope="function")
def test_db():
    """Create test database"""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture
def test_user(test_db):
    """Create a test user"""
    db = TestingSessionLocal()
    user = User(
        email="test@example.com",
        username="testuser",
        password_hash=hash_password("Test123456"),
        full_name="Test User",
        role="developer",
        is_active=True,
        email_verified=True,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    yield user
    db.close()


@pytest.fixture
def auth_token(test_user):
    """Get authentication token"""
    response = client.post(
        "/api/v1/auth/login",
        json={
            "username": "testuser",
            "password": "Test123456",
        },
    )
    return response.json()["access_token"]


class TestPreviewEndpoint:
    """Test /api/v1/transforms/preview endpoint"""

    def test_preview_python_transform(self, auth_token):
        """Test preview with Python code"""
        response = client.post(
            "/api/v1/transforms/preview",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "code": """
def transform(df: pd.DataFrame) -> pd.DataFrame:
    df['total'] = df['price'] * df['quantity']
    return df
""",
                "language": "python",
                "sample_data": [
                    {"id": 1, "name": "Product A", "price": 100, "quantity": 5},
                    {"id": 2, "name": "Product B", "price": 200, "quantity": 3},
                ],
            },
        )

        assert response.status_code == 200
        data = response.json()

        assert "input_shape" in data
        assert "output_shape" in data
        assert "schema" in data
        assert "preview_data" in data

        # Check that transformation was applied
        assert data["input_shape"] == [2, 4]  # 2 rows, 4 columns
        assert data["output_shape"] == [2, 5]  # 2 rows, 5 columns (added 'total')

        # Check schema includes new column
        schema_columns = [col["column"] for col in data["schema"]]
        assert "total" in schema_columns

        # Check preview data
        assert len(data["preview_data"]) == 2
        assert data["preview_data"][0]["total"] == 500  # 100 * 5
        assert data["preview_data"][1]["total"] == 600  # 200 * 3

    def test_preview_sql_transform(self, auth_token):
        """Test preview with SQL query"""
        response = client.post(
            "/api/v1/transforms/preview",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "code": """
SELECT
    id,
    name,
    price * quantity AS total
FROM input
WHERE price > 100
""",
                "language": "sql",
                "sample_data": [
                    {"id": 1, "name": "Product A", "price": 100, "quantity": 5},
                    {"id": 2, "name": "Product B", "price": 200, "quantity": 3},
                    {"id": 3, "name": "Product C", "price": 150, "quantity": 2},
                ],
            },
        )

        assert response.status_code == 200
        data = response.json()

        # Should filter to only products with price > 100
        assert data["output_shape"][0] == 2  # 2 rows (Product B and C)
        assert data["output_shape"][1] == 3  # 3 columns (id, name, total)

        # Check preview data
        preview_names = [row["name"] for row in data["preview_data"]]
        assert "Product A" not in preview_names
        assert "Product B" in preview_names
        assert "Product C" in preview_names

    def test_preview_with_aggregation(self, auth_token):
        """Test preview with aggregation"""
        response = client.post(
            "/api/v1/transforms/preview",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "code": """
SELECT
    department,
    AVG(salary) AS avg_salary,
    COUNT(*) AS employee_count
FROM input
GROUP BY department
""",
                "language": "sql",
                "sample_data": [
                    {"id": 1, "name": "Alice", "department": "IT", "salary": 50000},
                    {"id": 2, "name": "Bob", "department": "HR", "salary": 60000},
                    {"id": 3, "name": "Charlie", "department": "IT", "salary": 70000},
                ],
            },
        )

        assert response.status_code == 200
        data = response.json()

        assert data["output_shape"][0] == 2  # 2 departments
        assert "avg_salary" in [col["column"] for col in data["schema"]]

    def test_preview_invalid_python_code(self, auth_token):
        """Test preview with invalid Python code"""
        response = client.post(
            "/api/v1/transforms/preview",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "code": "this is not valid python",
                "language": "python",
                "sample_data": [{"col1": 1}],
            },
        )

        assert response.status_code == 400
        assert "error" in response.json()["detail"].lower()

    def test_preview_invalid_sql_query(self, auth_token):
        """Test preview with invalid SQL"""
        response = client.post(
            "/api/v1/transforms/preview",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "code": "SELECT * FROM nonexistent_table",
                "language": "sql",
                "sample_data": [{"col1": 1}],
            },
        )

        assert response.status_code == 400

    def test_preview_empty_sample_data(self, auth_token):
        """Test preview with empty sample data"""
        response = client.post(
            "/api/v1/transforms/preview",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "code": "SELECT * FROM input",
                "language": "sql",
                "sample_data": [],
            },
        )

        assert response.status_code == 400

    def test_preview_missing_code(self, auth_token):
        """Test preview without code"""
        response = client.post(
            "/api/v1/transforms/preview",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "language": "python",
                "sample_data": [{"col1": 1}],
            },
        )

        assert response.status_code == 422  # Validation error

    def test_preview_invalid_language(self, auth_token):
        """Test preview with invalid language"""
        response = client.post(
            "/api/v1/transforms/preview",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "code": "SELECT * FROM input",
                "language": "javascript",  # Not supported
                "sample_data": [{"col1": 1}],
            },
        )

        assert response.status_code == 422  # Validation error

    def test_preview_unauthorized(self):
        """Test preview without authentication"""
        response = client.post(
            "/api/v1/transforms/preview",
            json={
                "code": "SELECT * FROM input",
                "language": "sql",
                "sample_data": [{"col1": 1}],
            },
        )

        assert response.status_code == 403


class TestValidateEndpoint:
    """Test /api/v1/transforms/validate endpoint"""

    def test_validate_valid_python(self, auth_token):
        """Test validation with valid Python code"""
        response = client.post(
            "/api/v1/transforms/validate",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "code": """
def transform(df: pd.DataFrame) -> pd.DataFrame:
    df['new_col'] = df['old_col'] * 2
    return df
""",
                "language": "python",
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is True
        assert "error" not in data or data["error"] is None

    def test_validate_valid_sql(self, auth_token):
        """Test validation with valid SQL"""
        response = client.post(
            "/api/v1/transforms/validate",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "code": "SELECT * FROM input WHERE id > 10",
                "language": "sql",
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is True

    def test_validate_invalid_python_syntax(self, auth_token):
        """Test validation with invalid Python syntax"""
        response = client.post(
            "/api/v1/transforms/validate",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "code": "def transform(df:\n    invalid syntax here",
                "language": "python",
            },
        )

        assert response.status_code == 200
        data = response.json()
        assert data["valid"] is False
        assert "error" in data
        assert data["error"] is not None

    def test_validate_python_missing_function(self, auth_token):
        """Test validation with missing transform function"""
        response = client.post(
            "/api/v1/transforms/validate",
            headers={"Authorization": f"Bearer {auth_token}"},
            json={
                "code": """
def wrong_name(df: pd.DataFrame) -> pd.DataFrame:
    return df
""",
                "language": "python",
            },
        )

        assert response.status_code == 200
        data = response.json()
        # Syntax is valid, but function name is wrong
        # This might pass syntax validation but fail at runtime
        assert data["valid"] is True or (data["valid"] is False and "transform" in data.get("error", ""))

    def test_validate_unauthorized(self):
        """Test validation without authentication"""
        response = client.post(
            "/api/v1/transforms/validate",
            json={
                "code": "SELECT * FROM input",
                "language": "sql",
            },
        )

        assert response.status_code == 403


class TestTemplateEndpoint:
    """Test /api/v1/transforms/template endpoint"""

    def test_get_python_template(self, auth_token):
        """Test getting Python code template"""
        response = client.get(
            "/api/v1/transforms/template",
            params={"language": "python"},
            headers={"Authorization": f"Bearer {auth_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert "template" in data
        assert "def transform(df: pd.DataFrame)" in data["template"]
        assert "return df" in data["template"]

    def test_get_sql_template(self, auth_token):
        """Test getting SQL template"""
        response = client.get(
            "/api/v1/transforms/template",
            params={"language": "sql"},
            headers={"Authorization": f"Bearer {auth_token}"},
        )

        assert response.status_code == 200
        data = response.json()
        assert "template" in data
        assert "SELECT" in data["template"]
        assert "FROM input" in data["template"]

    def test_get_template_invalid_language(self, auth_token):
        """Test getting template with invalid language"""
        response = client.get(
            "/api/v1/transforms/template",
            params={"language": "ruby"},
            headers={"Authorization": f"Bearer {auth_token}"},
        )

        assert response.status_code == 422  # Validation error

    def test_get_template_unauthorized(self):
        """Test getting template without authentication"""
        response = client.get(
            "/api/v1/transforms/template",
            params={"language": "python"},
        )

        assert response.status_code == 403
