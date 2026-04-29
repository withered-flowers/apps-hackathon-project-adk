"""API route handlers for Decidely.ai — chat, history, and export endpoints."""

from fastapi import APIRouter, Depends, HTTPException, Request
from fastapi.responses import Response, StreamingResponse

from app.core.auth import get_current_user_id
from app.core.errors import SessionNotFoundError
from app.core.firestore import get_session
from app.core.logging import get_logger
from app.core.rate_limiter import rate_limit_manager
from app.models.schemas import (
    ChatRequest,
    ChatResponse,
    HistoryResponse,
    RecentSessionsResponse,
    UserStatusResponse,
    VoucherRedeemRequest,
    VoucherRedeemResponse,
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
from app.services.voucher_service import voucher_service

logger = get_logger("api.routes")

router = APIRouter()


# ── Helpers ────────────────────────────────────────────────────────────────────


async def _verify_session_ownership(session_id: str, user_id: str) -> dict | None:
    """Fetch a session and verify that the requester owns it.

    Returns the session dict on success, raises 404 if not found or
    if the ``user_id`` does not match (stealth 404 per security spec).
    """
    data = await get_session(session_id)
    if not data:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found")
    session_owner = data.get("user_id", "anonymous")
    if session_owner != user_id:
        # Stealth 404 — do not reveal that the session exists to a different user
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found")
    return data


# ── Routes ─────────────────────────────────────────────────────────────────────


@router.post("/chat", response_model=ChatResponse, tags=["Chat"])
async def chat(
    request: ChatRequest,
    user_id: str = Depends(get_current_user_id),
    http_request: Request = None,
) -> ChatResponse:
    """
    Process a user message and advance the decision pipeline.

    - Creates a new session if session_id doesn't exist
    - Routes to the appropriate agent based on current session status
    - Returns the agent response, updated status, and decision matrix
    - Rate limited per user tier (guest: 30/5hr, registered: 3/2hr, upgraded: 20/1hr)
    """
    is_upgraded = voucher_service.is_user_upgraded(user_id)
    allowed, remaining, reset_ts = rate_limit_manager.check_rate_limit(user_id, is_upgraded)

    if not allowed:
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded. Try again later.",
            headers={
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": str(reset_ts),
                "Retry-After": str(reset_ts),
            },
        )

    headers = rate_limit_manager.get_headers(user_id, is_upgraded)

    session_id = request.session_id or generate_session_id()

    logger.info(
        "POST /api/chat session_id=%s user_id=%s message_len=%d",
        session_id,
        user_id,
        len(request.message),
    )

    response = await process_message(
        session_id=session_id, user_message=request.message, user_id=user_id
    )

    if http_request is not None:
        for key, value in headers.items():
            http_request.state.__setattr__(key, value)

    return response


@router.post("/chat/stream", tags=["Chat"])
async def chat_stream(
    request: ChatRequest,
    user_id: str = Depends(get_current_user_id),
) -> StreamingResponse:
    """
    Process a user message and stream real-time agent status updates via SSE.

    Events emitted:
    - status: {agent, status} — emitted at each pipeline phase transition
    - done: {session_id, agent, response, status, matrix} — final payload
    Rate limited per user tier (guest: 30/5hr, registered: 3/2hr, upgraded: 20/1hr)
    """
    is_upgraded = voucher_service.is_user_upgraded(user_id)
    allowed, remaining, reset_ts = rate_limit_manager.check_rate_limit(user_id, is_upgraded)

    if not allowed:
        raise HTTPException(
            status_code=429,
            detail="Rate limit exceeded. Try again later.",
            headers={
                "X-RateLimit-Remaining": "0",
                "X-RateLimit-Reset": str(reset_ts),
                "Retry-After": str(reset_ts),
            },
        )

    session_id = request.session_id or generate_session_id()

    logger.info(
        "POST /api/chat/stream session_id=%s user_id=%s message_len=%d",
        session_id,
        user_id,
        len(request.message),
    )

    return StreamingResponse(
        process_message_stream(session_id, request.message, user_id=user_id),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/history/{session_id}", response_model=HistoryResponse, tags=["Chat"])
async def get_session_history(
    session_id: str,
    user_id: str = Depends(get_current_user_id),
) -> HistoryResponse:
    """
    Retrieve the full conversation history and decision matrix for a session.

    Returns 404 if the session doesn't exist or belongs to a different user.
    """
    logger.info("GET /api/history/%s user_id=%s", session_id, user_id)

    # Verify ownership before returning data
    await _verify_session_ownership(session_id, user_id)

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
async def recent_sessions(
    user_id: str = Depends(get_current_user_id),
) -> RecentSessionsResponse:
    """List the 5 most recent sessions for the current user."""
    sessions = await list_recent_sessions(limit=5, user_id=user_id)
    return RecentSessionsResponse(sessions=sessions)  # pyright: ignore[reportArgumentType]


@router.post("/export/{session_id}", tags=["Export"])
async def export_session_report(
    session_id: str,
    user_id: str = Depends(get_current_user_id),
) -> dict[str, str]:
    """
    Export the completed decision report to Google Drive.

    Returns the Google Drive document URL.
    Raises 404 if session not found, 503 if Drive MCP unavailable.
    """
    logger.info("POST /api/export/%s user_id=%s", session_id, user_id)

    # Verify ownership
    await _verify_session_ownership(session_id, user_id)

    try:
        url = await export_report(session_id)
    except SessionNotFoundError as exc:
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        logger.error("Export failed for session=%s: %s", session_id, exc)
        raise HTTPException(status_code=503, detail="Export service unavailable") from exc

    return {"session_id": session_id, "drive_url": url}


@router.get("/export/{session_id}/download", tags=["Export"])
async def download_markdown_report(
    session_id: str,
    user_id: str = Depends(get_current_user_id),
) -> Response:
    """
    Download the decision report as a markdown file.

    Returns a .md file with session summary, decision matrix, and SWOT analysis.
    Raises 404 if session not found or belongs to different user.
    """
    logger.info("GET /api/export/%s/download user_id=%s", session_id, user_id)

    # Verify ownership
    await _verify_session_ownership(session_id, user_id)

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


@router.post("/voucher/redeem", response_model=VoucherRedeemResponse, tags=["Voucher"])
async def redeem_voucher(
    request: VoucherRedeemRequest,
    user_id: str = Depends(get_current_user_id),
) -> VoucherRedeemResponse:
    """
    Redeem a voucher code to upgrade rate limits.

    Currently only supports "DEMO" code which upgrades to 20 requests per hour.
    """
    if user_id == "anonymous":
        raise HTTPException(status_code=401, detail="Guest users cannot redeem vouchers")

    success, message = voucher_service.redeem_voucher(user_id, request.code)

    if not success:
        raise HTTPException(status_code=400, detail=message)

    return VoucherRedeemResponse(
        status="upgraded",
        new_limit="20 per hour",
        message="Rate limit upgraded successfully",
    )


@router.get("/user/status", response_model=UserStatusResponse, tags=["User"])
async def get_user_status(
    user_id: str = Depends(get_current_user_id),
) -> UserStatusResponse:
    """
    Get the current user's subscription status.

    Returns whether the user has upgraded rate limits and their current tier.
    """
    tier = voucher_service.get_user_tier(user_id)
    return UserStatusResponse(
        is_upgraded=tier == "upgraded",
        rate_limit_tier=tier,
    )
