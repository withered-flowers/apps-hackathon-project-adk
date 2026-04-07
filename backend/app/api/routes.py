"""API route handlers for Decidely.ai — chat, history, and export endpoints."""

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response, StreamingResponse

from app.core.errors import SessionNotFoundError
from app.core.logging import get_logger
from app.models.schemas import (
    ChatRequest,
    ChatResponse,
    HistoryResponse,
    RecentSessionsResponse,
)
from app.services.decision_service import (
    generate_session_id,
    get_history,
    list_recent_sessions,
    process_message,
    process_message_stream,
)
from app.services.markdown_service import generate_markdown_download
from app.services.report_service import export_report

logger = get_logger("api.routes")

router = APIRouter()


@router.post("/chat", response_model=ChatResponse, tags=["Chat"])
async def chat(request: ChatRequest) -> ChatResponse:
    """
    Process a user message and advance the decision pipeline.

    - Creates a new session if session_id doesn't exist
    - Routes to the appropriate agent based on current session status
    - Returns the agent response, updated status, and decision matrix
    """
    # Auto-generate session_id if not provided or empty
    session_id = request.session_id or generate_session_id()

    logger.info("POST /api/chat session_id=%s message_len=%d", session_id, len(request.message))

    response = await process_message(session_id=session_id, user_message=request.message)
    return response


@router.post("/chat/stream", tags=["Chat"])
async def chat_stream(request: ChatRequest) -> StreamingResponse:
    """
    Process a user message and stream real-time agent status updates via SSE.

    Events emitted:
    - status: {agent, status} — emitted at each pipeline phase transition
    - done: {session_id, agent, response, status, matrix} — final payload
    """
    session_id = request.session_id or generate_session_id()

    logger.info(
        "POST /api/chat/stream session_id=%s message_len=%d", session_id, len(request.message)
    )

    return StreamingResponse(
        process_message_stream(session_id, request.message),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/history/{session_id}", response_model=HistoryResponse, tags=["Chat"])
async def get_session_history(session_id: str) -> HistoryResponse:
    """
    Retrieve the full conversation history and decision matrix for a session.

    Returns 404 if the session doesn't exist.
    """
    logger.info("GET /api/history/%s", session_id)

    try:
        history = await get_history(session_id)
    except SessionNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc

    return history


@router.get("/session/new", tags=["Session"])
async def new_session() -> dict[str, str]:
    """Generate a new session ID for the frontend to use."""
    return {"session_id": generate_session_id()}


@router.get("/sessions/recent", response_model=RecentSessionsResponse, tags=["Session"])
async def recent_sessions() -> RecentSessionsResponse:
    """List the 5 most recent sessions."""
    sessions = await list_recent_sessions(limit=5)
    return RecentSessionsResponse(sessions=sessions)  # pyright: ignore[reportArgumentType]


@router.post("/export/{session_id}", tags=["Export"])
async def export_session_report(session_id: str) -> dict[str, str]:
    """
    Export the completed decision report to Google Drive.

    Returns the Google Drive document URL.
    Raises 404 if session not found, 503 if Drive MCP unavailable.
    """
    logger.info("POST /api/export/%s", session_id)

    try:
        url = await export_report(session_id)
    except SessionNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        logger.error("Export failed for session=%s: %s", session_id, exc)
        raise HTTPException(status_code=503, detail="Export service unavailable") from exc

    return {"session_id": session_id, "drive_url": url}


@router.get("/export/{session_id}/download", tags=["Export"])
async def download_markdown_report(session_id: str) -> Response:
    """
    Download the decision report as a markdown file.

    Returns a .md file with session summary, decision matrix, and SWOT analysis.
    Raises 404 if session not found.
    """
    logger.info("GET /api/export/%s/download", session_id)

    try:
        filename, content = await generate_markdown_download(session_id)
    except SessionNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        logger.error("Markdown generation failed for session=%s: %s", session_id, exc)
        raise HTTPException(status_code=500, detail="Failed to generate report") from exc

    return Response(
        content=content,
        media_type="text/markdown",
        headers={
            "Content-Disposition": f'attachment; filename="{filename}"',
        },
    )
