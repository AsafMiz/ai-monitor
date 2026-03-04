"""Tests for config module — placeholder detection, URL normalization, env reading."""

from __future__ import annotations

import os
from unittest import mock

import pytest


# ---------------------------------------------------------------------------
# Import helpers directly so we can test them in isolation without
# triggering module-level side effects from re-importing config.
# ---------------------------------------------------------------------------

from src.config import _is_placeholder, _normalize_url


# ===== _is_placeholder =====


class TestIsPlaceholder:
    """Placeholder values should be detected and rejected."""

    @pytest.mark.parametrize(
        "value",
        [
            "your-jwt-secret",
            "your_api_key",
            "Your-Supabase-Url",
            "sk_test_xxx",
            "sk_test_xxxx",
            "whsec_xxx",
            "whsec_xxxxx",
            "price_xxx",
            "price_xxxx",
            "<paste-your-key-here>",
            "<YOUR_KEY>",
            "https://your-project.supabase.co",
            "https://Your-Project.supabase.co",
            "",
            "   ",
        ],
    )
    def test_catches_placeholders(self, value: str) -> None:
        assert _is_placeholder(value) is True

    @pytest.mark.parametrize(
        "value",
        [
            "sk_test_realkey1234567890abcdef",  # real-format Stripe test key
            "sk_live_abc123",
            "whsec_t8GKjkLe9fAqzCmGpIhPOaXb",  # real-looking webhook secret
            "price_1NqRjK2eZvKYlo2C",  # real Stripe price ID
            "https://xyzabc.supabase.co",
            "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9",  # JWT-like
            "my-real-openai-key-that-starts-with-sk",
            "http://localhost:3000",
        ],
    )
    def test_allows_real_values(self, value: str) -> None:
        assert _is_placeholder(value) is False


# ===== _normalize_url =====


class TestNormalizeUrl:
    def test_adds_https_to_bare_domain(self) -> None:
        assert _normalize_url("example.com") == "https://example.com"

    def test_preserves_existing_https(self) -> None:
        assert _normalize_url("https://example.com") == "https://example.com"

    def test_preserves_existing_http(self) -> None:
        assert _normalize_url("http://localhost:3000") == "http://localhost:3000"

    def test_strips_trailing_slash(self) -> None:
        assert _normalize_url("https://example.com/") == "https://example.com"

    def test_strips_bom(self) -> None:
        assert _normalize_url("\ufeffhttps://example.com") == "https://example.com"

    def test_strips_zero_width_spaces(self) -> None:
        assert _normalize_url("\u200bhttps://example.com\u200b") == "https://example.com"

    def test_strips_nbsp(self) -> None:
        assert _normalize_url("\u00a0https://example.com\u00a0") == "https://example.com"

    def test_strips_mixed_invisible_chars(self) -> None:
        url = "\ufeff\u200b\u00a0https://abc.supabase.co\u200d\u00a0"
        assert _normalize_url(url) == "https://abc.supabase.co"

    def test_empty_returns_empty(self) -> None:
        assert _normalize_url("") == ""

    def test_whitespace_only_returns_empty(self) -> None:
        assert _normalize_url("   ") == ""


# ===== _get_env (via environment manipulation) =====


class TestGetEnv:
    """Test _get_env by setting real env vars and re-importing."""

    def test_returns_real_value(self) -> None:
        from src.config import _get_env

        with mock.patch.dict(os.environ, {"TEST_VAR": "real-value"}):
            assert _get_env("TEST_VAR") == "real-value"

    def test_rejects_placeholder_your_prefix(self) -> None:
        from src.config import _get_env

        with mock.patch.dict(os.environ, {"TEST_VAR": "your-secret-key"}):
            assert _get_env("TEST_VAR", allow_empty=True) == ""

    def test_rejects_placeholder_angle_brackets(self) -> None:
        from src.config import _get_env

        with mock.patch.dict(os.environ, {"TEST_VAR": "<paste-here>"}):
            assert _get_env("TEST_VAR", allow_empty=True) == ""

    def test_missing_var_returns_empty(self) -> None:
        from src.config import _get_env

        with mock.patch.dict(os.environ, {}, clear=False):
            # Ensure the var doesn't exist
            os.environ.pop("NONEXISTENT_VAR_XYZ", None)
            assert _get_env("NONEXISTENT_VAR_XYZ", allow_empty=True) == ""

    def test_local_dev_cors_default(self) -> None:
        """When LOCAL_DEV is true and CORS_ORIGINS is unset, fall back to localhost."""
        from src.config import _get_env, _LOCALHOST_DEFAULTS

        # Temporarily patch IS_LOCAL
        import src.config as config_mod

        original = config_mod.IS_LOCAL
        try:
            config_mod.IS_LOCAL = True
            with mock.patch.dict(os.environ, {}, clear=False):
                os.environ.pop("CORS_ORIGINS", None)
                result = _get_env("CORS_ORIGINS")
                assert result == "http://localhost:3000"
        finally:
            config_mod.IS_LOCAL = original


# ===== Settings.validate =====


class TestSettingsValidate:
    def test_validate_returns_warnings_for_missing(self) -> None:
        from src.config import Settings

        s = Settings()
        # Settings are class-level, so we just test that validate() runs
        # and returns a list.
        warnings = s.validate()
        assert isinstance(warnings, list)

    def test_validate_reports_configured_keys(self, capsys: pytest.CaptureFixture) -> None:
        from src.config import Settings

        s = Settings()
        s.validate()
        captured = capsys.readouterr()
        assert "[config] LOCAL_DEV=" in captured.out
        assert "[config] Configured:" in captured.out
