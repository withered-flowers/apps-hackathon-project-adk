"""
ReportService — formats decision session data and exports to Google Drive.
"""
from __future__ import annotations

from datetime import datetime
from typing import Any

from app.core.errors import SessionNotFoundError
from app.core.firestore import get_session
from app.core.logging import get_logger
from app.mcp import drive_client

logger = get_logger("services.report")


def _format_report(session_data: dict[str, Any]) -> str:
    """Format session data into a Markdown report string."""
    session_id = session_data.get("session_id", "unknown")
    topic = session_data.get("topic", "Decision")
    status = session_data.get("status", "Unknown")
    recommendation = session_data.get("recommendation", "No recommendation yet")
    criteria = session_data.get("criteria", [])
    matrix = session_data.get("matrix", {})
    options = matrix.get("options", session_data.get("options", []))
    transcript = session_data.get("transcript", [])

    lines = [
        "# Decidely.ai — Decision Report",
        "",
        f"**Session ID**: {session_id}",
        f"**Decision Topic**: {topic}",
        f"**Status**: {status}",
        f"**Generated**: {datetime.utcnow().strftime('%Y-%m-%d %H:%M UTC')}",
        "",
        "---",
        "",
        "## 🎯 Recommendation",
        "",
        f"**{recommendation}**",
        "",
        "---",
        "",
        "## 📋 Your Criteria",
        "",
    ]

    for c in criteria:
        lines.append(f"- **{c.get('name', '?')}**: {c.get('value', '?')} (weight: {c.get('weight', 1.0)})")

    lines += [
        "",
        "---",
        "",
        "## 📊 Comparison Matrix",
        "",
    ]

    if options:
        # Header row
        crit_names = [c.get("name", "?") for c in criteria]
        header = "| Option | " + " | ".join(crit_names) + " | Total Score |"
        separator = "|--------|" + "|--------|" * len(crit_names) + "------------|"
        lines += [header, separator]

        for opt in options:
            scores = opt.get("scores", {})
            row_scores = " | ".join(str(scores.get(cn, "—")) for cn in crit_names)
            total = opt.get("weighted_score", "—")
            lines.append(f"| {opt.get('title', '?')} | {row_scores} | {total} |")

        lines.append("")
        lines.append("### Options Detail")
        for opt in options:
            lines += [
                "",
                f"#### {opt.get('title', '?')}",
                f"{opt.get('description', '')}",
                "",
                f"**Pros**: {', '.join(opt.get('pros', []))}",
                f"**Cons**: {', '.join(opt.get('cons', []))}",
                f"**Source**: {opt.get('url', 'N/A')}",
            ]
    else:
        lines.append("*No comparison matrix available yet.*")

    lines += [
        "",
        "---",
        "",
        "## 💬 Conversation History",
        "",
    ]

    for msg in transcript:
        role = msg.get("role", "user").capitalize()
        agent = msg.get("agent", "")
        content = msg.get("content", "")
        prefix = f"**{role}** ({agent})" if agent else f"**{role}**"
        lines.append(f"{prefix}: {content}")
        lines.append("")

    return "\n".join(lines)


async def export_report(session_id: str) -> str:
    """
    Format a completed session as a report and export it to Google Drive.

    Returns the Google Drive document URL.
    Raises SessionNotFoundError if the session doesn't exist.
    """
    session_data = await get_session(session_id)
    if not session_data:
        raise SessionNotFoundError(session_id)

    topic = session_data.get("topic", "Decision")
    title = f"Decidely.ai Report — {topic}"

    report_md = _format_report(session_data)
    url = await drive_client.create_document(title, report_md)

    logger.info("Report exported for session=%s to Drive url=%s", session_id, url)
    return url
