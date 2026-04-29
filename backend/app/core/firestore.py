"""Firestore client singleton with CRUD operations for DecisionSession."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from google.cloud import firestore

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger("firestore")

_client: firestore.AsyncClient | None = None


def get_firestore() -> firestore.AsyncClient:
    """Return a singleton Firestore async client."""
    global _client
    if _client is None:
        _client = firestore.AsyncClient(project=settings.google_cloud_project)
        logger.info("Firestore client initialised for project=%s", settings.google_cloud_project)
    return _client


# ─── Session operations ────────────────────────────────────────────────────────


async def get_session(session_id: str) -> dict[str, Any] | None:
    """Fetch a session document from Firestore. Returns None if not found."""
    db = get_firestore()
    doc_ref = db.collection("sessions").document(session_id)
    snapshot = await doc_ref.get()
    if snapshot.exists:
        return snapshot.to_dict()
    return None


async def save_session(session_data: dict[str, Any]) -> None:
    """Upsert a session document into Firestore."""
    db = get_firestore()
    session_id = session_data["session_id"]

    # Firestore cannot serialise datetime directly from Pydantic — convert
    data = _prepare_for_firestore(session_data)
    data["last_message_at"] = firestore.SERVER_TIMESTAMP

    await db.collection("sessions").document(session_id).set(data, merge=True)
    logger.info("Session saved: session_id=%s status=%s", session_id, data.get("status"))


async def list_sessions(limit: int = 5, user_id: str = "anonymous") -> list[dict[str, Any]]:
    """List the most recent sessions ordered by last_message_at descending.

    When *user_id* is provided the results are filtered to only include
    sessions owned by that user.  Legacy sessions without a ``user_id``
    field are treated as belonging to the ``"anonymous"`` pool.
    """
    db = get_firestore()
    query = db.collection("sessions").where(filter=firestore.FieldFilter("user_id", "==", user_id))
    query = query.order_by("last_message_at", direction=firestore.Query.DESCENDING)
    query = query.limit(limit)

    results = []
    async for doc in query.stream():
        data = doc.to_dict()
        if data is None:
            continue
        results.append(
            {
                "session_id": doc.id,
                "topic": data.get("topic", ""),
                "status": data.get("status", ""),
                "last_message_at": data.get("last_message_at"),
                "criteria": data.get("criteria", []),
                "options": data.get("options", []),
            }
        )
    return results


async def count_user_sessions(user_id: str) -> int:
    """Count the number of sessions owned by *user_id*.

    Used to enforce the 50-decision limit per permanent user.
    """
    db = get_firestore()
    query = db.collection("sessions").where(filter=firestore.FieldFilter("user_id", "==", user_id))
    results = []
    async for doc in query.stream():
        results.append(doc)
    return len(results)


def _prepare_for_firestore(data: Any) -> Any:
    """Recursively convert non-serialisable types for Firestore."""
    if isinstance(data, dict):
        return {k: _prepare_for_firestore(v) for k, v in data.items()}
    if isinstance(data, list):
        return [_prepare_for_firestore(item) for item in data]
    if isinstance(data, datetime):
        return data.isoformat()
    return data
