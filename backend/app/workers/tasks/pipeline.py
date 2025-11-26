"""
Pipeline Execution Tasks
"""
from datetime import datetime
from uuid import UUID
from croniter import croniter

from celery import Task
from celery.utils.log import get_task_logger
from sqlalchemy.orm import Session

from app.airflow.dag_generator import DAGGenerator
from app.db.models.execution import PipelineExecution
from app.db.models.schedule import Schedule
from app.db.models.pipeline import Pipeline
from app.db.session import SessionLocal
from app.integrations.airflow_client import get_airflow_client
from app.workers.celery_app import celery_app

logger = get_task_logger(__name__)


class PipelineTask(Task):
    """Base task for pipeline operations"""

    def on_failure(self, exc, task_id, args, kwargs, einfo):
        """Handle task failure"""
        logger.error(f"Task {task_id} failed: {exc}")
        super().on_failure(exc, task_id, args, kwargs, einfo)

    def on_success(self, retval, task_id, args, kwargs):
        """Handle task success"""
        logger.info(f"Task {task_id} succeeded")
        super().on_success(retval, task_id, args, kwargs)


@celery_app.task(base=PipelineTask, bind=True, name="app.workers.tasks.pipeline.execute_pipeline")
def execute_pipeline(self, pipeline_id: str, params: dict = None, trigger_type: str = "manual", user_id: str = None):
    """
    Execute a pipeline asynchronously via Airflow

    Args:
        pipeline_id: Pipeline UUID
        params: Pipeline execution parameters
        trigger_type: Trigger type (manual, scheduled, webhook)
        user_id: User who triggered the execution (optional)

    Returns:
        Execution information including dag_run_id
    """
    logger.info(f"Starting pipeline execution: {pipeline_id}")
    db: Session = SessionLocal()

    try:
        # 1. Load pipeline configuration from database
        pipeline = db.query(Pipeline).filter(Pipeline.id == UUID(pipeline_id)).first()
        if not pipeline:
            raise ValueError(f"Pipeline not found: {pipeline_id}")

        logger.info(f"Loaded pipeline: {pipeline.name}")

        # 2. Create execution record
        execution = PipelineExecution(
            pipeline_id=UUID(pipeline_id),
            triggered_by=UUID(user_id) if user_id else None,
            status="pending",
            trigger_type=trigger_type,
            params=params or {},
        )
        db.add(execution)
        db.commit()
        db.refresh(execution)

        logger.info(f"Created execution record: {execution.id}")

        # 3. Generate or update Airflow DAG
        dag_generator = DAGGenerator()
        dag_file = dag_generator.update_dag(
            pipeline_id=pipeline.id,
            pipeline_name=pipeline.name,
            pipeline_config=pipeline.config,
            schedule=pipeline.schedule,
            default_params=pipeline.default_params,
        )

        logger.info(f"Generated DAG file: {dag_file}")

        # Wait a bit for Airflow to detect the new DAG
        import time
        time.sleep(2)

        # 4. Trigger Airflow DAG
        airflow_client = get_airflow_client()
        dag_id = f"pipeline_{str(pipeline.id).replace('-', '_')}"

        # Prepare DAG configuration
        dag_conf = {
            "pipeline_id": str(pipeline.id),
            "execution_id": str(execution.id),
            "params": params or {},
            "trigger_type": trigger_type,
        }

        # Trigger the DAG
        import asyncio
        dag_run = asyncio.run(airflow_client.trigger_dag(
            dag_id=dag_id,
            conf=dag_conf,
        ))

        logger.info(f"Triggered Airflow DAG: {dag_run['dag_run_id']}")

        # 5. Update execution with Airflow DAG run ID
        execution.airflow_dag_run_id = dag_run["dag_run_id"]
        execution.status = "running"
        execution.started_at = datetime.utcnow().isoformat()
        db.commit()

        logger.info(f"Pipeline {pipeline_id} execution started successfully")

        return {
            "status": "success",
            "pipeline_id": pipeline_id,
            "execution_id": str(execution.id),
            "dag_run_id": dag_run["dag_run_id"],
            "message": "Pipeline execution started in Airflow",
        }

    except Exception as e:
        logger.error(f"Pipeline execution failed: {str(e)}")
        # Update execution status to failed
        if 'execution' in locals() and execution:
            execution.status = "failed"
            execution.error_message = str(e)
            db.commit()
        raise

    finally:
        db.close()


