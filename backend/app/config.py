"""
Application Configuration Management
"""
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, validator


class Settings(BaseSettings):
    """Application settings"""

    # Application
    APP_NAME: str = "ETL/ELT Builder"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = Field(default="development", env="ENVIRONMENT")
    DEBUG: bool = Field(default=True, env="DEBUG")

    # Security
    SECRET_KEY: str = Field(..., env="SECRET_KEY")
    JWT_ALGORITHM: str = Field(default="HS256", env="JWT_ALGORITHM")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = Field(default=30, env="ACCESS_TOKEN_EXPIRE_MINUTES")
    REFRESH_TOKEN_EXPIRE_DAYS: int = Field(default=7, env="REFRESH_TOKEN_EXPIRE_DAYS")

    # Database
    DATABASE_URL: str = Field(..., env="DATABASE_URL")
    DB_POOL_SIZE: int = Field(default=20, env="DB_POOL_SIZE")
    DB_MAX_OVERFLOW: int = Field(default=10, env="DB_MAX_OVERFLOW")
    DB_ECHO: bool = Field(default=False, env="DB_ECHO")

    # Redis
    REDIS_URL: str = Field(..., env="REDIS_URL")

    # Celery
    CELERY_BROKER_URL: str = Field(..., env="CELERY_BROKER_URL")
    CELERY_RESULT_BACKEND: str = Field(..., env="CELERY_RESULT_BACKEND")

    # Apache Airflow
    AIRFLOW_HOME: str = Field(default="/opt/airflow", env="AIRFLOW_HOME")
    AIRFLOW_WEBSERVER_PORT: int = Field(default=8080, env="AIRFLOW_WEBSERVER_PORT")
    AIRFLOW_API_URL: str = Field(..., env="AIRFLOW_API_URL")
    AIRFLOW_USERNAME: str = Field(default="admin", env="AIRFLOW_USERNAME")
    AIRFLOW_PASSWORD: str = Field(default="admin", env="AIRFLOW_PASSWORD")

    # MinIO / S3
    MINIO_ENDPOINT: str = Field(..., env="MINIO_ENDPOINT")
    MINIO_ACCESS_KEY: str = Field(..., env="MINIO_ACCESS_KEY")
    MINIO_SECRET_KEY: str = Field(..., env="MINIO_SECRET_KEY")
    MINIO_BUCKET: str = Field(default="data-lake", env="MINIO_BUCKET")
    MINIO_SECURE: bool = Field(default=False, env="MINIO_SECURE")

    # CORS
    CORS_ORIGINS: List[str] = Field(
        default=["http://localhost:3000", "http://localhost:5173"],
        env="CORS_ORIGINS"
    )

    @validator("CORS_ORIGINS", pre=True)
    def parse_cors_origins(cls, v):
        """Parse CORS origins from string or list"""
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",")]
        return v

    # Logging
    LOG_LEVEL: str = Field(default="INFO", env="LOG_LEVEL")
    LOG_FORMAT: str = Field(default="json", env="LOG_FORMAT")

    # Data Encryption
    ENCRYPTION_KEY: str = Field(..., env="ENCRYPTION_KEY")

    # AI/ML Services (Optional)
    OPENAI_API_KEY: str | None = Field(default=None, env="OPENAI_API_KEY")
    HUGGINGFACE_API_KEY: str | None = Field(default=None, env="HUGGINGFACE_API_KEY")

    # Monitoring (Optional)
    SENTRY_DSN: str | None = Field(default=None, env="SENTRY_DSN")

    # Email (Optional)
    SMTP_HOST: str | None = Field(default=None, env="SMTP_HOST")
    SMTP_PORT: int = Field(default=587, env="SMTP_PORT")
    SMTP_USER: str | None = Field(default=None, env="SMTP_USER")
    SMTP_PASSWORD: str | None = Field(default=None, env="SMTP_PASSWORD")
    SMTP_FROM: str = Field(default="noreply@logidata.ai", env="SMTP_FROM")

    # Rate Limiting
    RATE_LIMIT_PER_MINUTE: int = Field(default=60, env="RATE_LIMIT_PER_MINUTE")

    # File Upload
    MAX_UPLOAD_SIZE_MB: int = Field(default=100, env="MAX_UPLOAD_SIZE_MB")

    # Data Retention
    EXECUTION_RETENTION_DAYS: int = Field(default=90, env="EXECUTION_RETENTION_DAYS")
    LOG_RETENTION_DAYS: int = Field(default=30, env="LOG_RETENTION_DAYS")
    AUDIT_RETENTION_DAYS: int = Field(default=180, env="AUDIT_RETENTION_DAYS")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    @property
    def is_production(self) -> bool:
        """Check if running in production"""
        return self.ENVIRONMENT == "production"

    @property
    def is_development(self) -> bool:
        """Check if running in development"""
        return self.ENVIRONMENT == "development"


# Create settings instance
settings = Settings()
