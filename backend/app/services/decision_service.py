"""
DecisionService — session lifecycle management and pipeline orchestration.

Handles: session retrieval/creation, pipeline execution, Firestore persistence,
and SQLite MCP matrix storage.
"""

from __future__ import annotations

import json
import re
import uuid
from collections.abc import AsyncGenerator
from typing import Any

from app.agents.primary import DecisionPipeline, get_pipeline
from app.core.errors import SessionNotFoundError
from app.core.firestore import get_session, save_session
from app.core.firestore import list_sessions as _list_sessions
from app.core.logging import get_logger
from app.mcp import sqlite_client
from app.models.entities import DecisionSession, Message
from app.models.schemas import ChatResponse, HistoryResponse, MatrixData, MessageEntry

logger = get_logger("services.decision")


def _extract_json(text: str) -> dict | None:
    """Attempt to parse JSON from agent response text."""
    if not text:
        return None
    try:
        return json.loads(text.strip())
    except (json.JSONDecodeError, ValueError):
        pass
    match = re.search(r"```(?:json)?\s*([\s\S]+?)\s*```", text)
    if match:
        try:
            return json.loads(match.group(1))
        except (json.JSONDecodeError, ValueError):
            pass
    match = re.search(r"(\{[\s\S]+\})", text)
    if match:
        try:
            return json.loads(match.group(1))
        except (json.JSONDecodeError, ValueError):
            pass
    return None


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


def _sse_event(event_type: str, data: dict) -> str:
    """Format a single SSE event."""
    return f"event: {event_type}\ndata: {json.dumps(data)}\n\n"


def _progress_event(agent: str, status: str, message: str) -> str:
    """Emit a progress event that updates the badge AND adds a chat message."""
    return _sse_event(
        "progress",
        {
            "agent": agent,
            "status": status,
            "message": message,
        },
    )


async def _save_and_build_response(
    session_id: str,
    session: DecisionSession,
    session_data: dict,
    agent_name: str,
    response_text: str,
    new_status: str,
    updated_data: dict,
) -> dict:
    """Persist session state and build the final response dict."""
    session.status = new_status
    session.criteria = updated_data.get("criteria", session.criteria)
    session.options = updated_data.get("options", session.options)

    assistant_msg = Message(role="assistant", content=response_text, agent=agent_name)
    session.transcript.append(assistant_msg)

    matrix_raw = updated_data.get("matrix", {})
    matrix = MatrixData(
        options=matrix_raw.get("options", []),
        criteria=matrix_raw.get("criteria", []),
    )

    if session.criteria:
        try:
            await sqlite_client.insert_criteria(session_id, session.criteria)
        except Exception as exc:
            logger.warning("SQLite MCP criteria insert failed: %s", exc)

    if session.options:
        try:
            await sqlite_client.insert_options(session_id, session.options)
        except Exception as exc:
            logger.warning("SQLite MCP options insert failed: %s", exc)

    save_data = _session_to_dict(session)
    save_data["topic"] = session_data.get("topic", "")
    if "matrix" in updated_data:
        save_data["matrix"] = updated_data["matrix"]
    if "recommendation" in updated_data:
        save_data["recommendation"] = updated_data["recommendation"]

    try:
        await save_session(save_data)
    except Exception as exc:
        logger.warning("Firestore save failed: %s", exc)

    return {
        "session_id": session_id,
        "agent": agent_name,
        "response": response_text,
        "status": new_status,
        "matrix": {"options": matrix.options, "criteria": matrix.criteria},
    }


async def process_message_stream(session_id: str, user_message: str) -> AsyncGenerator[str]:
    """
    Process a user message and stream real-time agent status updates via SSE.

    Yields SSE events:
    - status: {agent, status} at each phase transition
    - done: final complete payload
    """
    existing = await get_session(session_id)
    if existing:
        session = DecisionSession(**existing)
    else:
        session = DecisionSession(session_id=session_id)
        session_dict: dict[str, Any] = session.model_dump()
        session_dict["topic"] = user_message
        await save_session(session_dict)
        existing = session_dict

    session.transcript.append(Message(role="user", content=user_message))
    session_data = _session_to_dict(session)
    session_data["topic"] = existing.get("topic", user_message) if existing else user_message

    pipeline: DecisionPipeline = get_pipeline()
    status = session_data.get("status", "Interviewing")
    criteria = session_data.get("criteria", [])

    agent_name = ""
    response_text = ""
    new_status = ""
    updated_data: dict = {}
    events: list[str] = []

    if status == "Interviewing":
        context = user_message
        if criteria:
            context = (
                f"Existing criteria collected so far: {json.dumps(criteria)}\n\n"
                f"User says: {user_message}"
            )
        response_text = await pipeline._call_agent(pipeline._interviewer, session_id, context)
        parsed = _extract_json(response_text)
        if parsed and parsed.get("criteria_complete"):
            new_criteria = parsed.get("criteria", [])
            session_data["criteria"] = new_criteria
            session_data["status"] = "Researching"
            events.append(
                _progress_event(
                    "InterviewerAgent",
                    "Interviewing",
                    "Criteria collected. Now researching your options...",
                )
            )
            updated_data, response_text, new_status, agent_name = await _run_full_pipeline(
                pipeline, session_id, session_data, events
            )
        else:
            new_status = "Interviewing"
            agent_name = "InterviewerAgent"
            updated_data = session_data

    elif status in ("Researching", "Evaluating"):
        updated_data, response_text, new_status, agent_name = await _run_full_pipeline(
            pipeline, session_id, session_data, events
        )

    elif status == "Complete":
        events.append(
            _progress_event(
                "SupporterAgent", "Supporting", "Preparing your final recommendation..."
            )
        )
        recommendation = session_data.get("recommendation", "")
        matrix = session_data.get("matrix", {})
        topic = session_data.get("topic", "decision")
        prompt = (
            f"User's original decision question: {topic}\n"
            f"Criteria: {json.dumps(criteria)}\n"
            f"Top recommendation: {recommendation}\n"
            f"Matrix: {json.dumps(matrix)}\n\n"
            f"User follow-up message: {user_message}"
        )
        response_text = await pipeline._call_agent(pipeline._supporter, session_id, prompt)
        agent_name = "SupporterAgent"
        new_status = "Complete"
        updated_data = session_data

    else:
        session_data["status"] = "Interviewing"
        response_text = await pipeline._call_agent(pipeline._interviewer, session_id, user_message)
        agent_name = "InterviewerAgent"
        new_status = "Interviewing"
        updated_data = session_data

    for event in events:
        yield event

    final = await _save_and_build_response(
        session_id, session, session_data, agent_name, response_text, new_status, updated_data
    )
    yield _sse_event("done", final)


