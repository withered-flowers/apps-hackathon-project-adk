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


async def list_sessions(limit: int = 5) -> list[dict[str, Any]]:
    """List the most recent sessions ordered by last_message_at descending."""
    db = get_firestore()
    snapshot = (
        db.collection("sessions")
        .order_by("last_message_at", direction=firestore.Query.DESCENDING)
        .limit(limit)
        .stream()
    )
    results = []
    async for doc in snapshot:
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


def _prepare_for_firestore(data: Any) -> Any:
    """Recursively convert non-serialisable types for Firestore."""
    if isinstance(data, dict):
        return {k: _prepare_for_firestore(v) for k, v in data.items()}
    if isinstance(data, list):
        return [_prepare_for_firestore(item) for item in data]
    if isinstance(data, datetime):
        return data.isoformat()
    return data
