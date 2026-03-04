"""Application configuration from environment variables."""

from __future__ import annotations

import os
import re
from typing import List

# Check LOCAL_DEV *before* loading dotenv so .env files are never
# loaded in production (Railway, Docker, etc.).
IS_LOCAL = os.getenv("LOCAL_DEV", "false").lower() in ("true", "1", "yes")

if IS_LOCAL:
    try:
        from dotenv import load_dotenv

        load_dotenv()
    except ImportError:
        pass  # python-dotenv is optional in production

# ---------------------------------------------------------------------------
# Placeholder detection
# ---------------------------------------------------------------------------

_PLACEHOLDER_PATTERNS = [
    re.compile(r"^your[_-]", re.IGNORECASE),  # your-jwt-secret, your_key
    re.compile(r"^sk_test_x{3,}$"),  # sk_test_xxx
    re.compile(r"^whsec_x{3,}$"),  # whsec_xxx
    re.compile(r"^price_x{3,}$"),  # price_xxx
    re.compile(r"^<.*>$"),  # <paste-here>
    re.compile(r"^https?://your[_-]", re.IGNORECASE),  # https://your-project.supabase.co
]

_LOCALHOST_DEFAULTS = {
    "CORS_ORIGINS": "http://localhost:3000",
}


def _is_placeholder(value: str) -> bool:
    """Return True if *value* looks like a template placeholder."""
    v = value.strip()
    if not v:
        return True
    for pat in _PLACEHOLDER_PATTERNS:
        if pat.match(v):
            return True
    return False


# ---------------------------------------------------------------------------
# URL normalization
# ---------------------------------------------------------------------------


def _normalize_url(url: str) -> str:
    """Ensure a URL has a scheme prefix (defaults to ``https://``).

    Strips invisible characters (BOM, zero-width spaces, NBSP) that
    sometimes sneak in from copy-paste.
    """
    url = re.sub(r"^[\s\u200b\u200c\u200d\ufeff\u00a0]+", "", url)
    url = re.sub(r"[\s\u200b\u200c\u200d\ufeff\u00a0]+$", "", url)
    url = url.rstrip("/")
    if not url:
        return url
    if re.match(r"^https?://", url, re.IGNORECASE):
        return url
    return f"https://{url}"


# ---------------------------------------------------------------------------
# Environment reading
# ---------------------------------------------------------------------------


def _get_env(name: str, *, allow_empty: bool = False) -> str:
    """Read an environment variable, rejecting placeholder values.

    When ``LOCAL_DEV=true`` and the variable has a localhost default,
    that default is returned instead of raising / warning.
    """
    value = os.getenv(name, "")

    # Real, non-placeholder value — use it.
    if value and not _is_placeholder(value):
        return value

    # In local-dev mode, fall back to localhost defaults.
    if IS_LOCAL and name in _LOCALHOST_DEFAULTS:
        return _LOCALHOST_DEFAULTS[name]

    # Warn about placeholders being silently ignored.
    if not allow_empty:
        if value and _is_placeholder(value):
            print(
                f"WARNING: {name} contains a placeholder value "
                f"'{value}' -- ignoring it."
            )
        elif not value:
            print(
                f"WARNING: {name} is not set. "
                f"Set it in your environment or use LOCAL_DEV=true for development."
            )
    return ""


# ---------------------------------------------------------------------------
# Settings
# ---------------------------------------------------------------------------


class Settings:
    """Validated application settings built from environment variables."""

    LOCAL_DEV: bool = IS_LOCAL
    SUPABASE_URL: str = _normalize_url(
        _get_env("NEXT_PUBLIC_SUPABASE_URL", allow_empty=True)
    )
    SUPABASE_SERVICE_ROLE_KEY: str = _get_env(
        "SUPABASE_SERVICE_ROLE_KEY", allow_empty=True
    )
    SUPABASE_JWT_SECRET: str = _get_env("SUPABASE_JWT_SECRET", allow_empty=True)
    STRIPE_SECRET_KEY: str = _get_env("STRIPE_SECRET_KEY", allow_empty=True)
    STRIPE_WEBHOOK_SECRET: str = _get_env("STRIPE_WEBHOOK_SECRET", allow_empty=True)
    CORS_ORIGINS: List[str] = [
        _normalize_url(o) for o in _get_env("CORS_ORIGINS").split(",") if o.strip()
    ]
    OPENAI_API_KEY: str = _get_env("OPENAI_API_KEY", allow_empty=True)

    def validate(self) -> list[str]:
        """Log configuration status at startup. Returns a list of warnings."""
        warnings: list[str] = []
        configured: list[str] = []

        # Core settings — warn if missing
        for name, attr in [
            ("SUPABASE_URL", self.SUPABASE_URL),
            ("SUPABASE_SERVICE_ROLE_KEY", self.SUPABASE_SERVICE_ROLE_KEY),
            ("SUPABASE_JWT_SECRET", self.SUPABASE_JWT_SECRET),
            ("CORS_ORIGINS", ",".join(self.CORS_ORIGINS)),
        ]:
            if attr:
                configured.append(name)
            else:
                warnings.append(f"{name} is not configured")

        # Optional settings — info only
        optional_missing: list[str] = []
        for name, attr in [
            ("STRIPE_SECRET_KEY", self.STRIPE_SECRET_KEY),
            ("STRIPE_WEBHOOK_SECRET", self.STRIPE_WEBHOOK_SECRET),
            ("OPENAI_API_KEY", self.OPENAI_API_KEY),
        ]:
            if attr:
                configured.append(name)
            else:
                optional_missing.append(name)

        print(f"[config] LOCAL_DEV={self.LOCAL_DEV}")
        print(
            f"[config] Configured: "
            f"{', '.join(configured) if configured else 'none'}"
        )
        if warnings:
            print(f"[config] Missing: {'; '.join(warnings)}")
        if optional_missing:
            print(f"[config] Optional (not set): {', '.join(optional_missing)}")

        return warnings


settings = Settings()
