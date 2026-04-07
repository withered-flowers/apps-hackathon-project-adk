"""Global error handling utilities for Decidely.ai API."""
from __future__ import annotations

from fastapi import Request
from fastapi.responses import JSONResponse

from app.core.logging import get_logger

logger = get_logger("errors")


class DecidelyError(Exception):
    """Base application error."""

    def __init__(self, message: str, status_code: int = 500) -> None:
        super().__init__(message)
        self.message = message
        self.status_code = status_code


class SearchError(DecidelyError):
    """Raised when Google Search Grounding fails."""

    def __init__(self, detail: str = "Search grounding failed") -> None:
        super().__init__(detail, status_code=503)


class MCPError(DecidelyError):
    """Raised when the SQLite MCP server is unavailable."""

    def __init__(self, detail: str = "MCP server unavailable") -> None:
        super().__init__(detail, status_code=503)


class SessionNotFoundError(DecidelyError):
    """Raised when a session cannot be found."""

    def __init__(self, session_id: str) -> None:
        super().__init__(f"Session '{session_id}' not found", status_code=404)


async def decidely_exception_handler(request: Request, exc: DecidelyError) -> JSONResponse:
    """Convert DecidelyError into a structured JSON error response."""
    logger.error("Application error: %s (status=%d)", exc.message, exc.status_code)
    return JSONResponse(
        status_code=exc.status_code,
        content={"error": exc.message, "path": str(request.url)},
    )
