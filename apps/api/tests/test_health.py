"""Tests for the /health endpoint."""

from __future__ import annotations


class TestHealthEndpoint:
    def test_returns_200(self, test_client):
        response = test_client.get("/health")
        assert response.status_code == 200

    def test_response_structure(self, test_client):
        data = test_client.get("/health").json()
        assert data["status"] == "healthy"
        assert data["service"] == "ai-monitor-api"
        assert data["version"] == "0.1.0"
        assert "config" in data
        assert "supabase" in data["config"]
        assert "stripe" in data["config"]
        assert "openai" in data["config"]

    def test_config_values_are_booleans(self, test_client):
        data = test_client.get("/health").json()
        for key in ("supabase", "stripe", "openai"):
            assert isinstance(data["config"][key], bool)

    def test_unknown_route_returns_404(self, test_client):
        response = test_client.get("/nonexistent")
        assert response.status_code == 404

    def test_cors_headers_not_leaked(self, test_client):
        """The health endpoint should not expose CORS origins."""
        data = test_client.get("/health").json()
        assert "cors_origins" not in data.get("config", {})
