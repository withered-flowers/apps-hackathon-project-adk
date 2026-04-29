"""Unit tests for multi-user isolation features.

Tests cover:
  (a) 50-decision limit enforcement per permanent user
  (b) Stealth 404 on session ownership mismatch
  (c) Guest (anonymous) shared pool access
  (d) Auth dependency behaviour
"""

from __future__ import annotations

from unittest.mock import AsyncMock, MagicMock, patch

import pytest
from fastapi import HTTPException

from app.core.auth import get_current_user_id
from app.services.decision_service import (
    MAX_DECISIONS_PER_USER,
    _enforce_decision_limit,
)


# ── (a) 50-decision limit ─────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_enforce_decision_limit_under_limit():
    """Users with fewer than 50 sessions should be allowed to create more."""
    with patch(
        "app.services.decision_service.count_user_sessions",
        new_callable=AsyncMock,
        return_value=10,
    ):
        # Should not raise
        await _enforce_decision_limit("uid_permanent_user")


@pytest.mark.asyncio
async def test_enforce_decision_limit_at_limit():
    """Users at exactly 50 sessions should be blocked."""
    with patch(
        "app.services.decision_service.count_user_sessions",
        new_callable=AsyncMock,
        return_value=MAX_DECISIONS_PER_USER,
    ):
        with pytest.raises(ValueError, match="maximum"):
            await _enforce_decision_limit("uid_permanent_user")


@pytest.mark.asyncio
async def test_enforce_decision_limit_over_limit():
    """Users over 50 sessions should be blocked."""
    with patch(
        "app.services.decision_service.count_user_sessions",
        new_callable=AsyncMock,
        return_value=MAX_DECISIONS_PER_USER + 5,
    ):
        with pytest.raises(ValueError, match="maximum"):
            await _enforce_decision_limit("uid_permanent_user")


@pytest.mark.asyncio
async def test_enforce_decision_limit_anonymous_exempt():
    """Anonymous users should never be limited."""
    # count_user_sessions should NOT even be called for anonymous
    with patch(
        "app.services.decision_service.count_user_sessions",
        new_callable=AsyncMock,
    ) as mock_count:
        await _enforce_decision_limit("anonymous")
        mock_count.assert_not_called()


# ── (b) Stealth 404 on ownership mismatch ──────────────────────────────────────


@pytest.mark.asyncio
async def test_verify_session_ownership_match():
    """Owner should be able to access their session."""
    from app.api.routes import _verify_session_ownership

    mock_session = {"session_id": "s1", "user_id": "uid_alice", "status": "Interviewing"}
    with patch(
        "app.api.routes.get_session",
        new_callable=AsyncMock,
        return_value=mock_session,
    ):
        result = await _verify_session_ownership("s1", "uid_alice")
        assert result == mock_session


@pytest.mark.asyncio
async def test_verify_session_ownership_mismatch():
    """Non-owner should get a 404 (stealth — not 403)."""
    from app.api.routes import _verify_session_ownership

    mock_session = {"session_id": "s1", "user_id": "uid_alice", "status": "Interviewing"}
    with patch(
        "app.api.routes.get_session",
        new_callable=AsyncMock,
        return_value=mock_session,
    ):
        with pytest.raises(HTTPException) as exc_info:
            await _verify_session_ownership("s1", "uid_bob")
        assert exc_info.value.status_code == 404


@pytest.mark.asyncio
async def test_verify_session_ownership_not_found():
    """Non-existent session should return 404."""
    from app.api.routes import _verify_session_ownership

    with patch(
        "app.api.routes.get_session",
        new_callable=AsyncMock,
        return_value=None,
    ):
        with pytest.raises(HTTPException) as exc_info:
            await _verify_session_ownership("nonexistent", "uid_alice")
        assert exc_info.value.status_code == 404


# ── (c) Guest shared pool access ──────────────────────────────────────────────


