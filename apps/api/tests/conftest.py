"""Shared pytest fixtures for the AI Monitor API test suite."""

from __future__ import annotations

import os
from unittest import mock

import pytest
from fastapi.testclient import TestClient


@pytest.fixture()
def clean_env():
    """Provide a clean environment with no config-related vars set."""
    config_vars = [
        "LOCAL_DEV",
        "NEXT_PUBLIC_SUPABASE_URL",
        "SUPABASE_SERVICE_ROLE_KEY",
        "SUPABASE_JWT_SECRET",
        "STRIPE_SECRET_KEY",
        "STRIPE_WEBHOOK_SECRET",
        "CORS_ORIGINS",
        "OPENAI_API_KEY",
    ]
    cleaned = {k: v for k, v in os.environ.items() if k not in config_vars}
    with mock.patch.dict(os.environ, cleaned, clear=True):
        yield


@pytest.fixture()
def production_env():
    """Simulate a Railway production environment with all vars set."""
    env = {
        "LOCAL_DEV": "false",
        "NEXT_PUBLIC_SUPABASE_URL": "https://test-project.supabase.co",
        "SUPABASE_SERVICE_ROLE_KEY": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.test-key",
        "SUPABASE_JWT_SECRET": "super-secret-jwt-key-for-testing",
        "STRIPE_SECRET_KEY": "sk_test_realkey1234567890abcdef",
        "STRIPE_WEBHOOK_SECRET": "whsec_t8GKjkLe9fAqzCmGpIhPOaXb",
        "CORS_ORIGINS": "https://ai-monitor.vercel.app",
        "OPENAI_API_KEY": "sk-test-openai-key-1234567890",
        "PORT": "8000",
    }
    with mock.patch.dict(os.environ, env, clear=True):
        yield env


@pytest.fixture()
def local_dev_env():
    """Simulate a local development environment."""
    env = {
        "LOCAL_DEV": "true",
        "PORT": "8000",
    }
    with mock.patch.dict(os.environ, env, clear=True):
        yield env


@pytest.fixture()
def test_client():
    """FastAPI TestClient for integration tests."""
    from src.main import app

    with TestClient(app) as client:
        yield client
