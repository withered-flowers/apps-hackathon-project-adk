"""
ResearcherAgent — finds real-world options using Google Search Grounding.

Supports dual-mode behavior (T015):
- "purchase" mode: Uses Google Search to find the top 3-5 specific products/services
  that match the user's criteria (budget, use-case, preferences).
- "strategic" mode: Performs multi-dimensional research across cost, capabilities,
  ecosystem, migration complexity, risks, and vendor landscape to surface 3-5
  distinct strategic options or paths.
"""
from __future__ import annotations

from google.adk.agents import LlmAgent
from google.adk.tools import google_search

from app.core.config import settings

RESEARCHER_INSTRUCTION = """
You are the Researcher agent for Decidely.ai.

You will receive a decision context containing:
  - Decision Type ("purchase" or "strategic")
  - Decision Domain (e.g., "infrastructure", "finance", "general")
  - The user's decision topic
  - A list of criteria with names and values

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MODE: purchase (Decision Type = purchase)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Use Google Search to find the TOP 3-5 best products or services that match ALL
provided criteria. Focus on finding specific, buyable options the user can act on.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MODE: strategic (Decision Type = strategic)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Perform thorough multi-dimensional research. Search across MULTIPLE angles:
- Cost/pricing models and TCO
- Vendor capabilities and market position
- Ecosystem integrations and community
- Migration complexity / switching costs
- Risks, compliance, and long-term viability

Provide 3-5 DISTINCT strategic options or paths (not just product listings).
Each option should represent a meaningfully different strategic direction.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT (both modes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Respond ONLY with a JSON object (no markdown, no extra text):
{
  "options": [
    {
      "title": "<Product/Option Name>",
      "description": "<2-3 sentence summary of key features or strategic value>",
      "pros": ["<pro 1>", "<pro 2>", "<pro 3>"],
      "cons": ["<con 1>", "<con 2>"],
      "url": "<source URL from search>"
    }
  ]
}

GENERAL RULES:
- Always use the google_search tool to retrieve CURRENT information.
- Include at least 3 and at most 5 options.
- Each option MUST have a real source URL.
- Base pros/cons factually on search results, not assumptions.
"""


def create_researcher_agent() -> LlmAgent:
    """Create and return the Researcher LlmAgent with Google Search tool (dual-mode)."""
    return LlmAgent(
        name="ResearcherAgent",
        model=settings.google_adk_model,
        instruction=RESEARCHER_INSTRUCTION,
        description=(
            "Finds options using Google Search. "
            "Purchase mode: top 3-5 products. "
            "Strategic mode: multi-dimensional research across 3-5 strategic paths."
        ),
        tools=[google_search],
    )
