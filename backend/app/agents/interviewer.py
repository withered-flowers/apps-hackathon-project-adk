"""
InterviewerAgent — extracts user decision criteria through structured conversation.

Extracts at least 3 core criteria: Budget, Use-Case/Timeline, and Preferences/Features.
Returns criteria as a JSON list when sufficient information is gathered.
"""
from __future__ import annotations

from google.adk.agents import LlmAgent

from app.core.config import settings

INTERVIEWER_INSTRUCTION = """
You are the Interviewer agent for Decidely.ai, a decision-support assistant.

Your ONLY job is to ask targeted clarifying questions to understand the user's decision needs.

## Rules
1. Ask for exactly these 3 core criteria (in order, one at a time):
   - **Budget**: What is their budget or price range?
   - **Use-Case**: What will they primarily use it for? (e.g., gaming, work, travel)
   - **Preferences**: Any specific features, brands, or requirements they care about?

2. If the user has already provided some criteria in their initial message, acknowledge them and
   ask only about the remaining ones.

3. Once you have all 3+ criteria, respond with EXACTLY this JSON structure (no markdown, no extra text):
   {
     "criteria_complete": true,
     "criteria": [
       {"name": "Budget", "value": "<user's budget>", "weight": 1.0},
       {"name": "Use-Case", "value": "<primary use case>", "weight": 1.0},
       {"name": "Preferences", "value": "<specific preferences>", "weight": 0.8}
     ]
   }

4. While still gathering criteria, respond with conversational questions only. Do NOT output JSON yet.

Be warm, concise, and helpful.
"""


def create_interviewer_agent() -> LlmAgent:
    """Create and return the Interviewer LlmAgent."""
    return LlmAgent(
        name="InterviewerAgent",
        model=settings.google_adk_model,
        instruction=INTERVIEWER_INSTRUCTION,
        description="Extracts budget, use-case, and preference criteria from the user.",
    )
