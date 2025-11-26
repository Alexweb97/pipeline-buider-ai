"""
Schedule API Routes
"""
from datetime import datetime, timedelta
from typing import Annotated, Optional
from uuid import UUID

from croniter import croniter
from fastapi import APIRouter, Depends, HTTPException, status, Query, Request
from sqlalchemy.orm import Session

from app.api.dependencies.database import get_db
from app.api.dependencies.auth import get_current_user
from app.db.models.schedule import Schedule
from app.db.models.pipeline import Pipeline
from app.db.models.user import User
from app.schemas.schedule import (
    ScheduleCreate,
    ScheduleUpdate,
    ScheduleResponse,
    ScheduleSummary,
    ScheduleListResponse,
    ScheduleToggleRequest,
    ScheduleStats,
    ScheduleUpcoming,
)
from app.core.audit import log_audit_event, get_client_ip, get_user_agent
from app.core.config import settings
import httpx

router = APIRouter()


def frequency_to_cron(frequency: str, config: dict) -> str:
    """Convert frequency and config to cron expression"""
    minute = config.get("minute", 0)
    hour = config.get("hour", 0)
    day_of_month = config.get("day_of_month", 1)
    days_of_week = config.get("days_of_week", [])

    # Map day names to cron values
    day_map = {
        "monday": "1", "tuesday": "2", "wednesday": "3",
        "thursday": "4", "friday": "5", "saturday": "6", "sunday": "0"
    }

    if frequency == "once":
        # One-time schedule - will be handled differently
        return None
    elif frequency == "hourly":
        return f"{minute} * * * *"
    elif frequency == "daily":
        return f"{minute} {hour} * * *"
    elif frequency == "weekly":
        if days_of_week:
            days = ",".join(day_map.get(d, "1") for d in days_of_week)
        else:
            days = "1"  # Default to Monday
        return f"{minute} {hour} * * {days}"
    elif frequency == "monthly":
        return f"{minute} {hour} {day_of_month} * *"
    elif frequency == "custom":
        return config.get("cron_expression", "0 0 * * *")
    else:
        return "0 0 * * *"  # Default: daily at midnight


def calculate_next_run(cron_expression: str, timezone: str = "UTC") -> str | None:
    """Calculate next run time from cron expression"""
    if not cron_expression:
        return None
    try:
        cron = croniter(cron_expression, datetime.utcnow())
        next_run = cron.get_next(datetime)
        return next_run.isoformat()
    except Exception:
        return None


