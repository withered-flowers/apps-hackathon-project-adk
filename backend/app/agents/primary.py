"""
PrimaryAgent — Supervisor orchestrator for the Decidely.ai multi-agent pipeline.

Coordinates the Interviewer → Researcher → Evaluator → Supporter workflow
maintaining multi-turn conversational context throughout.

Key design decisions:
- When criteria are complete, the full Research → Evaluate → Support chain runs
  within a SINGLE HTTP request so the user never needs to "send a message" to
  advance the pipeline.
- `_call_agent` collects ALL text across ALL final-response events (ADK tool-using
  agents may emit the JSON on the event after the tool call resolves).
- Raw agent responses are logged at DEBUG level to aid troubleshooting.

Adaptive Decision Modes:
- On the first user message, `_classify_decision` is called to detect whether
  this is a "purchase" or "strategic" decision. The result is locked for the
  session (immutable after classification).
- All downstream agents receive decision_type and decision_domain in their
  prompts so they can adapt their behavior accordingly.
- Timeouts: 30 s for purchase, 90 s for strategic (via asyncio.wait_for).
"""

from __future__ import annotations

import asyncio
import json
import re
from typing import Any

from google.adk.agents import LlmAgent
from google.adk.runners import Runner
from google.adk.sessions import InMemorySessionService
from google.genai.types import Content, Part

from app.agents.evaluator import create_evaluator_agent
from app.agents.interviewer import create_interviewer_agent
from app.agents.researcher import create_researcher_agent
from app.agents.supporter import create_supporter_agent
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger("agents.primary")

PRIMARY_INSTRUCTION = """
You are the Primary orchestrator agent for Decidely.ai — a multi-agent decision support system.

You manage a structured pipeline:
  1. INTERVIEWING: Delegate to InterviewerAgent until criteria are complete
  2. RESEARCHING: Delegate to ResearcherAgent to find options matching criteria
  3. EVALUATING: Delegate to EvaluatorAgent to score and rank options
  4. SUPPORTING: Delegate to SupporterAgent to deliver the final recommendation

## Current Session State
You will receive context about:
  - The session's current status (Interviewing/Researching/Evaluating/Complete)
  - Previously collected criteria (if any)
  - Previously found options (if any)

## Routing Rules
- If status is "Interviewing": Route to InterviewerAgent
- If status is "Researching": Route to ResearcherAgent with criteria context
- If status is "Evaluating": Route to EvaluatorAgent with criteria + options context
- If status is "Complete": Route to SupporterAgent for final summary

Always maintain context between turns. Be a helpful coordinator.
"""

# ── Classification (T003, T023) ────────────────────────────────────────────────

_CLASSIFICATION_PROMPT = """
Analyze the user's question and classify it as one of two decision types:
- "purchase": The user wants to buy a product or service for personal or team use
  (e.g., "which laptop should I buy?", "best headphones under $200")
- "strategic": The user is making an important organizational or non-purchase decision
  (e.g., "should we migrate from GCP to AWS?", "which CRM to adopt for the company?")

Guidance for ambiguous cases:
- Organizational language ("we", "the team", "our company") + long-term impact → "strategic"
- Personal language ("I need", "for me") + consumer products + specific price caps → "purchase"
- Picking a tool for a team (not just yourself) with vendor/contract implications → "strategic"

Also determine the decision domain:
- "finance": Involves financial ROI, investment, budget allocation, or business valuation
- "infrastructure": Involves technology stacks, cloud, systems, platforms, or DevOps tools
- "general": Any other strategic decision (hiring, market expansion, process change, etc.)

You MUST always return a valid JSON classification — never return "unknown" or "other".

Respond ONLY with this JSON (no markdown, no extra text):
{{"decision_type": "purchase"|"strategic", "decision_domain": "finance"|"infrastructure"|"general"}}

User's question: {question}
"""


def _extract_json(text: str) -> dict[str, Any] | None:
    """Attempt to parse JSON from agent response text."""
    if not text:
        return None

    # Try direct parse first
    try:
        return json.loads(text.strip())
    except (json.JSONDecodeError, ValueError):
        pass

    # Try extracting from markdown code blocks
    match = re.search(r"```(?:json)?\s*([\s\S]+?)\s*```", text)
    if match:
        try:
            return json.loads(match.group(1))
        except (json.JSONDecodeError, ValueError):
            pass

    # Try finding raw JSON object/array in the text
    match = re.search(r"(\{[\s\S]+\})", text)
    if match:
        try:
            return json.loads(match.group(1))
        except (json.JSONDecodeError, ValueError):
            pass

    return None


