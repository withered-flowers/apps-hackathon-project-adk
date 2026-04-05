"""
MarkdownService — generates markdown reports for download.

Uses the markdown_generator MCP to produce comprehensive reports
with chat summaries, decision matrices, and SWOT analysis.
"""

from __future__ import annotations

from app.core.errors import SessionNotFoundError
from app.core.firestore import get_session
from app.core.logging import get_logger
from app.mcp import markdown_generator

logger = get_logger("services.markdown")


async def generate_markdown_download(session_id: str) -> tuple[str, str]:
    """
    Generate a markdown report for download.

    Returns:
        Tuple of (filename, markdown_content)

    Raises:
        SessionNotFoundError: If the session doesn't exist
    """
    session_data = await get_session(session_id)
    if not session_data:
        raise SessionNotFoundError(session_id)

    topic = session_data.get("topic", "Decision")
    filename = f"decidely-report-{topic.replace(' ', '-').lower()}.md"

    report_md = markdown_generator.generate_markdown_report(session_data)

    logger.info("Generated markdown report for session=%s filename=%s", session_id, filename)
    return filename, report_md
