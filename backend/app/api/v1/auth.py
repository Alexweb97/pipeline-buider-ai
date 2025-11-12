"""
Authentication API Routes
"""
from datetime import datetime
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.security import HTTPAuthorizationCredentials
from jose import JWTError
from sqlalchemy.orm import Session

from app.api.dependencies.auth import get_current_active_user, security
from app.api.dependencies.database import get_db
from app.core.audit_logger import log_auth_event, log_security_event
from app.core.config import settings
from app.core.rate_limit import RATE_LIMITS, limiter
from app.core.security import (
    create_access_token,
    create_refresh_token,
    decode_token,
    hash_password,
    verify_password,
    verify_token_type,
)
from app.core.token_blacklist import blacklist_token
from app.db.models.user import User
from app.schemas.user import (
    TokenRefresh,
    TokenResponse,
    UserCreate,
    UserLogin,
    UserResponse,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit(RATE_LIMITS["auth_register"])
def register(
    request: Request,
    user_data: UserCreate,
    db: Annotated[Session, Depends(get_db)],
):
    """
    Register a new user

    Args:
        request: FastAPI request object (for rate limiting)
        user_data: User registration data
        db: Database session

    Returns:
        UserResponse: Created user data

    Raises:
        HTTPException: If account information is already in use
    """
    # Check if email or username already exists
    # Use generic error message to prevent user enumeration
    existing = db.query(User).filter(
        (User.email == user_data.email) | (User.username == user_data.username)
    ).first()

    if existing:
        # Log the registration attempt
        log_security_event(
            event_type="registration_duplicate",
            user_id=None,
            ip_address=request.client.host if request.client else "unknown",
            details={"attempted_email": user_data.email, "attempted_username": user_data.username},
        )

        # Generic error message to prevent user enumeration
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This account information is already in use",
        )

    # Create new user
    hashed_password = hash_password(user_data.password)
    db_user = User(
        email=user_data.email,
        username=user_data.username,
        password_hash=hashed_password,
        full_name=user_data.full_name,
        role=user_data.role,
        is_active=True,
        email_verified=False,
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    # Log successful registration
    log_auth_event(
        event_type="registration",
        user_id=str(db_user.id),
        ip_address=request.client.host if request.client else "unknown",
        success=True,
        details={"username": db_user.username, "role": db_user.role},
    )

    return db_user


@router.post("/login", response_model=TokenResponse)
@limiter.limit(RATE_LIMITS["auth_login"])
def login(
    request: Request,
    credentials: UserLogin,
    db: Annotated[Session, Depends(get_db)],
):
    """
    Login user and return JWT tokens

    Args:
        request: FastAPI request object (for rate limiting)
        credentials: User login credentials (username/password)
        db: Database session

    Returns:
        TokenResponse: Access and refresh tokens

    Raises:
        HTTPException: If credentials are invalid or account is locked
    """
    # Find user by username or email
    user = db.query(User).filter(
        (User.username == credentials.username) | (User.email == credentials.username)
    ).first()

    # Timing attack prevention: Always verify password even if user doesn't exist
    if not user:
        # Hash a dummy password to maintain constant timing
        verify_password(credentials.password, hash_password("dummy_password_for_timing"))

        # Log failed login attempt
        log_auth_event(
            event_type="login",
            user_id=None,
            ip_address=request.client.host if request.client else "unknown",
            success=False,
            details={"username": credentials.username, "reason": "user_not_found"},
        )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check if account is locked
    if user.is_locked:
        log_security_event(
            event_type="login_locked_account",
            user_id=str(user.id),
            ip_address=request.client.host if request.client else "unknown",
            details={"username": credentials.username, "locked_until": user.locked_until.isoformat()},
        )

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account temporarily locked due to multiple failed login attempts. Please try again later.",
        )

    # Verify password
    if not verify_password(credentials.password, user.password_hash):
        # Increment failed login attempts
        user.increment_failed_attempts()
        db.commit()

        # Log failed login attempt
        log_auth_event(
            event_type="login",
            user_id=str(user.id),
            ip_address=request.client.host if request.client else "unknown",
            success=False,
            details={
                "username": credentials.username,
                "reason": "invalid_password",
                "failed_attempts": user.failed_login_attempts,
            },
        )

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Check if user is active
    if not user.is_active:
        log_security_event(
            event_type="login_inactive_account",
            user_id=str(user.id),
            ip_address=request.client.host if request.client else "unknown",
            details={"username": credentials.username},
        )

        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account is inactive",
        )

    # Successful login - reset failed attempts
    user.reset_login_attempts()

    # Update last login timestamp
    user.last_login_at = datetime.utcnow()
    db.commit()

    # Create tokens with minimal data (only user ID)
    token_data = {
        "sub": str(user.id),
    }
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token({"sub": str(user.id)})

    # Log successful login
    log_auth_event(
        event_type="login",
        user_id=str(user.id),
        ip_address=request.client.host if request.client else "unknown",
        success=True,
        details={"username": user.username, "role": user.role},
    )

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/refresh", response_model=TokenResponse)
@limiter.limit(RATE_LIMITS["auth_refresh"])
def refresh_token(
    request: Request,
    token_data: TokenRefresh,
    db: Annotated[Session, Depends(get_db)],
):
    """
    Refresh access token using refresh token

    Args:
        request: FastAPI request object (for rate limiting)
        token_data: Refresh token data
        db: Database session

    Returns:
        TokenResponse: New access and refresh tokens

    Raises:
        HTTPException: If refresh token is invalid
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        # Decode refresh token
        payload = decode_token(token_data.refresh_token)

        # Verify token type
        if not verify_token_type(payload, "refresh"):
            raise credentials_exception

        # Get user ID from token
        user_id: str | None = payload.get("sub")
        if user_id is None:
            raise credentials_exception

    except JWTError:
        log_security_event(
            event_type="invalid_refresh_token",
            user_id=None,
            ip_address=request.client.host if request.client else "unknown",
            details={"error": "JWT decode failed"},
        )
        raise credentials_exception

    # Get user from database
    user = db.query(User).filter(User.id == user_id).first()
    if user is None or not user.is_active:
        log_security_event(
            event_type="invalid_refresh_token",
            user_id=user_id,
            ip_address=request.client.host if request.client else "unknown",
            details={"reason": "user_not_found_or_inactive"},
        )
        raise credentials_exception

    # Create new tokens with minimal data
    token_data_dict = {
        "sub": str(user.id),
    }
    new_access_token = create_access_token(token_data_dict)
    new_refresh_token = create_refresh_token({"sub": str(user.id)})

    # Log token refresh
    log_auth_event(
        event_type="token_refresh",
        user_id=str(user.id),
        ip_address=request.client.host if request.client else "unknown",
        success=True,
        details={"username": user.username},
    )

    return TokenResponse(
        access_token=new_access_token,
        refresh_token=new_refresh_token,
        token_type="bearer",
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )


@router.post("/logout")
def logout(
    request: Request,
    current_user: Annotated[User, Depends(get_current_active_user)],
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(security)],
):
    """
    Logout current user and blacklist the token

    Args:
        request: FastAPI request object
        current_user: Current authenticated user
        credentials: HTTP Bearer credentials containing JWT token

    Returns:
        dict: Success message
    """
    # Get the token from credentials
    token = credentials.credentials

    # Blacklist the access token
    blacklist_token(token, settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60)

    # Log logout event
    log_auth_event(
        event_type="logout",
        user_id=str(current_user.id),
        ip_address=request.client.host if request.client else "unknown",
        success=True,
        details={"username": current_user.username},
    )

    return {"message": "Successfully logged out"}


@router.get("/me", response_model=UserResponse)
def get_current_user_info(
    current_user: Annotated[User, Depends(get_current_active_user)],
):
    """
    Get current user information

    Args:
        current_user: Current authenticated user

    Returns:
        UserResponse: Current user data
    """
    return current_user
