"""
ETL/ELT Builder - Main FastAPI Application
"""
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
import structlog

from app.config import settings
from app.api.v1 import auth, users, pipelines, executions, connections, modules
from app.api import websocket
from app.db.session import engine
from app.db.base import Base

# Configure structured logging
structlog.configure(
    processors=[
        structlog.processors.TimeStamper(fmt="iso"),
        structlog.stdlib.add_log_level,
        structlog.processors.JSONRenderer(),
    ]
)
logger = structlog.get_logger()


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Startup and shutdown events"""
    # Startup
    logger.info("application_starting", version=settings.APP_VERSION)

    # Create database tables (using sync engine)
    with engine.begin() as conn:
        Base.metadata.create_all(bind=conn)

    logger.info("database_initialized")

    yield

    # Shutdown
    logger.info("application_shutting_down")
    engine.dispose()


# Initialize FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Plateforme modulaire de pipelines ETL/ELT avec IA",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# GZip Middleware
app.add_middleware(GZipMiddleware, minimum_size=1000)


# Health check endpoints
@app.get("/health", tags=["health"])
async def health_check():
    """Basic health check"""
    return {"status": "healthy", "version": settings.APP_VERSION}


@app.get("/health/ready", tags=["health"])
async def readiness_check():
    """Readiness probe for Kubernetes"""
    # TODO: Check database connection
    # TODO: Check Redis connection
    return {"status": "ready"}


@app.get("/health/live", tags=["health"])
async def liveness_check():
    """Liveness probe for Kubernetes"""
    return {"status": "alive"}


# API Routes
app.include_router(
    auth.router,
    prefix="/api/v1/auth",
    tags=["authentication"]
)

app.include_router(
    users.router,
    prefix="/api/v1/users",
    tags=["users"]
)

app.include_router(
    pipelines.router,
    prefix="/api/v1/pipelines",
    tags=["pipelines"]
)

app.include_router(
    executions.router,
    prefix="/api/v1/executions",
    tags=["executions"]
)

app.include_router(
    connections.router,
    prefix="/api/v1/connections",
    tags=["connections"]
)

app.include_router(
    modules.router,
    prefix="/api/v1/modules",
    tags=["modules"]
)

# WebSocket endpoint
app.include_router(
    websocket.router,
    prefix="/ws",
    tags=["websocket"]
)


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Handle all unhandled exceptions"""
    logger.error(
        "unhandled_exception",
        path=request.url.path,
        method=request.method,
        error=str(exc),
    )
    return JSONResponse(
        status_code=500,
        content={
            "detail": "Internal server error" if not settings.DEBUG else str(exc)
        },
    )


# Root endpoint
@app.get("/", tags=["root"])
async def root():
    """Root endpoint"""
    return {
        "name": settings.APP_NAME,
        "version": settings.APP_VERSION,
        "docs": "/docs",
        "health": "/health",
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower(),
    )
