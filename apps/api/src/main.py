"""AI Monitor API - FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from src.config import settings
from src.routers import health, agents, workspaces, conversations


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Run startup validation and log configuration status."""
    settings.validate()
    yield


app = FastAPI(
    title="AI Monitor API",
    description="Backend API for AI Monitor agent management platform",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["health"])
app.include_router(workspaces.router, prefix="/workspaces", tags=["workspaces"])
app.include_router(agents.router, prefix="/agents", tags=["agents"])
app.include_router(conversations.router, prefix="/conversations", tags=["conversations"])
