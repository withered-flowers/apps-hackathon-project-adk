"""Pydantic schemas for API request/response contracts."""
from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    """Incoming message from the frontend."""

    session_id: str = Field(..., description="Unique session identifier")
    message: str = Field(..., description="User's message text")


class MessageEntry(BaseModel):
    """A single message in the conversation history."""

    role: str = Field(..., description="'user' or 'assistant'")
    content: str = Field(..., description="Message text")
    agent: str | None = Field(default=None, description="Agent name, for assistant messages")


class MatrixData(BaseModel):
    """Structured comparison matrix returned by the Evaluator."""

    options: list[dict[str, Any]] = Field(default_factory=list)
    criteria: list[dict[str, Any]] = Field(default_factory=list)


class ChatResponse(BaseModel):
    """Response returned after processing a user message."""

    session_id: str
    agent: str = Field(..., description="Name of the agent that generated the response")
    response: str = Field(..., description="Agent's response text")
    status: str = Field(
        ...,
        description="Session status: Interviewing | Researching | Evaluating | Complete",
    )
    matrix: MatrixData = Field(default_factory=MatrixData)


class HistoryResponse(BaseModel):
    """Full conversation history for a session."""

    session_id: str
    messages: list[MessageEntry] = Field(default_factory=list)
    matrix: MatrixData = Field(default_factory=MatrixData)
