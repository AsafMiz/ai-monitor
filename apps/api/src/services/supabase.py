"""Supabase client initialization."""

from __future__ import annotations

from supabase import create_client, Client
from src.config import settings

_client: Client | None = None


def get_supabase_client() -> Client:
    """Get or create a Supabase client using the service role key."""
    global _client
    if _client is None:
        if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
            raise RuntimeError(
                "Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
            )
        _client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_ROLE_KEY,
        )
    return _client
