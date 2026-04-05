"""
Markdown Generator MCP server for Decidely.ai decision reports.

Generates comprehensive markdown reports including:
- Chat session summary
- Decision matrix table
- SWOT analysis (Strengths, Weaknesses, Opportunities, Threats)
"""

from __future__ import annotations

from datetime import datetime
from typing import Any

from app.core.logging import get_logger

logger = get_logger("mcp.markdown_generator")


def _generate_chat_summary(transcript: list[dict[str, Any]]) -> str:
    """Generate a markdown summary of the conversation history."""
    if not transcript:
        return "*No conversation history available.*"

    lines = [
        "## Conversation Summary",
        "",
        f"**Total Messages**: {len(transcript)}",
        "",
    ]

    user_messages = [m for m in transcript if m.get("role") == "user"]
    assistant_messages = [m for m in transcript if m.get("role") == "assistant"]

    lines.append(f"**User Messages**: {len(user_messages)}")
    lines.append(f"**Assistant Messages**: {len(assistant_messages)}")
    lines.append("")

    agents_used = set()
    for msg in transcript:
        if msg.get("agent"):
            agents_used.add(msg["agent"])

    if agents_used:
        lines.append("**Agents Involved**:")
        for agent in sorted(agents_used):
            lines.append(f"- {agent}")
        lines.append("")

    lines.append("### Conversation Timeline")
    lines.append("")

    for msg in transcript:
        role = msg.get("role", "unknown").capitalize()
        agent = msg.get("agent", "")
        content = msg.get("content", "")
        timestamp = msg.get("timestamp", "")

        prefix = f"**{role}** ({agent})" if agent else f"**{role}**"
        if timestamp:
            prefix += f" — *{timestamp}*"

        lines.append(prefix)
        lines.append(f": {content}")
        lines.append("")

    return "\n".join(lines)


def _generate_decision_matrix(
    criteria: list[dict[str, Any]],
    options: list[dict[str, Any]],
) -> str:
    """Generate a markdown table for the decision matrix."""
    if not options:
        return "*No decision matrix available.*"

    lines = [
        "## Decision Matrix",
        "",
    ]

    if not criteria:
        lines.append("*No criteria defined for this session.*")
        return "\n".join(lines)

    crit_names = [c.get("name", "?") for c in criteria]
    crit_weights = [c.get("weight", 1.0) for c in criteria]

    header = (
        "| Option | "
        + " | ".join(f"{name} (w={w})" for name, w in zip(crit_names, crit_weights))
        + " | Total Score |"
    )
    separator = "|" + "|".join(["--------"] * (len(crit_names) + 2)) + "|"
    lines.append(header)
    lines.append(separator)

    for opt in options:
        scores = opt.get("scores", {})
        row_scores = " | ".join(str(scores.get(cn, "—")) for cn in crit_names)
        total = opt.get("weighted_score", "—")
        lines.append(f"| {opt.get('title', '?')} | {row_scores} | {total} |")

    lines.append("")

    lines.append("### Options Detail")
    lines.append("")

    for opt in options:
        lines.append(f"#### {opt.get('title', '?')}")
        lines.append("")
        lines.append(opt.get("description", ""))
        lines.append("")
        lines.append(f"**Source**: {opt.get('url', 'N/A')}")
        lines.append("")

    return "\n".join(lines)


def _generate_swot_analysis(options: list[dict[str, Any]]) -> str:
    """Generate a SWOT analysis table from all options' pros and cons."""
    if not options:
        return "*No options available for SWOT analysis.*"

    lines = [
        "## SWOT Analysis",
        "",
    ]

    all_strengths = []
    all_weaknesses = []
    all_opportunities = []
    all_threats = []

    for opt in options:
        title = opt.get("title", "Unknown")
        pros = opt.get("pros", [])
        cons = opt.get("cons", [])
        score = opt.get("weighted_score", 0)

        for pro in pros:
            all_strengths.append(f"**{title}**: {pro}")

        for con in cons:
            all_weaknesses.append(f"**{title}**: {con}")

        if score and score > 0:
            all_opportunities.append(f"**{title}**: High scoring option (score: {score})")

        if score and score < 0:
            all_threats.append(f"**{title}**: Low scoring option (score: {score})")

    lines.append("| Category | Details |")
    lines.append("|----------|---------|")

    lines.append("| **Strengths** | |")
    if all_strengths:
        for s in all_strengths:
            lines.append(f"| | {s} |")
    else:
        lines.append("| | *No strengths identified* |")

    lines.append("| **Weaknesses** | |")
    if all_weaknesses:
        for w in all_weaknesses:
            lines.append(f"| | {w} |")
    else:
        lines.append("| | *No weaknesses identified* |")

    lines.append("| **Opportunities** | |")
    if all_opportunities:
        for o in all_opportunities:
            lines.append(f"| | {o} |")
    else:
        lines.append("| | *No opportunities identified* |")

    lines.append("| **Threats** | |")
    if all_threats:
        for t in all_threats:
            lines.append(f"| | {t} |")
    else:
        lines.append("| | *No threats identified* |")

    lines.append("")

    return "\n".join(lines)


def generate_markdown_report(session_data: dict[str, Any]) -> str:
    """
    Generate a comprehensive markdown report from session data.

    Includes:
    - Session header with metadata
    - Recommendation
    - Criteria summary
    - Decision matrix table
    - SWOT analysis
    - Conversation summary

    Args:
        session_data: Dictionary containing session information from Firestore

    Returns:
        Complete markdown report as a string
    """
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
        "## Recommendation",
        "",
        f"**{recommendation}**",
        "",
        "---",
        "",
        "## Your Criteria",
        "",
    ]

    for c in criteria:
        lines.append(
            f"- **{c.get('name', '?')}**: {c.get('value', '?')} (weight: {c.get('weight', 1.0)})"
        )

    lines += [
        "",
        "---",
        "",
    ]

    lines.append(_generate_decision_matrix(criteria, options))

    lines += [
        "",
        "---",
        "",
    ]

    lines.append(_generate_swot_analysis(options))

    lines += [
        "",
        "---",
        "",
    ]

    lines.append(_generate_chat_summary(transcript))

    return "\n".join(lines)
