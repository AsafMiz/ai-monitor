"""Application configuration from environment variables."""

from __future__ import annotations

from typing import List
import os
from dotenv import load_dotenv

load_dotenv()


def _normalize_url(url: str) -> str:
    """Ensure a URL has a scheme prefix (defaults to https://)."""
    url = url.strip().rstrip("/")
    if not url:
        return url
    if url.startswith("http://") or url.startswith("https://"):
        return url
    return f"https://{url}"


class Settings:
    SUPABASE_URL: str = _normalize_url(os.getenv("NEXT_PUBLIC_SUPABASE_URL", ""))
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "")
    STRIPE_SECRET_KEY: str = os.getenv("STRIPE_SECRET_KEY", "")
    STRIPE_WEBHOOK_SECRET: str = os.getenv("STRIPE_WEBHOOK_SECRET", "")
    CORS_ORIGINS: List[str] = [_normalize_url(o) for o in os.getenv("CORS_ORIGINS", "http://localhost:3000").split(",") if o.strip()]
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")


settings = Settings()
