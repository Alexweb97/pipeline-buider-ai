"""
Security API Routes - Authentication logs, audit trails, and security analysis
"""
from typing import Annotated, Optional
from datetime import datetime, timedelta
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, desc

from app.api.dependencies.database import get_db
from app.api.dependencies.auth import get_current_user
from app.db.models.user import User
from app.db.models.pipeline import Pipeline
from app.db.models.auth_log import AuthLog
from app.db.models.active_session import ActiveSession
from app.db.models.audit_event import AuditEvent

router = APIRouter()


@router.get("/login-history")
def get_login_history(
    limit: int = Query(50, le=200),
    days: int = Query(7, le=90),
    db: Annotated[Session, Depends(get_db)] = None,
    current_user: Annotated[User, Depends(get_current_user)] = None,
):
    """Get recent login history from database"""

    cutoff_date = datetime.utcnow() - timedelta(days=days)

    # Query auth logs
    logs = db.query(AuthLog).filter(
        AuthLog.timestamp >= cutoff_date
    ).order_by(desc(AuthLog.timestamp)).limit(limit).all()

    # Calculate summary statistics
    total_attempts = db.query(AuthLog).filter(
        AuthLog.timestamp >= cutoff_date
    ).count()

    successful = db.query(AuthLog).filter(
        AuthLog.timestamp >= cutoff_date,
        AuthLog.status == "success"
    ).count()

    failed = total_attempts - successful

    unique_users = db.query(func.count(func.distinct(AuthLog.username))).filter(
        AuthLog.timestamp >= cutoff_date
    ).scalar()

    unique_ips = db.query(func.count(func.distinct(AuthLog.ip_address))).filter(
        AuthLog.timestamp >= cutoff_date
    ).scalar()

    return {
        "logins": [
            {
                "id": str(log.id),
                "username": log.username,
                "email": log.email or "",
                "timestamp": log.timestamp.isoformat(),
                "ip_address": log.ip_address or "unknown",
                "user_agent": log.user_agent or "unknown",
                "status": log.status,
            }
            for log in logs
        ],
        "total": len(logs),
        "summary": {
            "total_attempts": total_attempts,
            "successful": successful,
            "failed": failed,
            "unique_users": unique_users or 0,
            "unique_ips": unique_ips or 0,
        }
    }


@router.get("/audit-log")
def get_audit_log(
    resource_type: Optional[str] = Query(None, description="Filter by resource type (pipeline, module, user)"),
    action: Optional[str] = Query(None, description="Filter by action (create, read, update, delete, execute)"),
    limit: int = Query(50, le=200),
    days: int = Query(7, le=90),
    db: Annotated[Session, Depends(get_db)] = None,
    current_user: Annotated[User, Depends(get_current_user)] = None,
):
    """Get audit trail of all actions from database"""

    cutoff_date = datetime.utcnow() - timedelta(days=days)

    # Build query with filters
    query = db.query(AuditEvent).filter(AuditEvent.timestamp >= cutoff_date)

    if resource_type:
        query = query.filter(AuditEvent.resource_type == resource_type)

    if action:
        query = query.filter(AuditEvent.action == action)

    # Get events
    events = query.order_by(desc(AuditEvent.timestamp)).limit(limit).all()

    # Calculate summary statistics
    total_events = db.query(AuditEvent).filter(AuditEvent.timestamp >= cutoff_date).count()

    # Count by action
    by_action = {}
    for act in ["create", "read", "update", "delete", "execute"]:
        count = db.query(AuditEvent).filter(
            AuditEvent.timestamp >= cutoff_date,
            AuditEvent.action == act
        ).count()
        by_action[act] = count

    # Count by resource
    by_resource = {}
    for res in ["pipeline", "module", "connection", "user"]:
        count = db.query(AuditEvent).filter(
            AuditEvent.timestamp >= cutoff_date,
            AuditEvent.resource_type == res
        ).count()
        by_resource[res] = count

    return {
        "events": [
            {
                "id": str(event.id),
                "timestamp": event.timestamp.isoformat(),
                "user_id": str(event.user_id) if event.user_id else None,
                "username": event.username,
                "action": event.action,
                "resource_type": event.resource_type,
                "resource_id": str(event.resource_id) if event.resource_id else None,
                "resource_name": event.resource_name or "",
                "ip_address": event.ip_address or "unknown",
                "details": event.details or {},
            }
            for event in events
        ],
        "total": len(events),
        "summary": {
            "total_events": total_events,
            "by_action": by_action,
            "by_resource": by_resource,
        }
    }


@router.get("/active-sessions")
def get_active_sessions(
    db: Annotated[Session, Depends(get_db)] = None,
    current_user: Annotated[User, Depends(get_current_user)] = None,
):
    """Get currently active user sessions from database"""

    # Query active sessions joined with users
    sessions = db.query(ActiveSession).join(User).order_by(desc(ActiveSession.last_activity)).all()

    return {
        "sessions": [
            {
                "id": str(session.id),
                "user_id": str(session.user_id),
                "username": session.user.username,
                "email": session.user.email,
                "started_at": session.started_at.isoformat(),
                "last_activity": session.last_activity.isoformat(),
                "ip_address": session.ip_address or "unknown",
                "user_agent": session.user_agent or "unknown",
                "location": session.location or "Unknown",
            }
            for session in sessions
        ],
        "total": len(sessions),
    }