@router.get("", response_model=ScheduleListResponse)
def list_schedules(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = Query(None, alias="status"),
    pipeline_id: Optional[UUID] = None,
    search: Optional[str] = None,
    db: Annotated[Session, Depends(get_db)] = None,
    current_user: Annotated[User, Depends(get_current_user)] = None,
):
    """List all schedules with pagination and filters"""

    query = db.query(Schedule).filter(Schedule.created_by == current_user.id)

    if status_filter:
        query = query.filter(Schedule.status == status_filter)

    if pipeline_id:
        query = query.filter(Schedule.pipeline_id == pipeline_id)

    if search:
        query = query.filter(
            (Schedule.name.ilike(f"%{search}%")) |
            (Schedule.description.ilike(f"%{search}%"))
        )

    total = query.count()

    schedules = (
        query
        .order_by(Schedule.updated_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )

    # Enrich with pipeline names
    result = []
    for schedule in schedules:
        pipeline = db.query(Pipeline).filter(Pipeline.id == schedule.pipeline_id).first()
        summary = ScheduleSummary(
            id=schedule.id,
            name=schedule.name,
            description=schedule.description,
            pipeline_id=schedule.pipeline_id,
            pipeline_name=pipeline.name if pipeline else None,
            frequency=schedule.frequency,
            status=schedule.status,
            next_run_at=schedule.next_run_at,
            last_run_at=schedule.last_run_at,
            total_runs=schedule.total_runs,
            successful_runs=schedule.successful_runs,
            failed_runs=schedule.failed_runs,
            created_at=schedule.created_at,
        )
        result.append(summary)

    return ScheduleListResponse(
        schedules=result,
        total=total,
        page=page,
        page_size=page_size,
    )


@router.post("", status_code=status.HTTP_201_CREATED, response_model=ScheduleResponse)
def create_schedule(
    schedule_data: ScheduleCreate,
    request: Request,
    db: Annotated[Session, Depends(get_db)] = None,
    current_user: Annotated[User, Depends(get_current_user)] = None,
):
    """Create a new schedule"""

    # Verify pipeline exists and belongs to user
    pipeline = (
        db.query(Pipeline)
        .filter(
            Pipeline.id == schedule_data.pipeline_id,
            Pipeline.created_by == current_user.id,
        )
        .first()
    )

    if not pipeline:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pipeline not found",
        )

    # Convert frequency to cron expression
    config_dict = schedule_data.config.model_dump() if schedule_data.config else {}
    cron_expression = frequency_to_cron(schedule_data.frequency, config_dict)

    # Calculate next run
    next_run_at = calculate_next_run(cron_expression, schedule_data.timezone)

    schedule = Schedule(
        created_by=current_user.id,
        pipeline_id=schedule_data.pipeline_id,
        name=schedule_data.name,
        description=schedule_data.description,
        frequency=schedule_data.frequency,
        cron_expression=cron_expression,
        timezone=schedule_data.timezone,
        config=config_dict,
        start_date=schedule_data.start_date,
        end_date=schedule_data.end_date,
        next_run_at=next_run_at,
        status="active",
    )

    db.add(schedule)
    db.commit()
    db.refresh(schedule)

    # Log audit event
    log_audit_event(
        db=db,
        user=current_user,
        action="create",
        resource_type="schedule",
        resource_id=schedule.id,
        resource_name=schedule.name,
        ip_address=get_client_ip(request),
        user_agent=get_user_agent(request),
        details={"pipeline_id": str(schedule_data.pipeline_id), "frequency": schedule_data.frequency},
    )

    return ScheduleResponse(
        id=schedule.id,
        name=schedule.name,
        description=schedule.description,
        pipeline_id=schedule.pipeline_id,
        pipeline_name=pipeline.name,
        frequency=schedule.frequency,
        cron_expression=schedule.cron_expression,
        status=schedule.status,
        timezone=schedule.timezone,
        config=schedule.config,
        start_date=schedule.start_date,
        end_date=schedule.end_date,
        next_run_at=schedule.next_run_at,
        last_run_at=schedule.last_run_at,
        total_runs=schedule.total_runs,
        successful_runs=schedule.successful_runs,
        failed_runs=schedule.failed_runs,
        is_airflow_synced=schedule.is_airflow_synced,
        airflow_dag_id=schedule.airflow_dag_id,
        created_by=schedule.created_by,
        created_at=schedule.created_at,
        updated_at=schedule.updated_at,
    )


@router.get("/stats", response_model=ScheduleStats)
def get_schedule_stats(
    db: Annotated[Session, Depends(get_db)] = None,
    current_user: Annotated[User, Depends(get_current_user)] = None,
):
    """Get schedule statistics"""

    schedules = db.query(Schedule).filter(Schedule.created_by == current_user.id).all()

    total = len(schedules)
    active = sum(1 for s in schedules if s.status == "active")
    paused = sum(1 for s in schedules if s.status == "paused")

    # Calculate runs today
    today = datetime.utcnow().date()
    runs_today = sum(
        1 for s in schedules
        if s.last_run_at and datetime.fromisoformat(s.last_run_at).date() == today
    )

    # Calculate success rate
    total_runs = sum(s.total_runs for s in schedules)
    successful_runs = sum(s.successful_runs for s in schedules)
    success_rate = (successful_runs / total_runs * 100) if total_runs > 0 else 0

    # Get upcoming runs
    upcoming = []
    for schedule in schedules:
        if schedule.status == "active" and schedule.next_run_at:
            pipeline = db.query(Pipeline).filter(Pipeline.id == schedule.pipeline_id).first()
            upcoming.append(ScheduleUpcoming(
                schedule_id=schedule.id,
                schedule_name=schedule.name,
                pipeline_name=pipeline.name if pipeline else "Unknown",
                next_run_at=schedule.next_run_at,
                frequency=schedule.frequency,
            ))

    # Sort by next_run_at and take top 5
    upcoming.sort(key=lambda x: x.next_run_at)
    upcoming = upcoming[:5]

    return ScheduleStats(
        total_schedules=total,
        active_schedules=active,
        paused_schedules=paused,
        runs_today=runs_today,
        success_rate=round(success_rate, 1),
        upcoming_runs=upcoming,
    )


