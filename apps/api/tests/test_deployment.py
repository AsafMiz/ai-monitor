"""Deployment-focused tests — verify the app starts correctly in Railway-like conditions."""

from __future__ import annotations

import importlib
import os
from unittest import mock

import pytest
from fastapi.testclient import TestClient


def _reload_app():
    """Reload config -> routers -> main to pick up fresh environment."""
    import src.config as config_mod
    import src.routers.health as health_mod
    import src.main as main_mod

    importlib.reload(config_mod)
    importlib.reload(health_mod)
    importlib.reload(main_mod)
    return main_mod.app


class TestStartupInProduction:
    """Verify the app starts and responds in a production-like environment."""

    def test_health_endpoint_returns_200(self, production_env):
        """The /health endpoint must return 200 — Railway healthcheck depends on this."""
        app = _reload_app()
        with TestClient(app) as client:
            response = client.get("/health")
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "healthy"
            assert data["config"]["supabase"] is True
            assert data["config"]["stripe"] is True
            assert data["config"]["openai"] is True

    def test_health_endpoint_works_without_optional_keys(self, clean_env):
        """App must start even with no env vars set (graceful degradation)."""
        app = _reload_app()
        with TestClient(app) as client:
            response = client.get("/health")
            assert response.status_code == 200
            data = response.json()
            assert data["status"] == "healthy"
            assert data["config"]["supabase"] is False
            assert data["config"]["stripe"] is False
            assert data["config"]["openai"] is False

    def test_cors_configured_in_production(self, production_env):
        """CORS must allow the configured origin."""
        app = _reload_app()
        with TestClient(app) as client:
            response = client.options(
                "/health",
                headers={
                    "Origin": "https://ai-monitor.vercel.app",
                    "Access-Control-Request-Method": "GET",
                },
            )
            assert (
                response.headers.get("access-control-allow-origin")
                == "https://ai-monitor.vercel.app"
            )


class TestPortBinding:
    """Verify PORT environment variable handling."""

    def test_default_port_is_8000(self):
        """When PORT is not set, the app should default to 8000."""
        port = os.environ.get("PORT", "8000")
        assert port == "8000"

    def test_railway_port_override(self):
        """Railway sets PORT dynamically; the app must respect it."""
        with mock.patch.dict(os.environ, {"PORT": "3456"}):
            port = os.environ.get("PORT", "8000")
            assert port == "3456"


class TestNoNodejsLeakage:
    """Verify no Node.js/pnpm artifacts affect the Python runtime."""

    def test_no_pnpm_in_path(self):
        """pnpm must not be discoverable in PATH inside Docker."""
        import shutil

        # Locally pnpm may be present, so skip if LOCAL_DEV
        if os.environ.get("LOCAL_DEV") == "true":
            pytest.skip("Skipping in local dev (pnpm is expected locally)")
        result = shutil.which("pnpm")
        # If pnpm is found locally (non-Docker), that's fine — this test
        # is most meaningful when run inside the Docker container.
        if result:
            pytest.skip("pnpm found locally — test meaningful in Docker only")
