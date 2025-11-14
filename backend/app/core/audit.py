"""
Audit and Security Logging Utilities
"""
from datetime import datetime
from typing import Dict, Any
from uuid import UUID
import hashlib
import httpx

from fastapi import Request
from sqlalchemy.orm import Session

from app.db.models.auth_log import AuthLog
from app.db.models.active_session import ActiveSession
from app.db.models.audit_event import AuditEvent
from app.db.models.user import User


def get_client_ip(request: Request) -> str:
    """Extract client IP from request"""
    # Check X-Forwarded-For header (for proxies/load balancers)
    forwarded = request.headers.get("X-Forwarded-For")
    if forwarded:
        return forwarded.split(",")[0].strip()

    # Check X-Real-IP header
    real_ip = request.headers.get("X-Real-IP")
    if real_ip:
        return real_ip

    # Fall back to direct client
    if request.client:
        return request.client.host

    return "unknown"


def get_user_agent(request: Request) -> str:
    """Extract user agent from request"""
    return request.headers.get("User-Agent", "unknown")


def hash_token(token: str) -> str:
    """Hash token for storage (for session management)"""
    return hashlib.sha256(token.encode()).hexdigest()


def get_location_from_ip(ip_address: str | None) -> str:
    """
    Get location from IP address using ip-api.com

    Args:
        ip_address: Client IP address

    Returns:
        str: Location string in format "City, Country" or "Unknown"
    """
    if not ip_address or ip_address == "unknown":
        return "Unknown"

    # Skip private/local IPs
    if ip_address.startswith(("127.", "10.", "172.", "192.168.", "localhost")):
        return "Local Network"

    try:
        # Use ip-api.com free API (no key required, 45 requests/minute)
        with httpx.Client(timeout=2.0) as client:
            response = client.get(
                f"http://ip-api.com/json/{ip_address}",
                params={"fields": "status,country,city"}
            )

            if response.status_code == 200:
                data = response.json()

                if data.get("status") == "success":
                    city = data.get("city", "")
                    country = data.get("country", "")

                    if city and country:
                        return f"{city}, {country}"
                    elif country:
                        return country

        return "Unknown"
    except Exception as e:
        # Log error but don't fail - geolocation is not critical
        print(f"Geolocation error for {ip_address}: {e}")
        return "Unknown"


def log_auth_attempt(
    db: Session,
    username: str,
    email: str | None,
    status: str,
    user_id: UUID | None = None,
    ip_address: str | None = None,
    user_agent: str | None = None,
    failure_reason: str | None = None,
) -> AuthLog:
    """
    Log an authentication attempt

    Args:
        db: Database session
        username: Username attempting to log in
        email: User email
        status: 'success' or 'failed'
        user_id: User ID (if successful)
        ip_address: Client IP address
        user_agent: Client user agent
        failure_reason: Reason for failure (if failed)

    Returns:
        AuthLog: Created auth log entry
    """
    auth_log = AuthLog(
        user_id=user_id,
        username=username,
        email=email,
        timestamp=datetime.utcnow(),
        ip_address=ip_address,
        user_agent=user_agent,
        status=status,
        failure_reason=failure_reason,
    )
    db.add(auth_log)
    db.commit()
    db.refresh(auth_log)
    return auth_log


def create_session(
    db: Session,
    user_id: UUID,
    token: str,
    ip_address: str | None = None,
    user_agent: str | None = None,
    location: str | None = None,
) -> ActiveSession:
    """
    Create an active session for a user

    Args:
        db: Database session
        user_id: User ID
        token: Access token
        ip_address: Client IP address
        user_agent: Client user agent
        location: Geographic location (optional, will be derived from IP if not provided)

    Returns:
        ActiveSession: Created session entry
    """
    token_hash_value = hash_token(token)

    # Auto-detect location from IP if not provided
    if location is None:
        location = get_location_from_ip(ip_address)

    session = ActiveSession(
        user_id=user_id,
        token_hash=token_hash_value,
        started_at=datetime.utcnow(),
        last_activity=datetime.utcnow(),
        ip_address=ip_address,
        user_agent=user_agent,
        location=location,
    )
    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def update_session_activity(
    db: Session,
    token: str,
) -> ActiveSession | None:
    """
    Update last activity time for a session

    Args:
        db: Database session
        token: Access token

    Returns:
        ActiveSession: Updated session or None if not found
    """
    token_hash_value = hash_token(token)
    session = db.query(ActiveSession).filter(
        ActiveSession.token_hash == token_hash_value
    ).first()

    if session:
        session.last_activity = datetime.utcnow()
        db.commit()
        db.refresh(session)

    return session


def end_session(db: Session, token: str) -> bool:
    """
    End an active session (logout)

    Args:
        db: Database session
        token: Access token

    Returns:
        bool: True if session was ended, False if not found
    """
    token_hash_value = hash_token(token)
    session = db.query(ActiveSession).filter(
        ActiveSession.token_hash == token_hash_value
    ).first()

    if session:
        db.delete(session)
        db.commit()
        return True

    return False


def log_audit_event(
    db: Session,
    user: User,
    action: str,
    resource_type: str,
    resource_id: UUID | None = None,
    resource_name: str | None = None,
    ip_address: str | None = None,
    user_agent: str | None = None,
    details: Dict[str, Any] | None = None,
) -> AuditEvent:
    """
    Log an audit event

    Args:
        db: Database session
        user: User performing the action
        action: Action type ('create', 'read', 'update', 'delete', 'execute')
        resource_type: Type of resource ('pipeline', 'module', 'connection', 'user')
        resource_id: ID of the resource
        resource_name: Name of the resource
        ip_address: Client IP address
        user_agent: Client user agent
        details: Additional details as JSON

    Returns:
        AuditEvent: Created audit event
    """
    event = AuditEvent(
        timestamp=datetime.utcnow(),
        user_id=user.id,
        username=user.username,
        action=action,
        resource_type=resource_type,
        resource_id=resource_id,
        resource_name=resource_name,
        ip_address=ip_address,
        user_agent=user_agent,
        details=details,
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


def cleanup_old_sessions(db: Session, days: int = 7) -> int:
    """
    Clean up sessions older than specified days

    Args:
        db: Database session
        days: Number of days to keep sessions

    Returns:
        int: Number of sessions deleted
    """
    from datetime import timedelta

    cutoff_date = datetime.utcnow() - timedelta(days=days)
    deleted = db.query(ActiveSession).filter(
        ActiveSession.last_activity < cutoff_date
    ).delete()
    db.commit()

    return deleted