@router.get("/{schedule_id}", response_model=ScheduleResponse)
def get_schedule(
    schedule_id: UUID,
    db: Annotated[Session, Depends(get_db)] = None,
    current_user: Annotated[User, Depends(get_current_user)] = None,
):
    """Get schedule by ID"""

    schedule = (
        db.query(Schedule)
        .filter(
            Schedule.id == schedule_id,
            Schedule.created_by == current_user.id,
        )
        .first()
    )

    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Schedule not found",
        )

    pipeline = db.query(Pipeline).filter(Pipeline.id == schedule.pipeline_id).first()

    return ScheduleResponse(
        id=schedule.id,
        name=schedule.name,
        description=schedule.description,
        pipeline_id=schedule.pipeline_id,
        pipeline_name=pipeline.name if pipeline else None,
        frequency=schedule.frequency,
        cron_expression=schedule.cron_expression,
        status=schedule.status,
        timezone=schedule.timezone,
        config=schedule.config,
        start_date=schedule.start_date,
        end_date=schedule.end_date,
        next_run_at=schedule.next_run_at,
        last_run_at=schedule.last_run_at,
        total_runs=schedule.total_runs,
        successful_runs=schedule.successful_runs,
        failed_runs=schedule.failed_runs,
        is_airflow_synced=schedule.is_airflow_synced,
        airflow_dag_id=schedule.airflow_dag_id,
        created_by=schedule.created_by,
        created_at=schedule.created_at,
        updated_at=schedule.updated_at,
    )


@router.put("/{schedule_id}", response_model=ScheduleResponse)
def update_schedule(
    schedule_id: UUID,
    schedule_data: ScheduleUpdate,
    request: Request,
    db: Annotated[Session, Depends(get_db)] = None,
    current_user: Annotated[User, Depends(get_current_user)] = None,
):
    """Update schedule"""

    schedule = (
        db.query(Schedule)
        .filter(
            Schedule.id == schedule_id,
            Schedule.created_by == current_user.id,
        )
        .first()
    )

    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Schedule not found",
        )

    update_data = schedule_data.model_dump(exclude_unset=True)

    # Handle config update
    if "config" in update_data and update_data["config"]:
        config_dict = update_data["config"].model_dump() if hasattr(update_data["config"], "model_dump") else update_data["config"]
        update_data["config"] = config_dict

        # Recalculate cron expression if frequency or config changed
        frequency = update_data.get("frequency", schedule.frequency)
        schedule.cron_expression = frequency_to_cron(frequency, config_dict)
        schedule.next_run_at = calculate_next_run(schedule.cron_expression, schedule.timezone)

    for field, value in update_data.items():
        setattr(schedule, field, value)

    db.commit()
    db.refresh(schedule)

    # Log audit event
    log_audit_event(
        db=db,
        user=current_user,
        action="update",
        resource_type="schedule",
        resource_id=schedule.id,
        resource_name=schedule.name,
        ip_address=get_client_ip(request),
        user_agent=get_user_agent(request),
        details={"updated_fields": list(update_data.keys())},
    )

    pipeline = db.query(Pipeline).filter(Pipeline.id == schedule.pipeline_id).first()

    return ScheduleResponse(
        id=schedule.id,
        name=schedule.name,
        description=schedule.description,
        pipeline_id=schedule.pipeline_id,
        pipeline_name=pipeline.name if pipeline else None,
        frequency=schedule.frequency,
        cron_expression=schedule.cron_expression,
        status=schedule.status,
        timezone=schedule.timezone,
        config=schedule.config,
        start_date=schedule.start_date,
        end_date=schedule.end_date,
        next_run_at=schedule.next_run_at,
        last_run_at=schedule.last_run_at,
        total_runs=schedule.total_runs,
        successful_runs=schedule.successful_runs,
        failed_runs=schedule.failed_runs,
        is_airflow_synced=schedule.is_airflow_synced,
        airflow_dag_id=schedule.airflow_dag_id,
        created_by=schedule.created_by,
        created_at=schedule.created_at,
        updated_at=schedule.updated_at,
    )


