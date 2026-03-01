"""Conversation endpoints (stub for Phase 2+)."""

from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def list_conversations():
    """List conversations - stub for Phase 2."""
    return {"message": "Conversations endpoint - coming in Phase 2"}
