"""
Authentication Schemas
"""
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, field_validator


class UserLogin(BaseModel):
    """User login request schema"""

    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=8, description="User password")


class UserRegister(BaseModel):
    """User registration request schema"""

    email: EmailStr = Field(..., description="User email address")
    username: str = Field(..., min_length=3, max_length=50, description="Username")
    password: str = Field(..., min_length=8, max_length=100, description="Password")
    full_name: str | None = Field(None, max_length=255, description="Full name")

    @field_validator("username")
    @classmethod
    def validate_username(cls, v: str) -> str:
        """Validate username format"""
        if not v.isalnum() and "_" not in v:
            raise ValueError("Username must be alphanumeric or contain underscores")
        return v.lower()

    @field_validator("password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        """Validate password strength"""
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.islower() for c in v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        return v


class Token(BaseModel):
    """Token response schema"""

    access_token: str = Field(..., description="JWT access token")
    refresh_token: str = Field(..., description="JWT refresh token")
    token_type: str = Field(default="bearer", description="Token type")


class TokenPayload(BaseModel):
    """Token payload schema"""

    sub: str | None = Field(None, description="Subject (user_id)")
    exp: int | None = Field(None, description="Expiration timestamp")
    type: str | None = Field(None, description="Token type (access/refresh)")


class RefreshTokenRequest(BaseModel):
    """Refresh token request schema"""

    refresh_token: str = Field(..., description="JWT refresh token")


class UserResponse(BaseModel):
    """User response schema"""

    id: UUID = Field(..., description="User ID")
    email: EmailStr = Field(..., description="User email")
    username: str = Field(..., description="Username")
    full_name: str | None = Field(None, description="Full name")
    role: str = Field(..., description="User role")
    is_active: bool = Field(..., description="Is user active")
    email_verified: bool = Field(..., description="Is email verified")
    created_at: datetime = Field(..., description="Account creation timestamp")
    last_login_at: datetime | None = Field(None, description="Last login timestamp")

    model_config = {"from_attributes": True}


class ChangePasswordRequest(BaseModel):
    """Change password request schema"""

    current_password: str = Field(..., description="Current password")
    new_password: str = Field(..., min_length=8, description="New password")

    @field_validator("new_password")
    @classmethod
    def validate_password(cls, v: str) -> str:
        """Validate password strength"""
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        if not any(c.isupper() for c in v):
            raise ValueError("Password must contain at least one uppercase letter")
        if not any(c.islower() for c in v):
            raise ValueError("Password must contain at least one lowercase letter")
        if not any(c.isdigit() for c in v):
            raise ValueError("Password must contain at least one digit")
        return v