# ── Pipeline ───────────────────────────────────────────────────────────────────


class DecisionPipeline:
    """
    Manages the multi-turn decision pipeline state and agent orchestration.

    Routing logic lives here (Python-level supervisor) so we have precise
    control over session state and can auto-chain phases within one request.

    Adaptive modes: classifies each new session as "purchase" or "strategic" on
    the first message, then routes all subsequent agents with that context.
    """

    def __init__(self) -> None:
        self._session_service = InMemorySessionService()
        self._interviewer = create_interviewer_agent()
        self._researcher = create_researcher_agent()
        self._evaluator = create_evaluator_agent()
        self._supporter = create_supporter_agent()
        # Lightweight classifier agent — no tools needed, just fast JSON output
        self._classifier = LlmAgent(
            name="ClassifierAgent",
            model=settings.google_adk_model,
            instruction=(
                "You are a decision classifier. "
                "Return only JSON when asked to classify a decision."
            ),
        )

    def _make_runner(self, agent: LlmAgent) -> Runner:
        return Runner(
            agent=agent,
            app_name="decidely-ai",
            session_service=self._session_service,
            auto_create_session=True,
        )

    # ── Core agent call ────────────────────────────────────────────────────────

    async def _call_agent(self, agent: LlmAgent, session_id: str, message: str) -> str:
        """
        Call an agent and return its aggregated text response.

        Collects ALL text parts across ALL events so that tool-using agents
        (like ResearcherAgent) whose JSON answer arrives after a tool-call
        event are captured correctly.
        """
        runner = self._make_runner(agent)
        adk_session_id = f"{session_id}-{agent.name}"
        user_content = Content(role="user", parts=[Part(text=message)])

        parts: list[str] = []
        async for event in runner.run_async(
            user_id="anonymous",
            session_id=adk_session_id,
            new_message=user_content,
        ):
            if event.is_final_response():
                if event.content and event.content.parts:
                    for part in event.content.parts:
                        if part.text:
                            parts.append(part.text)

        response_text = "\n".join(parts)
        logger.debug(
            "Agent=%s session=%s raw_response_len=%d preview=%r",
            agent.name,
            session_id,
            len(response_text),
            response_text[:200],
        )
        return response_text

    # ── T003: Classification ───────────────────────────────────────────────────

    async def _classify_decision(self, session_id: str, user_message: str) -> dict[str, str]:
        """
        Classify the user's first message as 'purchase' or 'strategic'.

        Always returns a valid dict — falls back to purchase/general on any
        parse failure (T024 validation).
        """
        prompt = _CLASSIFICATION_PROMPT.format(question=user_message)
        response = await self._call_agent(self._classifier, session_id, prompt)
        parsed = _extract_json(response)

        # T024: strict validation with safe fallback
        _default: dict[str, str] = {"decision_type": "purchase", "decision_domain": "general"}
        if not parsed or not isinstance(parsed, dict):
            logger.warning(
                "Classification parse failed for session=%s — defaulting to purchase/general",
                session_id,
            )
            return _default

        decision_type = parsed.get("decision_type", "purchase")
        if decision_type not in ("purchase", "strategic"):
            logger.warning(
                "Unknown decision_type=%r for session=%s — defaulting to purchase",
                decision_type,
                session_id,
            )
            decision_type = "purchase"

        decision_domain = parsed.get("decision_domain", "general")
        if decision_domain not in ("finance", "infrastructure", "general"):
            logger.warning(
                "Unknown decision_domain=%r for session=%s — defaulting to general",
                decision_domain,
                session_id,
            )
            decision_domain = "general"

        return {"decision_type": decision_type, "decision_domain": decision_domain}

    # ── Top-level entry point ──────────────────────────────────────────────────

    async def run(
        self,
        session_id: str,
        user_message: str,
        session_data: dict[str, Any],
    ) -> tuple[str, str, str, dict[str, Any]]:
        """
        Run the pipeline for a single user turn.

        Returns: (agent_name, response_text, new_status, updated_session_data)
        """
        status = session_data.get("status", "Interviewing")
        criteria = session_data.get("criteria", [])
        options = session_data.get("options", [])

        logger.info(
            "Pipeline run: session=%s status=%s decision_type=%s message_len=%d",
            session_id,
            status,
            session_data.get("decision_type", "unset"),
            len(user_message),
        )

        if status == "Interviewing":
            return await self._run_interviewing(session_id, user_message, session_data, criteria)
        elif status in ("Researching", "Evaluating"):
            # Auto-chain: run the full remaining pipeline in one shot
            return await self._run_full_pipeline(session_id, session_data)
        elif status == "Complete":
            return await self._run_supporting(
                session_id, user_message, criteria, options, session_data
            )
        else:
            session_data["status"] = "Interviewing"
            return await self._run_interviewing(session_id, user_message, session_data, criteria)

    # ── T004: Phase: Interviewing ──────────────────────────────────────────────

    async def _run_interviewing(
        self,
        session_id: str,
        user_message: str,
        session_data: dict[str, Any],
        existing_criteria: list,
    ) -> tuple[str, str, str, dict[str, Any]]:
        """
        Handle the Interviewing phase.

        Classifies the decision on the very first message (when decision_type is
        not yet set in session_data), then delegates to the InterviewerAgent
        with full decision context injected into the prompt.
        """
        # T004: classify on first message only
        if not session_data.get("decision_type"):
            classification = await self._classify_decision(session_id, user_message)
            session_data["decision_type"] = classification["decision_type"]
            session_data["decision_domain"] = classification["decision_domain"]
            logger.info(
                "Classified session=%s as decision_type=%s domain=%s",
                session_id,
                classification["decision_type"],
                classification["decision_domain"],
            )

        decision_type = session_data.get("decision_type", "purchase")
        decision_domain = session_data.get("decision_domain", "general")

        # T008/T013: inject decision context into interviewer prompt
        if existing_criteria:
            context = (
                f"Decision Type: {decision_type}\n"
                f"Decision Domain: {decision_domain}\n\n"
                f"Existing criteria collected so far: {json.dumps(existing_criteria)}\n\n"
                f"User says: {user_message}"
            )
        else:
            context = (
                f"Decision Type: {decision_type}\n"
                f"Decision Domain: {decision_domain}\n\n"
                f"User says: {user_message}"
            )

        response = await self._call_agent(self._interviewer, session_id, context)
        parsed = _extract_json(response)

        if parsed and parsed.get("criteria_complete"):
            new_criteria = parsed.get("criteria", [])
            session_data["criteria"] = new_criteria
            session_data["status"] = "Researching"
            logger.info(
                "Criteria complete (%d items) for session=%s — auto-chaining pipeline",
                len(new_criteria),
                session_id,
            )
            # Immediately chain into Research → Evaluate → Support
            return await self._run_full_pipeline(session_id, session_data)

        return "InterviewerAgent", response, "Interviewing", session_data

    # ── T012/T021: Auto-chain with timeout ────────────────────────────────────

    async def _run_full_pipeline(
        self,
        session_id: str,
        session_data: dict[str, Any],
    ) -> tuple[str, str, str, dict[str, Any]]:
        """
        Run Research → Evaluate → Support phases in sequence within one request.

        Wraps the inner pipeline with asyncio.wait_for:
        - Purchase mode: 30-second timeout
        - Strategic mode: 90-second timeout
        """
        decision_type = session_data.get("decision_type", "purchase")
        timeout_seconds = 90 if decision_type == "strategic" else 30

        logger.info(
            "Starting full pipeline for session=%s decision_type=%s timeout=%ds",
            session_id,
            decision_type,
            timeout_seconds,
        )

        try:
            return await asyncio.wait_for(
                self._run_full_pipeline_inner(session_id, session_data),
                timeout=timeout_seconds,
            )
        except TimeoutError:
            logger.warning(
                "Pipeline timed out after %ds for session=%s",
                timeout_seconds,
                session_id,
            )
            return (
                "System",
                (
                    "I'm sorry — that analysis took a bit longer than expected and timed out. "
                    "Please try again or rephrase your question."
                ),
                session_data.get("status", "Researching"),
                session_data,
            )

    async def _run_full_pipeline_inner(
        self,
        session_id: str,
        session_data: dict[str, Any],
    ) -> tuple[str, str, str, dict[str, Any]]:
        """
        Inner Research → Evaluate → Support chain (no timeout here — handled by caller).

        All agents receive decision_type and decision_domain in their prompts so
        they can adapt their behavior for purchase vs. strategic mode.
        """
        criteria = session_data.get("criteria", [])
        decision_type = session_data.get("decision_type", "purchase")
        decision_domain = session_data.get("decision_domain", "general")
        topic = session_data.get("topic", "the user's decision")

        # ── T009/T016: Research ───────────────────────────────────────────────
        logger.info("Auto-chain: running ResearcherAgent for session=%s", session_id)
        research_prompt = (
            f"Decision Type: {decision_type}\n"
            f"Decision Domain: {decision_domain}\n"
            f"Decision topic: {topic}\n"
            f"User criteria: {json.dumps(criteria)}\n\n"
            "Please research and find the top 3-5 best options."
        )
        research_response = await self._call_agent(self._researcher, session_id, research_prompt)
        research_parsed = _extract_json(research_response)

        if not research_parsed or "options" not in research_parsed:
            logger.warning(
                "Researcher returned no parseable JSON for session=%s — response: %r",
                session_id,
                research_response[:500],
            )
            # Stay in Researching so user can retry
            session_data["status"] = "Researching"
            return (
                "ResearcherAgent",
                (
                    "I had trouble finding specific options right now. "
                    "Could you provide more details about your decision?"
                ),
                "Researching",
                session_data,
            )

        new_options = research_parsed["options"]
        session_data["options"] = new_options
        session_data["status"] = "Evaluating"
        logger.info("Found %d options for session=%s", len(new_options), session_id)

        # ── T010/T018: Evaluate ───────────────────────────────────────────────
        logger.info("Auto-chain: running EvaluatorAgent for session=%s", session_id)
        eval_prompt = (
            f"Decision Type: {decision_type}\n"
            f"Decision Domain: {decision_domain}\n"
            f"Criteria: {json.dumps(criteria)}\n"
            f"Options: {json.dumps(new_options)}\n\n"
            "Please score these options and produce the decision matrix."
        )
        eval_response = await self._call_agent(self._evaluator, session_id, eval_prompt)
        eval_parsed = _extract_json(eval_response)

        if eval_parsed and "matrix" in eval_parsed:
            matrix = eval_parsed["matrix"]
            recommendation = eval_parsed.get("recommendation", "")
            session_data["matrix"] = matrix
            session_data["recommendation"] = recommendation
            session_data["options"] = matrix.get("options", new_options)
            session_data["status"] = "Complete"
            logger.info(
                "Evaluation complete for session=%s recommendation=%s",
                session_id,
                recommendation,
            )
        else:
            logger.warning(
                "Evaluator returned no parseable matrix for session=%s — response: %r",
                session_id,
                eval_response[:500],
            )
            session_data["status"] = "Complete"
            recommendation = new_options[0].get("title", "top option") if new_options else "N/A"
            session_data["recommendation"] = recommendation

        # ── T011/T020: Support ────────────────────────────────────────────────
        logger.info("Auto-chain: running SupporterAgent for session=%s", session_id)
        support_prompt = (
            f"Decision Type: {decision_type}\n"
            f"Decision Domain: {decision_domain}\n"
            f"User's original decision question: {topic}\n"
            f"Criteria: {json.dumps(criteria)}\n"
            f"Options found: {json.dumps(new_options)}\n"
            f"Top recommendation: {recommendation}\n\n"
            "Please provide your final recommendation and encouragement."
        )
        support_response = await self._call_agent(self._supporter, session_id, support_prompt)

        return "SupporterAgent", support_response, "Complete", session_data

    # ── Phase: Supporting (follow-up after Complete) ───────────────────────────

    async def _run_supporting(
        self,
        session_id: str,
        user_message: str,
        criteria: list,
        options: list,
        session_data: dict[str, Any],
    ) -> tuple[str, str, str, dict[str, Any]]:
        """Handle follow-up messages after the decision is complete."""
        recommendation = session_data.get("recommendation", "")
        matrix = session_data.get("matrix", {})
        topic = session_data.get("topic", "decision")
        decision_type = session_data.get("decision_type", "purchase")
        decision_domain = session_data.get("decision_domain", "general")
        prompt = (
            f"Decision Type: {decision_type}\n"
            f"Decision Domain: {decision_domain}\n"
            f"User's original decision question: {topic}\n"
            f"Criteria: {json.dumps(criteria)}\n"
            f"Top recommendation: {recommendation}\n"
            f"Matrix: {json.dumps(matrix)}\n\n"
            f"User follow-up message: {user_message}"
        )
        response = await self._call_agent(self._supporter, session_id, prompt)
        return "SupporterAgent", response, "Complete", session_data


# ── Singleton ──────────────────────────────────────────────────────────────────

_pipeline: DecisionPipeline | None = None


def get_pipeline() -> DecisionPipeline:
    """Return the singleton DecisionPipeline."""
    global _pipeline
    if _pipeline is None:
        _pipeline = DecisionPipeline()
    return _pipeline
