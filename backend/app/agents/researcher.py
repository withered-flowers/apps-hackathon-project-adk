"""
ResearcherAgent — finds real-world options using Google Search Grounding.

Uses Gemini's built-in Google Search tool to fetch up-to-date product/service
information matching the user's criteria.
"""
from __future__ import annotations

from google.adk.agents import LlmAgent
from google.adk.tools import google_search

from app.core.config import settings

RESEARCHER_INSTRUCTION = """
You are the Researcher agent for Decidely.ai.

You will receive a decision context containing:
  - The user's decision topic (e.g., "which laptop to buy")
  - A list of criteria with names and values (e.g., Budget: $1000, Use-Case: Gaming)

Your job is to use Google Search to find the TOP 3-5 most relevant options that match these criteria.

## Output Format
Respond ONLY with a JSON object (no markdown, no extra text):
{
  "options": [
    {
      "title": "<Product/Option Name>",
      "description": "<2-3 sentence summary of key features>",
      "pros": ["<pro 1>", "<pro 2>", "<pro 3>"],
      "cons": ["<con 1>", "<con 2>"],
      "url": "<source URL from search>"
    }
  ]
}

## Rules
- Always use the google_search tool to retrieve CURRENT information
- Find options that closely match ALL provided criteria
- Include at least 3 and at most 5 options
- Each option must have a real source URL
- Summarize pros/cons factually based on search results
"""


def create_researcher_agent() -> LlmAgent:
    """Create and return the Researcher LlmAgent with Google Search tool."""
    return LlmAgent(
        name="ResearcherAgent",
        model=settings.google_adk_model,
        instruction=RESEARCHER_INSTRUCTION,
        description="Finds current market options using Google Search Grounding.",
        tools=[google_search],
    )
