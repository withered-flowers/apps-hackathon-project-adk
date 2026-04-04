"""
DecisionService — session lifecycle management and pipeline orchestration.

Handles: session retrieval/creation, pipeline execution, Firestore persistence,
and SQLite MCP matrix storage.
"""
from __future__ import annotations

import uuid
from typing import Any

from app.agents.primary import get_pipeline
from app.core.errors import SessionNotFoundError
from app.core.firestore import get_session, save_session
from app.core.logging import get_logger
from app.mcp import sqlite_client
from app.models.entities import DecisionSession, Message
from app.models.schemas import ChatResponse, HistoryResponse, MatrixData, MessageEntry

logger = get_logger("services.decision")


async def process_message(session_id: str, user_message: str) -> ChatResponse:
    """
    Process a user message through the multi-agent pipeline.

    1. Load (or create) the session from Firestore
    2. Run the pipeline for the current phase
    3. Update the session with new state
    4. Persist to Firestore and SQLite MCP
    5. Return the ChatResponse
    """
    # Load or create session
    existing = await get_session(session_id)
    if existing:
        session = DecisionSession(**existing)
        logger.info("Loaded session=%s status=%s", session_id, session.status)
    else:
        session = DecisionSession(session_id=session_id)
        # Store the topic from the first user message
        session_dict: dict[str, Any] = session.model_dump()
        session_dict["topic"] = user_message
        logger.info("Created new session=%s", session_id)
        session_dict_for_pipeline = session_dict
        session_dict_for_pipeline.pop("transcript", None)
        await save_session(session_dict_for_pipeline)
        existing = session_dict_for_pipeline

    # Append user message to transcript
    user_msg = Message(role="user", content=user_message)
    session.transcript.append(user_msg)

    # Prepare session data dict for pipeline
    session_data = _session_to_dict(session)
    if existing and "topic" in existing:
        session_data["topic"] = existing["topic"]
    else:
        session_data.setdefault("topic", user_message)

    # Run the pipeline
    pipeline = get_pipeline()
    agent_name, response_text, new_status, updated_data = await pipeline.run(
        session_id=session_id,
        user_message=user_message,
        session_data=session_data,
    )

    # Update session state
    session.status = new_status
    session.criteria = updated_data.get("criteria", session.criteria)
    session.options = updated_data.get("options", session.options)

    # Append assistant response to transcript
    assistant_msg = Message(role="assistant", content=response_text, agent=agent_name)
    session.transcript.append(assistant_msg)

    # Build matrix from updated data
    matrix_raw = updated_data.get("matrix", {})
    matrix = MatrixData(
        options=matrix_raw.get("options", []),
        criteria=matrix_raw.get("criteria", []),
    )

    # Persist to SQLite MCP (criteria + options)
    if session.criteria:
        try:
            await sqlite_client.insert_criteria(session_id, session.criteria)
        except Exception as exc:  # noqa: BLE001
            logger.warning("SQLite MCP criteria insert failed: %s", exc)

    if session.options:
        try:
            await sqlite_client.insert_options(session_id, session.options)
        except Exception as exc:  # noqa: BLE001
            logger.warning("SQLite MCP options insert failed: %s", exc)

    # Persist to Firestore
    save_data = _session_to_dict(session)
    save_data["topic"] = session_data.get("topic", user_message)
    if "matrix" in updated_data:
        save_data["matrix"] = updated_data["matrix"]
    if "recommendation" in updated_data:
        save_data["recommendation"] = updated_data["recommendation"]

    try:
        await save_session(save_data)
    except Exception as exc:  # noqa: BLE001
        logger.warning("Firestore save failed: %s", exc)

    logger.info(
        "Message processed: session=%s agent=%s new_status=%s",
        session_id,
        agent_name,
        new_status,
    )

    return ChatResponse(
        session_id=session_id,
        agent=agent_name,
        response=response_text,
        status=new_status,
        matrix=matrix,
    )


async def get_history(session_id: str) -> HistoryResponse:
    """Retrieve the full conversation history for a session."""
    data = await get_session(session_id)
    if not data:
        raise SessionNotFoundError(session_id)

    messages = [
        MessageEntry(
            role=m.get("role", "user"),
            content=m.get("content", ""),
            agent=m.get("agent"),
        )
        for m in data.get("transcript", [])
    ]

    matrix_raw = data.get("matrix", {})
    matrix = MatrixData(
        options=matrix_raw.get("options", []) if matrix_raw else [],
        criteria=matrix_raw.get("criteria", []) if matrix_raw else [],
    )

    return HistoryResponse(
        session_id=session_id,
        messages=messages,
        matrix=matrix,
    )


def generate_session_id() -> str:
    """Generate a new unique session ID."""
    return str(uuid.uuid4())


def _session_to_dict(session: DecisionSession) -> dict[str, Any]:
    """Convert a DecisionSession to a plain dict for pipeline/Firestore use."""
    raw = session.model_dump()
    # Convert Message objects in transcript
    raw["transcript"] = [
        {
            "role": m["role"],
            "content": m["content"],
            "agent": m.get("agent"),
            "timestamp": m["timestamp"].isoformat() if hasattr(m["timestamp"], "isoformat") else str(m["timestamp"]),
        }
        for m in raw.get("transcript", [])
    ]
    return raw
