"""Pydantic models for API request/response validation."""

from typing import Dict, List, Optional
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
    stripe_customer_id: Optional[str] = None
    subscription_status: str = "trialing"
    agent_limit: int = 5
    created_at: datetime
    updated_at: datetime


# --- Agent ---

class AgentCreate(BaseModel):
    workspace_id: UUID
    name: str
    role: str
    backstory: Optional[str] = None
    goal: Optional[str] = None
    personality_traits: Dict = {}
    tools: List[str] = []


class AgentUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[str] = None
    backstory: Optional[str] = None
    goal: Optional[str] = None
    personality_traits: Optional[Dict] = None
    tools: Optional[List[str]] = None
    is_active: Optional[bool] = None


class AgentResponse(BaseModel):
    id: UUID
    workspace_id: UUID
    name: str
    role: str
    backstory: Optional[str] = None
    goal: Optional[str] = None
    personality_traits: Dict = {}
    tools: List[str] = []
    is_active: bool = True
    created_at: datetime
    updated_at: datetime
