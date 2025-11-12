# Authentication & Authorization System

## Overview

This document describes the complete authentication and authorization system implemented for the ETL/ELT Builder application.

## Features Implemented

### ✅ Password Security
- **Bcrypt hashing** for secure password storage
- Password strength validation (min 8 chars, uppercase, lowercase, digits)
- Secure password comparison

### ✅ JWT Token Management
- **Access tokens** (30 min expiration by default)
- **Refresh tokens** (7 days expiration by default)
- Token type verification (access vs refresh)
- Stateless authentication

### ✅ Authentication Endpoints

#### POST `/api/v1/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "SecurePass123",
  "full_name": "Full Name",
  "role": "viewer"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "username",
  "full_name": "Full Name",
  "role": "viewer",
  "is_active": true,
  "email_verified": false,
  "created_at": "2025-01-01T00:00:00Z",
  "last_login_at": null
}
```

#### POST `/api/v1/auth/login`
Login and receive JWT tokens.

**Request Body:**
```json
{
  "username": "username",
  "password": "SecurePass123"
}
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 1800
}
```

#### POST `/api/v1/auth/refresh`
Refresh access token using refresh token.

**Request Body:**
```json
{
  "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** `200 OK`
```json
{
  "access_token": "new_access_token",
  "refresh_token": "new_refresh_token",
  "token_type": "bearer",
  "expires_in": 1800
}
```

#### POST `/api/v1/auth/logout`
Logout current user (client-side token removal).

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "message": "Successfully logged out"
}
```

#### GET `/api/v1/auth/me`
Get current authenticated user information.

**Headers:**
```
Authorization: Bearer <access_token>
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "username",
  "full_name": "Full Name",
  "role": "viewer",
  "is_active": true,
  "email_verified": false,
  "created_at": "2025-01-01T00:00:00Z",
  "last_login_at": "2025-01-01T12:00:00Z"
}
```

## Role-Based Access Control (RBAC)

### User Roles

1. **Viewer** (read-only)
   - Can view pipelines, connections, executions
   - Cannot create or modify resources

2. **Developer**
   - All viewer permissions
   - Can create and modify pipelines
   - Can create and modify connections
   - Can execute pipelines

3. **Admin**
   - All developer permissions
   - Can manage users
   - Can manage system settings
   - Full access to all resources

### RBAC Implementation

Use dependency injection to protect endpoints:

```python
from typing import Annotated
from fastapi import Depends
from app.api.dependencies.auth import (
    get_current_active_user,
    require_admin,
    require_developer,
)
from app.db.models.user import User

# Require authenticated user
@router.get("/resource")
def get_resource(
    current_user: Annotated[User, Depends(get_current_active_user)]
):
    # Any authenticated user can access
    pass

# Require developer role
@router.post("/pipeline")
def create_pipeline(
    current_user: Annotated[User, Depends(require_developer)]
):
    # Only developers and admins can access
    pass

# Require admin role
@router.delete("/user/{user_id}")
def delete_user(
    current_user: Annotated[User, Depends(require_admin)]
):
    # Only admins can access
    pass
```

### User Model Properties

The User model includes helper properties for role checking:

```python
user.is_admin  # True if role == "admin"
user.is_developer  # True if role in ("admin", "developer")
```

## Security Configuration

Configure authentication settings in `.env`:

```env
# Security
SECRET_KEY=your-secret-key-min-32-chars-long
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7

# Encryption
ENCRYPTION_KEY=your-encryption-key-32-bytes-long
```

## Files Created

### Core Security
- `app/core/security.py` - Password hashing and JWT token functions
- `app/core/config.py` - Application configuration

### API Endpoints
- `app/api/v1/auth.py` - Authentication endpoints

### Dependencies
- `app/api/dependencies/auth.py` - Authentication & RBAC dependencies
- `app/api/dependencies/database.py` - Database session dependency

### Database
- `app/db/session.py` - Updated with sync & async sessions
- `app/db/models/user.py` - User model with RBAC properties

### Schemas
- `app/schemas/user.py` - User Pydantic schemas (existing)

### Tests
- `tests/test_api/test_auth.py` - Complete authentication test suite

## Testing

Run the authentication tests:

```bash
cd backend
pytest tests/test_api/test_auth.py -v
```

## Usage Example

### Client-side Authentication Flow

```typescript
// 1. Login
const loginResponse = await fetch('/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'user@example.com',
    password: 'SecurePass123'
  })
});

const { access_token, refresh_token } = await loginResponse.json();

// Store tokens (e.g., in localStorage or httpOnly cookies)
localStorage.setItem('access_token', access_token);
localStorage.setItem('refresh_token', refresh_token);

// 2. Make authenticated requests
const response = await fetch('/api/v1/pipelines', {
  headers: {
    'Authorization': `Bearer ${access_token}`
  }
});

// 3. Refresh token when access token expires
const refreshResponse = await fetch('/api/v1/auth/refresh', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    refresh_token: localStorage.getItem('refresh_token')
  })
});

const { access_token: newToken } = await refreshResponse.json();
localStorage.setItem('access_token', newToken);

// 4. Logout
await fetch('/api/v1/auth/logout', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${access_token}`
  }
});

localStorage.removeItem('access_token');
localStorage.removeItem('refresh_token');
```

## Security Best Practices

1. **Never store passwords in plain text**
   - All passwords are hashed with bcrypt

2. **Use HTTPS in production**
   - Protect tokens in transit

3. **Set secure token expiration**
   - Access tokens: short-lived (30 min)
   - Refresh tokens: longer-lived (7 days)

4. **Implement token blacklisting (future)**
   - For logout and token revocation

5. **Validate password strength**
   - Minimum 8 characters
   - At least one uppercase, lowercase, and digit

6. **Protect sensitive endpoints**
   - Use RBAC dependencies

7. **Rate limiting (future)**
   - Prevent brute force attacks

## Next Steps

Future enhancements:

- [ ] Token blacklisting for logout
- [ ] Email verification workflow
- [ ] Password reset functionality
- [ ] Two-factor authentication (2FA)
- [ ] OAuth2 social login (Google, GitHub)
- [ ] Rate limiting on auth endpoints
- [ ] Audit logging for authentication events
- [ ] Session management
- [ ] IP-based restrictions
