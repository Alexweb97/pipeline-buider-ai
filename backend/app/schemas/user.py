"""
User Pydantic Schemas
"""
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr, Field


# Base schema with common fields
class UserBase(BaseModel):
    """Base user schema"""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=100)
    full_name: str | None = Field(None, max_length=255)
    role: str = Field(default="viewer", pattern="^(admin|developer|viewer)$")


# Schema for creating a user
class UserCreate(UserBase):
    """Schema for creating a user"""
    password: str = Field(..., min_length=8, max_length=100)


# Schema for updating a user
class UserUpdate(BaseModel):
    """Schema for updating a user"""
    email: EmailStr | None = None
    username: str | None = Field(None, min_length=3, max_length=100)
    full_name: str | None = Field(None, max_length=255)
    role: str | None = Field(None, pattern="^(admin|developer|viewer)$")
    password: str | None = Field(None, min_length=8, max_length=100)
    is_active: bool | None = None


# Schema for user response (from database)
class UserResponse(UserBase):
    """Schema for user response"""
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    is_active: bool
    email_verified: bool
    last_login_at: datetime | None = None
    created_at: datetime
    updated_at: datetime


# Schema for login
class UserLogin(BaseModel):
    """Schema for user login"""
    username: str
    password: str


# Schema for token response
class TokenResponse(BaseModel):
    """Schema for authentication token response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds


# Schema for token refresh
class TokenRefresh(BaseModel):
    """Schema for token refresh"""
    refresh_token: str
