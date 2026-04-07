"""Domain entity models for Decidely.ai (Firestore/SQLite representations)."""
from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class Message(BaseModel):
    """A single conversation turn."""

    role: str  # "user" | "assistant"
    content: str
    agent: str | None = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class DecisionCriteria(BaseModel):
    """A criterion extracted from the user interview."""

    criterion_id: str
    session_id: str
    name: str  # e.g. "Budget"
    weight: float = Field(default=1.0, ge=0.0, le=1.0)
    value: str  # e.g. "$1000"


class Option(BaseModel):
    """A candidate option researched by the Researcher agent."""

    option_id: str
    session_id: str
    title: str
    description: str
    score: float = Field(default=0.0)
    pros: list[str] = Field(default_factory=list)
    cons: list[str] = Field(default_factory=list)
    url: str = ""


class DecisionSession(BaseModel):
    """Represents a complete decision-making journey."""

    session_id: str
    user_id: str = "anonymous"
    status: str = "Interviewing"  # Interviewing | Researching | Evaluating | Complete
    last_message_at: datetime = Field(default_factory=datetime.utcnow)
    transcript: list[Message] = Field(default_factory=list)
    criteria: list[dict[str, Any]] = Field(default_factory=list)
    options: list[dict[str, Any]] = Field(default_factory=list)
