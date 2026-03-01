"""JWT authentication service for Supabase tokens."""

from __future__ import annotations

import jwt
from src.config import settings


def verify_token(token: str) -> dict | None:
    """Verify a Supabase JWT and return the decoded payload."""
    try:
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            audience="authenticated",
        )
        return payload
    except jwt.PyJWTError:
        return None
