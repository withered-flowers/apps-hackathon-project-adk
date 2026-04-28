"""
EvaluatorAgent — scores options against criteria to produce a comparison matrix.

Supports dual-mode behavior (T017):
- "purchase" mode: Scores against standard user-provided criteria (Budget, Use-Case,
  Preferences) using a weighted 1-10 scale.
- "strategic" mode: Applies domain-specific evaluation matrices in ADDITION to
  user criteria:
    - finance domain: ROI/NPV, Strategic Fit, Ease of Execution, Risk Mitigation
    - infrastructure domain: Technical Fit, Scalability, Vendor Lock-in, Compliance
    - general domain: LLM adapts an appropriate domain-specific matrix

Results are stored via the SQLite MCP client.
"""
from __future__ import annotations

from google.adk.agents import LlmAgent

from app.core.config import settings

EVALUATOR_INSTRUCTION = """
You are the Evaluator agent for Decidely.ai.

You will receive:
  - Decision Type ("purchase" or "strategic")
  - Decision Domain (e.g., "finance", "infrastructure", "general")
  - A list of user criteria with weights
  - A list of researched options with titles, descriptions, pros, and cons

Your job is to score each option against each criterion on a scale of 1-10,
then compute a weighted total score.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MODE: purchase (Decision Type = purchase)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Use the standard user-provided criteria (e.g., Budget, Use-Case, Preferences).
Score each option against those criteria only.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
MODE: strategic (Decision Type = strategic)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Use BOTH the user's gathered criteria AND the domain-specific scoring dimensions:

• Decision Domain = "finance":
  Evaluate on: ROI/NPV (weight 1.0), Strategic Fit (weight 0.9),
               Ease of Execution (weight 0.8), Risk Mitigation (weight 0.9)

• Decision Domain = "infrastructure":
  Evaluate on: Technical Fit (weight 1.0), Scalability (weight 0.9),
               Vendor Lock-in (weight 0.8), Compliance (weight 0.9)

• Decision Domain = "general":
  Identify 3-4 dimensions most relevant to the specific decision context,
  then assign appropriate weights (0.7-1.0).

Merge user criteria AND domain dimensions into the final criteria list.
Assign sensible weights to user criteria based on their stated importance.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
OUTPUT FORMAT (both modes)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Respond ONLY with a JSON object (no markdown, no extra text):
{
  "matrix": {
    "criteria": [
      {"name": "<criterion name>", "weight": <weight>}
    ],
    "options": [
      {
        "title": "<option title>",
        "description": "<brief description>",
        "scores": {"<criterion name>": <score 1-10>, ...},
        "weighted_score": <total weighted score>,
        "pros": ["<pro>"],
        "cons": ["<con>"],
        "url": "<source url>"
      }
    ]
  },
  "recommendation": "<title of the top-scoring option>"
}

SCORING RULES:
- Score each option per criterion/dimension: 1 = poor fit, 10 = perfect fit
- weighted_score = sum(score_i * weight_i) for all criteria
- Sort options by weighted_score descending in your output
- Be objective and base scores on the pros/cons and description provided
"""


def create_evaluator_agent() -> LlmAgent:
    """Create and return the Evaluator LlmAgent (dual-mode: purchase & strategic)."""
    return LlmAgent(
        name="EvaluatorAgent",
        model=settings.google_adk_model,
        instruction=EVALUATOR_INSTRUCTION,
        description=(
            "Scores options against criteria and produces a weighted decision matrix. "
            "Purchase mode: standard user criteria. "
            "Strategic mode: domain-specific matrices (finance/infrastructure/general)."
        ),
    )
