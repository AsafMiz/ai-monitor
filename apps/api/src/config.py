"""Application configuration from environment variables."""

from __future__ import annotations

import re
from typing import List
import os
from dotenv import load_dotenv

load_dotenv()

# Local development flag — set LOCAL_DEV=true in .env.local for local dev
IS_LOCAL = os.getenv("LOCAL_DEV", "false").lower() in ("true", "1", "yes")

_LOCALHOST_DEFAULTS = {
    "CORS_ORIGINS": "http://localhost:3000",
}


def _normalize_url(url: str) -> str:
    """Ensure a URL has a scheme prefix (defaults to https://)."""
    # Strip invisible chars (BOM, zero-width spaces, NBSP) from copy-paste
    url = re.sub(r'^[\s\u200b\u200c\u200d\ufeff\u00a0]+', '', url)
    url = re.sub(r'[\s\u200b\u200c\u200d\ufeff\u00a0]+$', '', url)
    url = url.rstrip("/")
    if not url:
        return url
    if re.match(r'^https?://', url, re.IGNORECASE):
        return url
    return f"https://{url}"


def _require_env(name: str, allow_empty: bool = False) -> str:
    """Get an env var, falling back to localhost only if LOCAL_DEV=true."""
    value = os.getenv(name, "")
    if value:
        return value
    if IS_LOCAL and name in _LOCALHOST_DEFAULTS:
        return _LOCALHOST_DEFAULTS[name]
    if not allow_empty:
        print(f"WARNING: {name} is not set. Set it in your environment or use LOCAL_DEV=true for development.")
    return ""


class Settings:
    LOCAL_DEV: bool = IS_LOCAL
    SUPABASE_URL: str = _normalize_url(_require_env("NEXT_PUBLIC_SUPABASE_URL", allow_empty=True))
    SUPABASE_SERVICE_ROLE_KEY: str = _require_env("SUPABASE_SERVICE_ROLE_KEY", allow_empty=True)
    SUPABASE_JWT_SECRET: str = _require_env("SUPABASE_JWT_SECRET", allow_empty=True)
    STRIPE_SECRET_KEY: str = _require_env("STRIPE_SECRET_KEY", allow_empty=True)
    STRIPE_WEBHOOK_SECRET: str = _require_env("STRIPE_WEBHOOK_SECRET", allow_empty=True)
    CORS_ORIGINS: List[str] = [_normalize_url(o) for o in _require_env("CORS_ORIGINS").split(",") if o.strip()]
    OPENAI_API_KEY: str = _require_env("OPENAI_API_KEY", allow_empty=True)


settings = Settings()
