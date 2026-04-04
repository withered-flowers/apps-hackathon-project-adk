"""
SQLite MCP client for Decidely.ai decision matrix operations.

Uses the MCP stdio transport to communicate with the mcp-server-sqlite binary.
Tables managed:
  - criteria(criterion_id, session_id, name, weight, value)
  - options(option_id, session_id, title, description, score, pros, cons, url)
"""
from __future__ import annotations

import json
import uuid
from contextlib import asynccontextmanager
from typing import Any

from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger("mcp.sqlite")

# MCP server parameters — uses the bundled mcp-server-sqlite
_SERVER_PARAMS = StdioServerParameters(
    command="uvx",
    args=["mcp-server-sqlite", "--db-path", settings.sqlite_db_path],
    env=None,
)


@asynccontextmanager
async def _get_session():
    """Context manager that yields an active MCP ClientSession."""
    async with stdio_client(_SERVER_PARAMS) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            yield session


async def _execute(sql: str, params: list[Any] | None = None) -> list[dict[str, Any]]:
    """Run a SQL statement via MCP and return rows as dicts."""
    async with _get_session() as session:
        result = await session.call_tool(
            "execute_query",
            {"query": sql, "params": params or []},
        )
        # MCP returns content as a list of TextContent objects
        raw = result.content[0].text if result.content else "[]"
        try:
            return json.loads(raw)
        except (json.JSONDecodeError, TypeError):
            return []


async def ensure_schema() -> None:
    """Create the criteria and options tables if they don't exist."""
    await _execute(
        """
        CREATE TABLE IF NOT EXISTS criteria (
            criterion_id TEXT PRIMARY KEY,
            session_id   TEXT NOT NULL,
            name         TEXT NOT NULL,
            weight       REAL NOT NULL DEFAULT 1.0,
            value        TEXT NOT NULL
        )
        """
    )
    await _execute(
        """
        CREATE TABLE IF NOT EXISTS options (
            option_id   TEXT PRIMARY KEY,
            session_id  TEXT NOT NULL,
            title       TEXT NOT NULL,
            description TEXT NOT NULL,
            score       REAL NOT NULL DEFAULT 0.0,
            pros        TEXT NOT NULL DEFAULT '[]',
            cons        TEXT NOT NULL DEFAULT '[]',
            url         TEXT NOT NULL DEFAULT ''
        )
        """
    )
    logger.info("SQLite MCP schema verified")


async def insert_criteria(session_id: str, criteria: list[dict[str, Any]]) -> None:
    """Upsert a list of criteria for a session."""
    await ensure_schema()
    for c in criteria:
        await _execute(
            """
            INSERT OR REPLACE INTO criteria
              (criterion_id, session_id, name, weight, value)
            VALUES (?, ?, ?, ?, ?)
            """,
            [
                c.get("criterion_id", str(uuid.uuid4())),
                session_id,
                c["name"],
                c.get("weight", 1.0),
                c["value"],
            ],
        )
    logger.info("Inserted %d criteria for session=%s", len(criteria), session_id)


async def insert_options(session_id: str, options: list[dict[str, Any]]) -> None:
    """Upsert a list of options for a session."""
    await ensure_schema()
    for o in options:
        await _execute(
            """
            INSERT OR REPLACE INTO options
              (option_id, session_id, title, description, score, pros, cons, url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            """,
            [
                o.get("option_id", str(uuid.uuid4())),
                session_id,
                o["title"],
                o.get("description", ""),
                o.get("score", 0.0),
                json.dumps(o.get("pros", [])),
                json.dumps(o.get("cons", [])),
                o.get("url", ""),
            ],
        )
    logger.info("Inserted %d options for session=%s", len(options), session_id)


async def get_matrix(session_id: str) -> dict[str, Any]:
    """Return the full decision matrix for a session."""
    await ensure_schema()
    criteria = await _execute(
        "SELECT * FROM criteria WHERE session_id = ?", [session_id]
    )
    raw_options = await _execute(
        "SELECT * FROM options WHERE session_id = ?", [session_id]
    )

    # Deserialise JSON arrays stored as TEXT
    options = []
    for o in raw_options:
        o["pros"] = json.loads(o.get("pros", "[]"))
        o["cons"] = json.loads(o.get("cons", "[]"))
        options.append(o)

    return {"criteria": criteria, "options": options}
