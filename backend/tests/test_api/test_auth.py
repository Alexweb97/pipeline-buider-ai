"""
Authentication API Tests
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
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test.db"
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
        role="viewer",
        is_active=True,
        email_verified=False,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    yield user
    db.close()


class TestRegister:
    """Test user registration"""

    def test_register_success(self, test_db):
        """Test successful user registration"""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "newuser@example.com",
                "username": "newuser",
                "password": "NewUser123",
                "full_name": "New User",
                "role": "viewer",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "newuser@example.com"
        assert data["username"] == "newuser"
        assert "password" not in data
        assert "password_hash" not in data

    def test_register_duplicate_email(self, test_user):
        """Test registration with duplicate email"""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "test@example.com",  # Same as test_user
                "username": "different",
                "password": "Test123456",
                "role": "viewer",
            },
        )
        assert response.status_code == 400
        assert "Email already registered" in response.json()["detail"]

    def test_register_duplicate_username(self, test_user):
        """Test registration with duplicate username"""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "different@example.com",
                "username": "testuser",  # Same as test_user
                "password": "Test123456",
                "role": "viewer",
            },
        )
        assert response.status_code == 400
        assert "Username already taken" in response.json()["detail"]

    def test_register_invalid_email(self, test_db):
        """Test registration with invalid email"""
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "invalid-email",
                "username": "newuser",
                "password": "Test123456",
                "role": "viewer",
            },
        )
        assert response.status_code == 422  # Validation error


class TestLogin:
    """Test user login"""

    def test_login_success(self, test_user):
        """Test successful login"""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "username": "testuser",
                "password": "Test123456",
            },
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert data["token_type"] == "bearer"

    def test_login_with_email(self, test_user):
        """Test login with email"""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "username": "test@example.com",  # Using email
                "password": "Test123456",
            },
        )
        assert response.status_code == 200

    def test_login_wrong_password(self, test_user):
        """Test login with wrong password"""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "username": "testuser",
                "password": "wrongpassword",
            },
        )
        assert response.status_code == 401
        assert "Incorrect username or password" in response.json()["detail"]

    def test_login_nonexistent_user(self, test_db):
        """Test login with nonexistent user"""
        response = client.post(
            "/api/v1/auth/login",
            json={
                "username": "nonexistent",
                "password": "Test123456",
            },
        )
        assert response.status_code == 401


class TestRefreshToken:
    """Test token refresh"""

    def test_refresh_token_success(self, test_user):
        """Test successful token refresh"""
        # First login to get tokens
        login_response = client.post(
            "/api/v1/auth/login",
            json={
                "username": "testuser",
                "password": "Test123456",
            },
        )
        refresh_token = login_response.json()["refresh_token"]

        # Refresh token
        response = client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": refresh_token},
        )
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data

    def test_refresh_token_invalid(self, test_db):
        """Test refresh with invalid token"""
        response = client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": "invalid_token"},
        )
        assert response.status_code == 401


class TestGetCurrentUser:
    """Test get current user endpoint"""

    def test_get_current_user_success(self, test_user):
        """Test get current user with valid token"""
        # Login to get token
        login_response = client.post(
            "/api/v1/auth/login",
            json={
                "username": "testuser",
                "password": "Test123456",
            },
        )
        access_token = login_response.json()["access_token"]

        # Get current user
        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "test@example.com"
        assert data["username"] == "testuser"

    def test_get_current_user_no_token(self, test_db):
        """Test get current user without token"""
        response = client.get("/api/v1/auth/me")
        assert response.status_code == 403  # Forbidden

    def test_get_current_user_invalid_token(self, test_db):
        """Test get current user with invalid token"""
        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "Bearer invalid_token"},
        )
        assert response.status_code == 401


class TestLogout:
    """Test logout endpoint"""

    def test_logout_success(self, test_user):
        """Test successful logout"""
        # Login to get token
        login_response = client.post(
            "/api/v1/auth/login",
            json={
                "username": "testuser",
                "password": "Test123456",
            },
        )
        access_token = login_response.json()["access_token"]

        # Logout
        response = client.post(
            "/api/v1/auth/logout",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        assert response.status_code == 200
        assert "Successfully logged out" in response.json()["message"]


class TestRBAC:
    """Test Role-Based Access Control"""

    @pytest.fixture
    def admin_user(self, test_db):
        """Create an admin user"""
        db = TestingSessionLocal()
        user = User(
            email="admin@example.com",
            username="adminuser",
            password_hash=hash_password("Admin123456"),
            role="admin",
            is_active=True,
            email_verified=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        yield user
        db.close()

    @pytest.fixture
    def developer_user(self, test_db):
        """Create a developer user"""
        db = TestingSessionLocal()
        user = User(
            email="developer@example.com",
            username="devuser",
            password_hash=hash_password("Dev123456"),
            role="developer",
            is_active=True,
            email_verified=True,
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        yield user
        db.close()

    def test_admin_user_is_admin(self, admin_user):
        """Test that admin user has admin property"""
        assert admin_user.is_admin is True

    def test_admin_user_is_developer(self, admin_user):
        """Test that admin user has developer property"""
        assert admin_user.is_developer is True

    def test_developer_user_is_developer(self, developer_user):
        """Test that developer user has developer property"""
        assert developer_user.is_developer is True

    def test_developer_user_is_not_admin(self, developer_user):
        """Test that developer user is not admin"""
        assert developer_user.is_admin is False

    def test_viewer_user_is_not_admin(self, test_user):
        """Test that viewer user is not admin"""
        assert test_user.is_admin is False

    def test_viewer_user_is_not_developer(self, test_user):
        """Test that viewer user is not developer"""
        assert test_user.is_developer is False
