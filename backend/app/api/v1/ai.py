"""
AI API Routes
Endpoints for AI-powered pipeline generation and assistance
"""
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.dependencies.database import get_db
from app.api.dependencies.auth import get_current_user
from app.db.models.user import User
from app.schemas.ai import (
    AIGenerateRequest,
    AIGenerateResponse,
    AIImproveRequest,
    AIImproveResponse,
    AIExplainRequest,
    AIExplainResponse,
)
from app.services.ai_service import AIService

router = APIRouter()


@router.post("/generate", response_model=AIGenerateResponse)
def generate_pipeline(
    request: AIGenerateRequest,
    db: Annotated[Session, Depends(get_db)] = None,
    current_user: Annotated[User, Depends(get_current_user)] = None,
):
    """
    Generate a pipeline configuration from natural language description

    This endpoint uses AI to convert a text description into a complete
    pipeline configuration with nodes and edges.

    Example prompt: "Create a pipeline that fetches data from the GitHub API,
    filters repositories with more than 100 stars, and saves to CSV"
    """
    try:
        pipeline_config = AIService.generate_pipeline(request.prompt)
        return AIGenerateResponse(**pipeline_config)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        ) from e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate pipeline: {str(e)}"
        ) from e


@router.post("/improve", response_model=AIImproveResponse)
def improve_pipeline(
    request: AIImproveRequest,
    db: Annotated[Session, Depends(get_db)] = None,
    current_user: Annotated[User, Depends(get_current_user)] = None,
):
    """
    Improve an existing pipeline configuration based on user feedback

    Use this endpoint to modify an existing pipeline based on natural
    language instructions.

    Example: "Add error handling" or "Add a data quality check before loading"
    """
    try:
        improved_config = AIService.improve_pipeline(
            request.current_config,
            request.improvement_request
        )
        return AIImproveResponse(**improved_config)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        ) from e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to improve pipeline: {str(e)}"
        ) from e


@router.post("/explain", response_model=AIExplainResponse)
def explain_pipeline(
    request: AIExplainRequest,
    db: Annotated[Session, Depends(get_db)] = None,
    current_user: Annotated[User, Depends(get_current_user)] = None,
):
    """
    Get a natural language explanation of a pipeline configuration

    Use this endpoint to understand what a pipeline does in plain English.
    """
    try:
        explanation = AIService.explain_pipeline(request.config)
        return AIExplainResponse(explanation=explanation)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        ) from e
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to explain pipeline: {str(e)}"
        ) from e