async def _run_full_pipeline(
    pipeline: DecisionPipeline,
    session_id: str,
    session_data: dict,
    events: list[str],
) -> tuple[dict, str, str, str]:
    """
    Run Research → Evaluate → Support, appending SSE events to the events list.
    Returns (updated_data, response_text, new_status, agent_name).
    """
    criteria = session_data.get("criteria", [])

    events.append(
        _progress_event(
            "ResearcherAgent",
            "Researching",
            "Searching for the best options based on your criteria...",
        )
    )
    topic = session_data.get("topic", "the user's decision")
    research_prompt = (
        f"Decision topic: {topic}\n"
        f"User criteria: {json.dumps(criteria)}\n\n"
        "Please research and find the top 3-5 best options."
    )
    research_response = await pipeline._call_agent(
        pipeline._researcher, session_id, research_prompt
    )
    research_parsed = _extract_json(research_response)

    if not research_parsed or "options" not in research_parsed:
        logger.warning("Researcher returned no parseable JSON for session=%s", session_id)
        session_data["status"] = "Researching"
        return (
            session_data,
            "I had trouble finding specific options right now. Could you provide more details?",
            "Researching",
            "ResearcherAgent",
        )

    new_options = research_parsed["options"]
    session_data["options"] = new_options
    session_data["status"] = "Evaluating"

    events.append(
        _progress_event(
            "EvaluatorAgent",
            "Evaluating",
            f"Found {len(new_options)} options. Now scoring them against your criteria...",
        )
    )
    eval_prompt = (
        f"Criteria: {json.dumps(criteria)}\n"
        f"Options: {json.dumps(new_options)}\n\n"
        "Please score these options and produce the decision matrix."
    )
    eval_response = await pipeline._call_agent(pipeline._evaluator, session_id, eval_prompt)
    eval_parsed = _extract_json(eval_response)

    recommendation = ""
    if eval_parsed and "matrix" in eval_parsed:
        matrix = eval_parsed["matrix"]
        recommendation = eval_parsed.get("recommendation", "")
        session_data["matrix"] = matrix
        session_data["recommendation"] = recommendation
        session_data["options"] = matrix.get("options", new_options)
    session_data["status"] = "Complete"

    events.append(
        _progress_event(
            "SupporterAgent", "Supporting", "Analysis complete. Here's your final recommendation..."
        )
    )
    support_prompt = (
        f"User's original decision question: {topic}\n"
        f"Criteria: {json.dumps(criteria)}\n"
        f"Options found: {json.dumps(new_options)}\n"
        f"Top recommendation: {recommendation}\n\n"
        "Please provide your final recommendation and encouragement."
    )
    support_response = await pipeline._call_agent(pipeline._supporter, session_id, support_prompt)

    return session_data, support_response, "Complete", "SupporterAgent"


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


async def list_recent_sessions(limit: int = 5) -> list[dict[str, Any]]:
    """Return the most recent sessions with summary info."""
    return await _list_sessions(limit)


def _session_to_dict(session: DecisionSession) -> dict[str, Any]:
    """Convert a DecisionSession to a plain dict for pipeline/Firestore use."""
    raw = session.model_dump()
    # Convert Message objects in transcript
    raw["transcript"] = [
        {
            "role": m["role"],
            "content": m["content"],
            "agent": m.get("agent"),
            "timestamp": m["timestamp"].isoformat()
            if hasattr(m["timestamp"], "isoformat")
            else str(m["timestamp"]),
        }
        for m in raw.get("transcript", [])
    ]
    return raw