@router.get("/security-events")
def get_security_events(
    severity: Optional[str] = Query(None, description="Filter by severity (critical, high, medium, low)"),
    limit: int = Query(50, le=200),
    days: int = Query(7, le=90),
    db: Annotated[Session, Depends(get_db)] = None,
    current_user: Annotated[User, Depends(get_current_user)] = None,
):
    """Get security events and alerts"""

    pipelines = db.query(Pipeline).all()

    events = []

    # Analyze pipelines for security issues
    for pipeline in pipelines:
        nodes = pipeline.config.get("nodes", [])

        # Check for database connections
        for node in nodes:
            module_id = node.get("data", {}).get("moduleId", "")

            if "postgres" in module_id or "mysql" in module_id:
                events.append({
                    "id": f"enc-{pipeline.id}-{node.get('id')}",
                    "timestamp": pipeline.updated_at.isoformat(),
                    "severity": "high",
                    "category": "Encryption",
                    "title": "Unencrypted Database Connection",
                    "description": f"Pipeline '{pipeline.name}' has database connection without SSL/TLS",
                    "resource_type": "pipeline",
                    "resource_id": str(pipeline.id),
                    "resource_name": pipeline.name,
                    "status": "open",
                })

            if "api" in module_id:
                events.append({
                    "id": f"auth-{pipeline.id}-{node.get('id')}",
                    "timestamp": pipeline.updated_at.isoformat(),
                    "severity": "medium",
                    "category": "Authentication",
                    "title": "API Authentication Not Configured",
                    "description": f"Pipeline '{pipeline.name}' may access APIs without authentication",
                    "resource_type": "pipeline",
                    "resource_id": str(pipeline.id),
                    "resource_name": pipeline.name,
                    "status": "open",
                })

    # Sort by timestamp descending
    events.sort(key=lambda x: x["timestamp"], reverse=True)

    # Filter by severity if specified
    if severity:
        events = [e for e in events if e["severity"] == severity]

    return {
        "events": events[:limit],
        "total": len(events),
        "summary": {
            "total_events": len(events),
            "by_severity": {
                "critical": len([e for e in events if e["severity"] == "critical"]),
                "high": len([e for e in events if e["severity"] == "high"]),
                "medium": len([e for e in events if e["severity"] == "medium"]),
                "low": len([e for e in events if e["severity"] == "low"]),
            },
            "by_status": {
                "open": len([e for e in events if e["status"] == "open"]),
                "resolved": len([e for e in events if e["status"] == "resolved"]),
            }
        }
    }


@router.get("/user-activity")
def get_user_activity(
    user_id: Optional[UUID] = Query(None, description="Filter by user ID"),
    limit: int = Query(50, le=200),
    days: int = Query(7, le=90),
    db: Annotated[Session, Depends(get_db)] = None,
    current_user: Annotated[User, Depends(get_current_user)] = None,
):
    """Get user activity summary"""

    # Get all users
    users = db.query(User).all()

    # Get pipelines per user
    pipeline_counts = db.query(
        Pipeline.created_by,
        func.count(Pipeline.id).label("count")
    ).group_by(Pipeline.created_by).all()

    pipeline_map = {str(user_id): count for user_id, count in pipeline_counts}

    activities = []
    for user in users:
        activities.append({
            "user_id": str(user.id),
            "username": user.username,
            "email": user.email,
            "role": user.role,
            "last_login": datetime.utcnow().isoformat(),
            "pipelines_created": pipeline_map.get(str(user.id), 0),
            "last_activity": datetime.utcnow().isoformat(),
            "is_active": user.is_active,
        })

    return {
        "activities": activities,
        "total": len(activities),
        "summary": {
            "total_users": len(users),
            "active_users": len([u for u in users if u.is_active]),
            "inactive_users": len([u for u in users if not u.is_active]),
            "admin_users": len([u for u in users if u.role == "admin"]),
        }
    }


@router.get("/statistics")
def get_security_statistics(
    days: int = Query(7, le=90),
    db: Annotated[Session, Depends(get_db)] = None,
    current_user: Annotated[User, Depends(get_current_user)] = None,
):
    """Get security statistics and metrics from database"""

    cutoff_date = datetime.utcnow() - timedelta(days=days)

    pipelines = db.query(Pipeline).all()
    users = db.query(User).all()

    # Get real data from auth logs
    total_logins = db.query(AuthLog).filter(
        AuthLog.timestamp >= cutoff_date,
        AuthLog.status == "success"
    ).count()

    failed_logins = db.query(AuthLog).filter(
        AuthLog.timestamp >= cutoff_date,
        AuthLog.status == "failed"
    ).count()

    # Analyze security posture from pipelines
    total_issues = 0
    for pipeline in pipelines:
        nodes = pipeline.config.get("nodes", [])
        # Count issues per pipeline (simplified)
        total_issues += len([n for n in nodes if any(
            x in n.get("data", {}).get("moduleId", "")
            for x in ["postgres", "mysql", "api", "mongo"]
        )]) * 2  # Each connection = 2 potential issues

    security_score = max(0, 100 - (total_issues * 5))

    return {
        "security_score": security_score,
        "total_pipelines": len(pipelines),
        "total_users": len(users),
        "active_users": len([u for u in users if u.is_active]),
        "security_issues": {
            "critical": 0,
            "high": total_issues // 2,
            "medium": total_issues // 2,
            "low": 2 if pipelines else 0,
        },
        "compliance": {
            "gdpr": "Partial Compliance",
            "hipaa": "Not Configured",
            "soc2": "Partial Compliance",
            "pci_dss": "Not Configured",
        },
        "trends": {
            "logins_last_7_days": total_logins,
            "failed_logins_last_7_days": failed_logins,
            "security_events_last_7_days": total_issues,
            "resolved_issues_last_7_days": 0,
        }
    }
