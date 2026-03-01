"""Workspace CRUD endpoints."""

from __future__ import annotations

from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status

from src.dependencies import get_current_user
from src.models.schemas import WorkspaceCreate, WorkspaceResponse
from src.services.supabase import get_supabase_client

router = APIRouter()


@router.get("/", response_model=list[WorkspaceResponse])
async def list_workspaces(user: dict = Depends(get_current_user)):
    """List workspaces the current user belongs to."""
    supabase = get_supabase_client()
    user_id = user["sub"]
    result = (
        supabase.table("workspace_members")
        .select("workspace_id, workspaces(*)")
        .eq("user_id", user_id)
        .execute()
    )
    return [row["workspaces"] for row in result.data]


@router.post("/", response_model=WorkspaceResponse, status_code=status.HTTP_201_CREATED)
async def create_workspace(
    workspace: WorkspaceCreate,
    user: dict = Depends(get_current_user),
):
    """Create a new workspace."""
    supabase = get_supabase_client()
    user_id = user["sub"]

    result = supabase.table("workspaces").insert({
        "name": workspace.name,
        "owner_id": user_id,
    }).execute()

    ws = result.data[0]

    # Add owner as workspace member
    supabase.table("workspace_members").insert({
        "workspace_id": ws["id"],
        "user_id": user_id,
        "role": "owner",
    }).execute()

    return ws