@pytest.mark.asyncio
async def test_guest_accesses_anonymous_session():
    """Guest user (anonymous) should be able to access anonymous sessions."""
    from app.api.routes import _verify_session_ownership

    mock_session = {"session_id": "s1", "user_id": "anonymous", "status": "Complete"}
    with patch(
        "app.api.routes.get_session",
        new_callable=AsyncMock,
        return_value=mock_session,
    ):
        result = await _verify_session_ownership("s1", "anonymous")
        assert result == mock_session


@pytest.mark.asyncio
async def test_guest_cannot_access_permanent_session():
    """Guest should NOT be able to access a permanent user's session."""
    from app.api.routes import _verify_session_ownership

    mock_session = {"session_id": "s1", "user_id": "uid_alice", "status": "Complete"}
    with patch(
        "app.api.routes.get_session",
        new_callable=AsyncMock,
        return_value=mock_session,
    ):
        with pytest.raises(HTTPException) as exc_info:
            await _verify_session_ownership("s1", "anonymous")
        assert exc_info.value.status_code == 404


# ── (d) Auth dependency ───────────────────────────────────────────────────────


@pytest.mark.asyncio
async def test_get_current_user_id_no_header():
    """No Authorization header should return 'anonymous'."""
    mock_request = MagicMock()
    mock_request.headers = {}
    result = await get_current_user_id(mock_request)
    assert result == "anonymous"


@pytest.mark.asyncio
async def test_get_current_user_id_empty_bearer():
    """Empty Bearer token should return 'anonymous'."""
    mock_request = MagicMock()
    mock_request.headers = {"Authorization": "Bearer "}
    result = await get_current_user_id(mock_request)
    assert result == "anonymous"


@pytest.mark.asyncio
async def test_get_current_user_id_invalid_format():
    """Non-Bearer auth header should return 'anonymous'."""
    mock_request = MagicMock()
    mock_request.headers = {"Authorization": "Basic dXNlcjpwYXNz"}
    result = await get_current_user_id(mock_request)
    assert result == "anonymous"


@pytest.mark.asyncio
async def test_get_current_user_id_valid_token():
    """Valid Firebase token should return the user's UID."""
    mock_request = MagicMock()
    mock_request.headers = {"Authorization": "Bearer valid_token_123"}

    with (
        patch("app.core.auth._ensure_firebase_app"),
        patch(
            "app.core.auth.firebase_auth.verify_id_token",
            return_value={"uid": "uid_alice"},
        ),
    ):
        result = await get_current_user_id(mock_request)
        assert result == "uid_alice"


@pytest.mark.asyncio
async def test_get_current_user_id_anonymous_token_override():
    """Valid Firebase token with anonymous provider should be overridden to 'anonymous'."""
    mock_request = MagicMock()
    mock_request.headers = {"Authorization": "Bearer valid_anon_token_123"}

    with (
        patch("app.core.auth._ensure_firebase_app"),
        patch(
            "app.core.auth.firebase_auth.verify_id_token",
            return_value={"uid": "unique_anon_123", "firebase": {"sign_in_provider": "anonymous"}},
        ),
    ):
        result = await get_current_user_id(mock_request)
        assert result == "anonymous"


@pytest.mark.asyncio
async def test_get_current_user_id_permanent_user_token():
    """Valid Firebase token for a permanent user should NOT be overridden."""
    mock_request = MagicMock()
    mock_request.headers = {"Authorization": "Bearer valid_perm_token_123"}

    with (
        patch("app.core.auth._ensure_firebase_app"),
        patch(
            "app.core.auth.firebase_auth.verify_id_token",
            return_value={"uid": "uid_alice", "firebase": {"sign_in_provider": "password"}},
        ),
    ):
        result = await get_current_user_id(mock_request)
        assert result == "uid_alice"


@pytest.mark.asyncio
async def test_get_current_user_id_expired_token():
    """Expired/invalid token should return 'anonymous' (not crash)."""
    mock_request = MagicMock()
    mock_request.headers = {"Authorization": "Bearer expired_token"}

    with (
        patch("app.core.auth._ensure_firebase_app"),
        patch(
            "app.core.auth.firebase_auth.verify_id_token",
            side_effect=Exception("Token expired"),
        ),
    ):
        result = await get_current_user_id(mock_request)
        assert result == "anonymous"
