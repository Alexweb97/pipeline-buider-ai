"""
AI API Schemas
"""
from typing import Any, Dict, Optional
from pydantic import BaseModel, Field


class AIGenerateRequest(BaseModel):
    """Request schema for AI pipeline generation"""
    prompt: str = Field(..., min_length=10, max_length=1000, description="Natural language description of the pipeline")


class AIImproveRequest(BaseModel):
    """Request schema for AI pipeline improvement"""
    current_config: Dict[str, Any] = Field(..., description="Current pipeline configuration")
    improvement_request: str = Field(..., min_length=5, max_length=500, description="Requested improvement")


class AIExplainRequest(BaseModel):
    """Request schema for AI pipeline explanation"""
    config: Dict[str, Any] = Field(..., description="Pipeline configuration to explain")


class AIGenerateResponse(BaseModel):
    """Response schema for AI pipeline generation"""
    name: str
    description: str
    type: str
    nodes: list[Dict[str, Any]]
    edges: list[Dict[str, Any]]


class AIImproveResponse(BaseModel):
    """Response schema for AI pipeline improvement"""
    name: Optional[str] = None
    description: Optional[str] = None
    type: Optional[str] = None
    nodes: list[Dict[str, Any]]
    edges: list[Dict[str, Any]]


class AIExplainResponse(BaseModel):
    """Response schema for AI pipeline explanation"""
    explanation: str = Field(..., description="Natural language explanation of the pipeline")
