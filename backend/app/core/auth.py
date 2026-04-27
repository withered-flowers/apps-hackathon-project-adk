"""Firebase Authentication dependency for FastAPI.

Provides token verification and user ID extraction from Authorization headers.
The dependency is *optional* — if no Authorization header is provided, the user
defaults to "anonymous" (the shared guest pool).
"""

from __future__ import annotations

from fastapi import Request
from firebase_admin import auth as firebase_auth
from firebase_admin import credentials, get_app, initialize_app

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger("core.auth")

# ── Firebase Admin SDK initialisation ────────────────────────────────────────

_firebase_initialised = False


def _ensure_firebase_app() -> None:
    """Lazy-init the Firebase Admin SDK exactly once."""
    global _firebase_initialised
    if _firebase_initialised:
        return
    try:
        get_app()
        _firebase_initialised = True
        return
    except ValueError:
        pass

    # When running on Cloud Run with GOOGLE_APPLICATION_CREDENTIALS already
    # set, Application Default Credentials are used automatically.
    cred = credentials.ApplicationDefault()
    initialize_app(cred, {"projectId": settings.google_cloud_project})
    _firebase_initialised = True
    logger.info("Firebase Admin SDK initialised for project=%s", settings.google_cloud_project)


# ── FastAPI dependency ───────────────────────────────────────────────────────


async def get_current_user_id(request: Request) -> str:
    """Extract and verify the Firebase ID token from the Authorization header.

    Returns the user's Firebase UID on success, or ``"anonymous"`` when:
    * No Authorization header is present
    * The token is invalid, expired, or cannot be verified

    This makes authentication *optional* — legacy/guest clients that do not
    send a token are silently treated as anonymous, keeping the API backward
    compatible.
    """
    auth_header: str | None = request.headers.get("Authorization")
    if not auth_header or not auth_header.startswith("Bearer "):
        return "anonymous"

    token = auth_header.removeprefix("Bearer ").strip()
    if not token:
        return "anonymous"

    try:
        _ensure_firebase_app()
        decoded = firebase_auth.verify_id_token(token)
        uid: str = decoded.get("uid", "anonymous")
        logger.debug("Authenticated user uid=%s", uid)
        return uid
    except Exception as exc:  # noqa: BLE001
        logger.warning("Firebase token verification failed: %s", exc)
        return "anonymous"
