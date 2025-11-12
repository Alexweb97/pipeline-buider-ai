"""
Application Configuration
"""
from functools import lru_cache
from typing import Any

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings"""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
        extra="allow",
    )

    # Application
    APP_NAME: str = "ETL/ELT Builder"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    DEBUG: bool = True

    # Security
    SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Database
    DATABASE_URL: str
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 10
    DB_ECHO: bool = False

    # Redis
    REDIS_URL: str

    # Celery
    CELERY_BROKER_URL: str
    CELERY_RESULT_BACKEND: str

    # Apache Airflow
    AIRFLOW_HOME: str = "/opt/airflow"
    AIRFLOW_WEBSERVER_PORT: int = 8080
    AIRFLOW_API_URL: str
    AIRFLOW_USERNAME: str = "admin"
    AIRFLOW_PASSWORD: str = "admin"

    # MinIO / S3
    MINIO_ENDPOINT: str
    MINIO_ACCESS_KEY: str
    MINIO_SECRET_KEY: str
    MINIO_BUCKET: str = "data-lake"
    MINIO_SECURE: bool = False

    # CORS
    CORS_ORIGINS: list[str] | str = [
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:80",
    ]

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def parse_cors_origins(cls, v: Any) -> list[str] | str:
        """Parse CORS origins from string or list"""
        if isinstance(v, str):
            if v.startswith("["):
                # Parse JSON-like string
                import json

                return json.loads(v.replace("'", '"'))
            return [i.strip() for i in v.split(",")]
        return v

    # Logging
    LOG_LEVEL: str = "INFO"
    LOG_FORMAT: str = "json"

    # Data Encryption
    ENCRYPTION_KEY: str

    # AI/ML Services (Optional)
    OPENAI_API_KEY: str = ""
    HUGGINGFACE_API_KEY: str = ""

    # Monitoring (Optional)
    SENTRY_DSN: str = ""

    # Email (Optional)
    SMTP_HOST: str = "smtp.gmail.com"
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = "noreply@logidata.ai"

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = 60

    # File Upload
    MAX_UPLOAD_SIZE_MB: int = 100

    # Data Retention
    EXECUTION_RETENTION_DAYS: int = 90
    LOG_RETENTION_DAYS: int = 30
    AUDIT_RETENTION_DAYS: int = 180

    @property
    def is_development(self) -> bool:
        """Check if running in development mode"""
        return self.ENVIRONMENT == "development"

    @property
    def is_production(self) -> bool:
        """Check if running in production mode"""
        return self.ENVIRONMENT == "production"

    @property
    def database_url_async(self) -> str:
        """Get async database URL"""
        return self.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")


@lru_cache
def get_settings() -> Settings:
    """Get cached settings instance"""
    return Settings()


# Global settings instance
settings = get_settings()