@router.patch("/{schedule_id}/status")
def toggle_schedule_status(
    schedule_id: UUID,
    toggle_data: ScheduleToggleRequest,
    request: Request,
    db: Annotated[Session, Depends(get_db)] = None,
    current_user: Annotated[User, Depends(get_current_user)] = None,
):
    """Toggle schedule status (active/paused)"""

    schedule = (
        db.query(Schedule)
        .filter(
            Schedule.id == schedule_id,
            Schedule.created_by == current_user.id,
        )
        .first()
    )

    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Schedule not found",
        )

    old_status = schedule.status
    schedule.status = toggle_data.status

    # Recalculate next run if activating
    if toggle_data.status == "active" and schedule.cron_expression:
        schedule.next_run_at = calculate_next_run(schedule.cron_expression, schedule.timezone)

    db.commit()

    # Log audit event
    log_audit_event(
        db=db,
        user=current_user,
        action="toggle_status",
        resource_type="schedule",
        resource_id=schedule.id,
        resource_name=schedule.name,
        ip_address=get_client_ip(request),
        user_agent=get_user_agent(request),
        details={"old_status": old_status, "new_status": toggle_data.status},
    )

    return {"status": schedule.status, "message": f"Schedule {toggle_data.status}"}


@router.delete("/{schedule_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_schedule(
    schedule_id: UUID,
    request: Request,
    db: Annotated[Session, Depends(get_db)] = None,
    current_user: Annotated[User, Depends(get_current_user)] = None,
):
    """Delete schedule"""

    schedule = (
        db.query(Schedule)
        .filter(
            Schedule.id == schedule_id,
            Schedule.created_by == current_user.id,
        )
        .first()
    )

    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Schedule not found",
        )

    schedule_name = schedule.name

    # Log audit event before deletion
    log_audit_event(
        db=db,
        user=current_user,
        action="delete",
        resource_type="schedule",
        resource_id=schedule.id,
        resource_name=schedule_name,
        ip_address=get_client_ip(request),
        user_agent=get_user_agent(request),
    )

    db.delete(schedule)
    db.commit()

    return None


