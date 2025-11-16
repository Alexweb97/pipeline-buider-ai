"""
Transforms API Routes
Endpoints for testing and previewing transformations
"""
from typing import Annotated, Literal

import pandas as pd
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from app.api.dependencies.auth import get_current_user
from app.api.dependencies.database import get_db
from app.core.code_executor import preview_transform
from app.db.models.user import User
from app.modules.transformers.sql_transform import preview_sql_transform

router = APIRouter()


class PreviewRequest(BaseModel):
    """Request model for transformation preview"""
    language: Literal['python', 'sql'] = Field(..., description="Transform language")
    code: str = Field(..., description="Transformation code or query")
    sample_data: list[dict] = Field(..., description="Sample input data")
    sample_size: int = Field(default=100, ge=1, le=1000, description="Number of rows to preview")


class PreviewResponse(BaseModel):
    """Response model for transformation preview"""
    success: bool
    input_shape: list[int] | None = None
    output_shape: list[int] | None = None
    input_columns: list[str] | None = None
    output_columns: list[str] | None = None
    preview_data: list[dict] | None = None
    schema: dict | None = None
    statistics: dict | None = None
    error: str | None = None
    error_type: str | None = None


class ValidateCodeRequest(BaseModel):
    """Request model for code validation"""
    code: str = Field(..., description="Code to validate")
    language: Literal['python', 'sql'] = Field(..., description="Code language")


class ValidateCodeResponse(BaseModel):
    """Response model for code validation"""
    valid: bool
    has_transform_function: bool | None = None
    has_return_statement: bool | None = None
    warnings: list[str] = []
    error: str | None = None
    line: int | None = None
    offset: int | None = None


@router.post("/preview", response_model=PreviewResponse)
async def preview_transformation(
    request: PreviewRequest,
    current_user: Annotated[User, Depends(get_current_user)] = None,
):
    """
    Preview a transformation on sample data

    This endpoint allows testing transformations before adding them to a pipeline.
    It executes the code on a sample of data and returns preview results.
    """
    try:
        # Convert sample data to DataFrame
        if not request.sample_data:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Sample data is required"
            )

        df = pd.DataFrame(request.sample_data)

        # Execute preview based on language
        if request.language == 'python':
            result = preview_transform(
                df=df,
                code=request.code,
                sample_size=request.sample_size
            )
        elif request.language == 'sql':
            result = preview_sql_transform(
                df=df,
                query=request.code,
                sample_size=request.sample_size
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported language: {request.language}"
            )

        return PreviewResponse(**result)

    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Preview failed: {str(e)}"
        )


@router.post("/validate", response_model=ValidateCodeResponse)
async def validate_code(
    request: ValidateCodeRequest,
    current_user: Annotated[User, Depends(get_current_user)] = None,
):
    """
    Validate transformation code without executing it

    Performs static analysis to check for syntax errors and basic structure.
    """
    try:
        if request.language == 'python':
            from app.core.code_executor import CodeExecutor
            executor = CodeExecutor()
            result = executor.validate_code(request.code)
            return ValidateCodeResponse(**result)

        elif request.language == 'sql':
            # Basic SQL validation (just check if it's not empty)
            # DuckDB will validate it properly during execution
            return ValidateCodeResponse(
                valid=bool(request.code.strip()),
                warnings=[] if request.code.strip() else ["Query is empty"]
            )

        else:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported language: {request.language}"
            )

    except Exception as e:
        return ValidateCodeResponse(
            valid=False,
            error=str(e)
        )


@router.get("/template/{language}")
async def get_template(
    language: Literal['python', 'sql'],
    current_user: Annotated[User, Depends(get_current_user)] = None,
):
    """
    Get a code template for the specified language

    Returns a starter template with example code.
    """
    if language == 'python':
        from app.core.code_executor import CodeExecutor
        template = CodeExecutor.get_sample_template()
    elif language == 'sql':
        template = """SELECT
    *,
    -- Add your transformations here
    column1 * 2 AS calculated_column,
    CASE
        WHEN column2 > 100 THEN 'High'
        WHEN column2 > 50 THEN 'Medium'
        ELSE 'Low'
    END AS category
FROM input
WHERE column1 IS NOT NULL
ORDER BY column1 DESC
LIMIT 1000"""
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported language: {language}"
        )

    return {
        "language": language,
        "template": template
    }