@celery_app.task(name="app.workers.tasks.pipeline.check_scheduled_pipelines")
def check_scheduled_pipelines():
    """
    Check and trigger scheduled pipelines

    This task runs periodically to check for pipelines that need to be executed
    based on their schedule.
    """
    logger.info("Checking scheduled pipelines")
    db: Session = SessionLocal()

    try:
        now = datetime.utcnow()
        triggered_count = 0

        # Query active schedules that are due for execution
        schedules = (
            db.query(Schedule)
            .filter(
                Schedule.status == "active",
                Schedule.next_run_at.isnot(None),
            )
            .all()
        )

        logger.info(f"Found {len(schedules)} active schedules to check")

        for schedule in schedules:
            try:
                # Check if schedule is due
                next_run = datetime.fromisoformat(schedule.next_run_at)

                if next_run <= now:
                    logger.info(f"Schedule {schedule.name} ({schedule.id}) is due for execution")

                    # Check start_date and end_date constraints
                    if schedule.start_date:
                        start = datetime.fromisoformat(schedule.start_date)
                        if now < start:
                            logger.info(f"Schedule {schedule.id} start_date not reached yet")
                            continue

                    if schedule.end_date:
                        end = datetime.fromisoformat(schedule.end_date)
                        if now > end:
                            logger.info(f"Schedule {schedule.id} has expired")
                            schedule.status = "expired"
                            db.commit()
                            continue

                    # Trigger pipeline execution
                    task = execute_pipeline.delay(
                        pipeline_id=str(schedule.pipeline_id),
                        params=schedule.config.get("params", {}),
                        trigger_type="scheduled",
                        user_id=str(schedule.created_by),
                    )

                    logger.info(f"Triggered execution for schedule {schedule.id}, task: {task.id}")

                    # Update schedule statistics
                    schedule.total_runs += 1
                    schedule.last_run_at = now.isoformat()

                    # Calculate next run time
                    if schedule.cron_expression and schedule.frequency != "once":
                        try:
                            cron = croniter(schedule.cron_expression, now)
                            next_run_time = cron.get_next(datetime)
                            schedule.next_run_at = next_run_time.isoformat()
                        except Exception as e:
                            logger.error(f"Failed to calculate next run for schedule {schedule.id}: {e}")
                            schedule.next_run_at = None
                    else:
                        # One-time schedule
                        schedule.next_run_at = None
                        if schedule.frequency == "once":
                            schedule.status = "expired"

                    db.commit()
                    triggered_count += 1

            except Exception as e:
                logger.error(f"Error processing schedule {schedule.id}: {str(e)}")
                continue

        logger.info(f"Triggered {triggered_count} scheduled pipelines")

        return {
            "status": "success",
            "message": f"Checked {len(schedules)} schedules, triggered {triggered_count}",
            "triggered_count": triggered_count,
        }

    except Exception as e:
        logger.error(f"Failed to check scheduled pipelines: {str(e)}")
        raise

    finally:
        db.close()