@router.post("/{schedule_id}/trigger")
def trigger_schedule(
    schedule_id: UUID,
    request: Request,
    db: Annotated[Session, Depends(get_db)] = None,
    current_user: Annotated[User, Depends(get_current_user)] = None,
):
    """Manually trigger a schedule execution"""

    schedule = (
        db.query(Schedule)
        .filter(
            Schedule.id == schedule_id,
            Schedule.created_by == current_user.id,
        )
        .first()
    )

    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Schedule not found",
        )

    airflow_dag_run_id = None
    celery_task_id = None

    # If synced to Airflow, trigger via Airflow API
    if schedule.is_airflow_synced and schedule.airflow_dag_id:
        try:
            airflow_url = getattr(settings, 'AIRFLOW_URL', 'http://airflow-webserver:8080')
            airflow_user = getattr(settings, 'AIRFLOW_USER', 'airflow')
            airflow_password = getattr(settings, 'AIRFLOW_PASSWORD', 'airflow')

            # Trigger DAG run via Airflow REST API
            response = httpx.post(
                f"{airflow_url}/api/v1/dags/{schedule.airflow_dag_id}/dagRuns",
                json={
                    "conf": schedule.config.get("params", {}),
                    "note": f"Triggered from LogiData by {current_user.email}",
                },
                auth=(airflow_user, airflow_password),
                timeout=30.0,
            )

            if response.status_code in [200, 201]:
                dag_run_data = response.json()
                airflow_dag_run_id = dag_run_data.get("dag_run_id")
            else:
                # Fallback to Celery if Airflow fails
                raise Exception(f"Airflow API error: {response.status_code}")

        except Exception as e:
            # Fallback to Celery execution
            from app.workers.tasks.pipeline import execute_pipeline as execute_pipeline_task
            task = execute_pipeline_task.delay(
                pipeline_id=str(schedule.pipeline_id),
                params=schedule.config.get("params", {}),
                trigger_type="scheduled",
                user_id=str(current_user.id),
            )
            celery_task_id = task.id
    else:
        # Execute via Celery if not synced to Airflow
        from app.workers.tasks.pipeline import execute_pipeline as execute_pipeline_task
        task = execute_pipeline_task.delay(
            pipeline_id=str(schedule.pipeline_id),
            params=schedule.config.get("params", {}),
            trigger_type="scheduled",
            user_id=str(current_user.id),
        )
        celery_task_id = task.id

    # Update schedule stats
    schedule.total_runs += 1
    schedule.last_run_at = datetime.utcnow().isoformat()

    # Recalculate next run
    if schedule.cron_expression:
        schedule.next_run_at = calculate_next_run(schedule.cron_expression, schedule.timezone)

    db.commit()

    # Log audit event
    log_audit_event(
        db=db,
        user=current_user,
        action="trigger",
        resource_type="schedule",
        resource_id=schedule.id,
        resource_name=schedule.name,
        ip_address=get_client_ip(request),
        user_agent=get_user_agent(request),
        details={
            "celery_task_id": celery_task_id,
            "airflow_dag_run_id": airflow_dag_run_id,
        },
    )

    return {
        "schedule_id": str(schedule_id),
        "pipeline_id": str(schedule.pipeline_id),
        "celery_task_id": celery_task_id,
        "airflow_dag_run_id": airflow_dag_run_id,
        "status": "triggered",
        "message": "Schedule execution triggered" + (" via Airflow" if airflow_dag_run_id else " via Celery"),
    }


@router.post("/{schedule_id}/sync-airflow")
def sync_schedule_to_airflow(
    schedule_id: UUID,
    request: Request,
    db: Annotated[Session, Depends(get_db)] = None,
    current_user: Annotated[User, Depends(get_current_user)] = None,
):
    """Sync schedule to Airflow DAG"""

    schedule = (
        db.query(Schedule)
        .filter(
            Schedule.id == schedule_id,
            Schedule.created_by == current_user.id,
        )
        .first()
    )

    if not schedule:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Schedule not found",
        )

    pipeline = db.query(Pipeline).filter(Pipeline.id == schedule.pipeline_id).first()
    if not pipeline:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pipeline not found",
        )

    # Generate Airflow DAG - force reload to get fresh module definitions
    import importlib
    import app.airflow.dag_generator as dag_gen_module
    importlib.reload(dag_gen_module)
    DAGGenerator = dag_gen_module.DAGGenerator

    dag_generator = DAGGenerator()
    dag_file = dag_generator.update_dag(
        pipeline_id=pipeline.id,
        pipeline_name=pipeline.name,
        pipeline_config=pipeline.config,
        schedule=schedule.cron_expression,
        default_params=pipeline.default_params,
    )

    # Update schedule
    dag_id = f"pipeline_{str(pipeline.id).replace('-', '_')}"
    schedule.is_airflow_synced = True
    schedule.airflow_dag_id = dag_id
    db.commit()

    # Log audit event
    log_audit_event(
        db=db,
        user=current_user,
        action="sync_airflow",
        resource_type="schedule",
        resource_id=schedule.id,
        resource_name=schedule.name,
        ip_address=get_client_ip(request),
        user_agent=get_user_agent(request),
        details={"dag_id": dag_id, "dag_file": dag_file},
    )

    return {
        "schedule_id": str(schedule_id),
        "dag_id": dag_id,
        "dag_file": dag_file,
        "message": "Schedule synced to Airflow",
    }
