# Multi-stage build for Python backend with uv

FROM python:3.14-slim AS base

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    UV_SYSTEM_PYTHON=1 \
    PATH="/root/.local/bin:$PATH"

# Install system dependencies and uv
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libpq-dev \
    curl \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/* \
    && curl -LsSf https://astral.sh/uv/install.sh | sh

WORKDIR /app

# Development stage
FROM base AS development

# Copy pyproject.toml first
COPY pyproject.toml ./

# Create venv and install dependencies
RUN uv venv && \
    uv pip install --no-cache \
    fastapi uvicorn[standard] pydantic pydantic-settings python-multipart \
    sqlalchemy alembic psycopg2-binary asyncpg \
    redis hiredis celery flower \
    apache-airflow-client requests \
    python-jose[cryptography] passlib[bcrypt] python-dotenv cryptography \
    pandas polars numpy pyarrow \
    pymongo pymysql sqlalchemy-utils \
    minio boto3 \
    scikit-learn spacy openai \
    httpx aiohttp websockets \
    jsonschema python-dateutil \
    structlog python-json-logger sentry-sdk[fastapi] \
    email-validator python-slugify tenacity \
    pytest pytest-asyncio pytest-cov pytest-mock \
    black isort flake8 pylint mypy ruff \
    ipython ipdb

# Copy application code
COPY . .

# Update PATH to use venv
ENV PATH="/app/.venv/bin:$PATH"

# Expose port
EXPOSE 8000

# Run with reload for development
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"]


# Production stage
FROM base AS production

# Copy pyproject.toml
COPY pyproject.toml ./

# Create venv and install production dependencies only
RUN uv venv && \
    uv pip install --no-cache \
    fastapi uvicorn[standard] pydantic pydantic-settings python-multipart \
    sqlalchemy alembic psycopg2-binary asyncpg \
    redis hiredis celery flower \
    apache-airflow-client requests \
    python-jose[cryptography] passlib[bcrypt] python-dotenv cryptography \
    pandas polars numpy pyarrow \
    pymongo pymysql sqlalchemy-utils \
    minio boto3 \
    scikit-learn spacy openai \
    httpx aiohttp websockets \
    jsonschema python-dateutil \
    structlog python-json-logger sentry-sdk[fastapi] \
    email-validator python-slugify tenacity

# Copy application code
COPY . .

# Update PATH to use venv
ENV PATH="/app/.venv/bin:$PATH"

# Create non-root user
RUN useradd -m -u 1000 appuser && \
    mkdir -p /app/logs && \
    chown -R appuser:appuser /app

# Copy application code
COPY --chown=appuser:appuser . .

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run production server
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--workers", "4"]
