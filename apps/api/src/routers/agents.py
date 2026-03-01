"""Agent (worker) CRUD endpoints."""

from __future__ import annotations

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status

from src.dependencies import get_current_user
from src.models.schemas import AgentCreate, AgentUpdate, AgentResponse
from src.services.supabase import get_supabase_client

router = APIRouter()


@router.get("/", response_model=list[AgentResponse])
async def list_agents(
    workspace_id: UUID,
    user: dict = Depends(get_current_user),
):
    """List all agents in a workspace."""
    supabase = get_supabase_client()
    result = supabase.table("agents").select("*").eq("workspace_id", str(workspace_id)).execute()
    return result.data


@router.post("/", response_model=AgentResponse, status_code=status.HTTP_201_CREATED)
async def create_agent(
    agent: AgentCreate,
    user: dict = Depends(get_current_user),
):
    """Create a new agent (worker) in a workspace."""
    supabase = get_supabase_client()

    # Check agent limit
    existing = supabase.table("agents").select("id").eq("workspace_id", str(agent.workspace_id)).execute()
    workspace = supabase.table("workspaces").select("agent_limit, subscription_status").eq("id", str(agent.workspace_id)).single().execute()

    if workspace.data["subscription_status"] not in ("active", "trialing"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Active subscription required")

    if len(existing.data) >= workspace.data["agent_limit"]:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Agent limit reached")

    result = supabase.table("agents").insert(agent.model_dump(mode="json")).execute()
    return result.data[0]


@router.get("/{agent_id}", response_model=AgentResponse)
async def get_agent(
    agent_id: UUID,
    user: dict = Depends(get_current_user),
):
    """Get a specific agent by ID."""
    supabase = get_supabase_client()
    result = supabase.table("agents").select("*").eq("id", str(agent_id)).single().execute()
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found")
    return result.data


@router.patch("/{agent_id}", response_model=AgentResponse)
async def update_agent(
    agent_id: UUID,
    agent: AgentUpdate,
    user: dict = Depends(get_current_user),
):
    """Update an agent's configuration."""
    supabase = get_supabase_client()
    result = supabase.table("agents").update(agent.model_dump(mode="json", exclude_unset=True)).eq("id", str(agent_id)).execute()
    if not result.data:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Agent not found")
    return result.data[0]


@router.delete("/{agent_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_agent(
    agent_id: UUID,
    user: dict = Depends(get_current_user),
):
    """Delete an agent."""
    supabase = get_supabase_client()
    supabase.table("agents").delete().eq("id", str(agent_id)).execute()
