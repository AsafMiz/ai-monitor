"""Health check endpoint."""

from fastapi import APIRouter
from src.config import settings

router = APIRouter()


@router.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "ai-monitor-api",
        "version": "0.1.0",
        "config": {
            "supabase": bool(settings.SUPABASE_URL),
            "stripe": bool(settings.STRIPE_SECRET_KEY),
            "openai": bool(settings.OPENAI_API_KEY),
            "cors_origins": settings.CORS_ORIGINS,
        },
    }
