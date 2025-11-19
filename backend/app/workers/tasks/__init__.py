"""
Celery Tasks Package
"""
# Import all tasks so Celery can discover them
from app.workers.tasks.pipeline import (
    execute_pipeline,
    check_scheduled_pipelines,
    monitor_execution,
    cancel_pipeline,
)
from app.workers.tasks.cleanup import cleanup_old_executions, cleanup_old_logs
from app.workers.tasks.data import process_data_chunk, validate_data, aggregate_results
from app.workers.tasks.notifications import send_email, send_pipeline_notification, send_webhook

__all__ = [
    "execute_pipeline",
    "check_scheduled_pipelines",
    "monitor_execution",
    "cancel_pipeline",
    "cleanup_old_executions",
    "cleanup_old_logs",
    "process_data_chunk",
    "validate_data",
    "aggregate_results",
    "send_email",
    "send_pipeline_notification",
    "send_webhook",
]
