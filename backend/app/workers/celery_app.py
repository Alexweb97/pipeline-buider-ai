"""
Celery Application Configuration
"""
from celery import Celery
from celery.schedules import crontab

from app.core.config import settings

# Create Celery app
celery_app = Celery(
    "etl_builder",
    broker=settings.CELERY_BROKER_URL,
    backend=settings.CELERY_RESULT_BACKEND,
)

# Celery configuration
celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_time_limit=3600,  # 1 hour
    task_soft_time_limit=3300,  # 55 minutes
    worker_prefetch_multiplier=4,
    worker_max_tasks_per_child=1000,
    result_expires=86400,  # 24 hours
    task_acks_late=True,
    task_reject_on_worker_lost=True,
    broker_connection_retry_on_startup=True,
)

# Task routes
celery_app.conf.task_routes = {
    "app.workers.tasks.pipeline.*": {"queue": "pipelines"},
    "app.workers.tasks.data.*": {"queue": "data_processing"},
    "app.workers.tasks.notifications.*": {"queue": "notifications"},
}

# Periodic tasks (Celery Beat schedule)
celery_app.conf.beat_schedule = {
    "cleanup-old-executions": {
        "task": "app.workers.tasks.cleanup.cleanup_old_executions",
        "schedule": crontab(hour=2, minute=0),  # Every day at 2 AM
    },
    "cleanup-old-logs": {
        "task": "app.workers.tasks.cleanup.cleanup_old_logs",
        "schedule": crontab(hour=3, minute=0),  # Every day at 3 AM
    },
    "check-scheduled-pipelines": {
        "task": "app.workers.tasks.pipeline.check_scheduled_pipelines",
        "schedule": crontab(minute="*/5"),  # Every 5 minutes
    },
}

# Auto-discover tasks
celery_app.autodiscover_tasks(["app.workers.tasks"])


@celery_app.task(bind=True)
def debug_task(self):
    """Debug task for testing Celery"""
    print(f"Request: {self.request!r}")
    return {"status": "ok", "message": "Celery is working!"}
