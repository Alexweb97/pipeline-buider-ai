"""
Audit Logging System
"""
import json
import logging
from datetime import datetime
from pathlib import Path
from typing import Any

# Create logs directory if it doesn't exist
logs_dir = Path("logs")
logs_dir.mkdir(exist_ok=True)

# Configure audit logger
audit_logger = logging.getLogger("audit")
audit_logger.setLevel(logging.INFO)

# File handler for audit logs
audit_handler = logging.FileHandler(logs_dir / "audit.log")
audit_handler.setFormatter(logging.Formatter("%(message)s"))
audit_logger.addHandler(audit_handler)

# Console handler for development
console_handler = logging.StreamHandler()
console_handler.setFormatter(
    logging.Formatter("[AUDIT] %(asctime)s - %(message)s", datefmt="%Y-%m-%d %H:%M:%S")
)
audit_logger.addHandler(console_handler)


def log_auth_event(
    event_type: str,
    username: str,
    ip: str,
    user_agent: str,
    success: bool,
    user_id: str | None = None,
    **kwargs: Any,
) -> None:
    """
    Log authentication events

    Args:
        event_type: Type of event (login, logout, register, etc.)
        username: Username or email attempting authentication
        ip: IP address of the request
        user_agent: User agent string
        success: Whether the operation was successful
        user_id: User ID if available
        **kwargs: Additional context data
    """
    log_entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "event_type": event_type,
        "username": username,
        "user_id": user_id,
        "ip": ip,
        "user_agent": user_agent,
        "success": success,
        **kwargs,
    }
    audit_logger.info(json.dumps(log_entry))


def log_security_event(
    event_type: str,
    description: str,
    severity: str,
    ip: str | None = None,
    user_id: str | None = None,
    **kwargs: Any,
) -> None:
    """
    Log security-related events

    Args:
        event_type: Type of security event
        description: Description of the event
        severity: Severity level (low, medium, high, critical)
        ip: IP address if applicable
        user_id: User ID if applicable
        **kwargs: Additional context data
    """
    log_entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "event_type": event_type,
        "severity": severity,
        "description": description,
        "ip": ip,
        "user_id": user_id,
        **kwargs,
    }
    audit_logger.warning(json.dumps(log_entry))


def log_data_access(
    user_id: str,
    resource_type: str,
    resource_id: str,
    action: str,
    ip: str,
    **kwargs: Any,
) -> None:
    """
    Log data access events

    Args:
        user_id: User accessing the data
        resource_type: Type of resource (pipeline, connection, etc.)
        resource_id: ID of the resource
        action: Action performed (read, create, update, delete)
        ip: IP address
        **kwargs: Additional context data
    """
    log_entry = {
        "timestamp": datetime.utcnow().isoformat(),
        "event_type": "data_access",
        "user_id": user_id,
        "resource_type": resource_type,
        "resource_id": resource_id,
        "action": action,
        "ip": ip,
        **kwargs,
    }
    audit_logger.info(json.dumps(log_entry))
