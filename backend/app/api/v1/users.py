"""User API Routes"""
from fastapi import APIRouter

router = APIRouter()

@router.get("")
async def list_users():
    """List all users"""
    return {"users": [], "total": 0}

@router.get("/{user_id}")
async def get_user(user_id: str):
    """Get user by ID"""
    return {"id": user_id, "username": "demo_user"}