@celery_app.task(name="app.workers.tasks.pipeline.monitor_execution")
def monitor_execution(execution_id: str):
    """
    Monitor a running pipeline execution and update status

    Args:
        execution_id: Execution UUID

    Returns:
        Updated execution status
    """
    logger.info(f"Monitoring pipeline execution: {execution_id}")
    db: Session = SessionLocal()

    try:
        # 1. Load execution from database
        execution = db.query(PipelineExecution).filter(
            PipelineExecution.id == UUID(execution_id)
        ).first()

        if not execution:
            raise ValueError(f"Execution not found: {execution_id}")

        if not execution.airflow_dag_run_id:
            logger.warning(f"Execution {execution_id} has no Airflow DAG run ID")
            return {"status": "unknown", "message": "No Airflow DAG run ID"}

        # 2. Get status from Airflow
        airflow_client = get_airflow_client()
        pipeline = db.query(Pipeline).filter(Pipeline.id == execution.pipeline_id).first()
        dag_id = f"pipeline_{str(pipeline.id).replace('-', '_')}"

        import asyncio
        dag_run_status = asyncio.run(airflow_client.get_dag_run_status(
            dag_id=dag_id,
            dag_run_id=execution.airflow_dag_run_id,
        ))

        logger.info(f"Airflow DAG run status: {dag_run_status['state']}")

        # 3. Update execution status based on Airflow state
        airflow_state = dag_run_status["state"]

        # Map Airflow states to our execution states
        state_mapping = {
            "running": "running",
            "success": "success",
            "failed": "failed",
            "queued": "pending",
        }

        new_status = state_mapping.get(airflow_state, "unknown")

        # Update execution
        execution.status = new_status

        if dag_run_status.get("start_date"):
            execution.started_at = dag_run_status["start_date"]

        if dag_run_status.get("end_date"):
            execution.completed_at = dag_run_status["end_date"]

            # Calculate duration
            if execution.started_at and execution.completed_at:
                from datetime import datetime
                start = datetime.fromisoformat(execution.started_at)
                end = datetime.fromisoformat(execution.completed_at)
                execution.duration_seconds = int((end - start).total_seconds())

        db.commit()

        logger.info(f"Execution {execution_id} status updated to: {new_status}")

        return {
            "status": new_status,
            "execution_id": execution_id,
            "airflow_state": airflow_state,
            "started_at": execution.started_at,
            "completed_at": execution.completed_at,
            "duration_seconds": execution.duration_seconds,
        }

    except Exception as e:
        logger.error(f"Failed to monitor execution: {str(e)}")
        raise

    finally:
        db.close()


@celery_app.task(name="app.workers.tasks.pipeline.cancel_pipeline")
def cancel_pipeline(pipeline_id: str, execution_id: str):
    """
    Cancel a running pipeline execution

    Args:
        pipeline_id: Pipeline UUID
        execution_id: Execution UUID
    """
    logger.info(f"Cancelling pipeline execution: {execution_id}")
    db: Session = SessionLocal()

    try:
        # 1. Load execution from database
        execution = db.query(PipelineExecution).filter(
            PipelineExecution.id == UUID(execution_id)
        ).first()

        if not execution:
            raise ValueError(f"Execution not found: {execution_id}")

        if not execution.airflow_dag_run_id:
            logger.warning(f"Execution {execution_id} has no Airflow DAG run ID")
            # Just update status to cancelled
            execution.status = "cancelled"
            db.commit()
            return {"status": "cancelled", "message": "Execution cancelled (no Airflow run)"}

        # 2. Cancel Airflow DAG run
        airflow_client = get_airflow_client()
        pipeline = db.query(Pipeline).filter(Pipeline.id == execution.pipeline_id).first()
        dag_id = f"pipeline_{str(pipeline.id).replace('-', '_')}"

        import asyncio
        asyncio.run(airflow_client.cancel_dag_run(
            dag_id=dag_id,
            dag_run_id=execution.airflow_dag_run_id,
        ))

        # 3. Update execution status to cancelled
        execution.status = "cancelled"
        execution.completed_at = datetime.utcnow().isoformat()
        db.commit()

        logger.info(f"Pipeline execution cancelled: {execution_id}")

        return {
            "status": "success",
            "execution_id": execution_id,
            "message": "Pipeline execution cancelled",
        }

    except Exception as e:
        logger.error(f"Failed to cancel pipeline: {str(e)}")
        raise

    finally:
        db.close()
