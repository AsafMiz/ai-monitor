"""Pydantic models for API request/response validation."""

from uuid import UUID
from datetime import datetime
from pydantic import BaseModel


# --- Workspace ---

class WorkspaceCreate(BaseModel):
    name: str


class WorkspaceResponse(BaseModel):
    id: UUID
    name: str
    owner_id: UUID
    stripe_customer_id: str | None = None
    subscription_status: str = "trialing"
    agent_limit: int = 5
    created_at: datetime
    updated_at: datetime


# --- Agent ---

class AgentCreate(BaseModel):
    workspace_id: UUID
    name: str
    role: str
    backstory: str | None = None
    goal: str | None = None
    personality_traits: dict = {}
    tools: list[str] = []


class AgentUpdate(BaseModel):
    name: str | None = None
    role: str | None = None
    backstory: str | None = None
    goal: str | None = None
    personality_traits: dict | None = None
    tools: list[str] | None = None
    is_active: bool | None = None


class AgentResponse(BaseModel):
    id: UUID
    workspace_id: UUID
    name: str
    role: str
    backstory: str | None = None
    goal: str | None = None
    personality_traits: dict = {}
    tools: list[str] = []
    is_active: bool = True
    created_at: datetime
    updated_at: datetime
