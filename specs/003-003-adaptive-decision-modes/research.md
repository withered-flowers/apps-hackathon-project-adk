# Research: Adaptive Decision Modes

**Feature**: 003-003-adaptive-decision-modes  
**Date**: 2026-04-28

## R1: LLM-Based Decision Type Classification

**Decision**: Use the existing LLM (Gemini 2.0 Flash) to classify the user's first message as `purchase` or `strategic` via an enhanced system prompt in the primary orchestrator, before delegating to the Interviewer.

**Rationale**: The spec mandates pure LLM free-form reasoning with no keyword rules. Adding classification logic to `primary.py`'s `_run_interviewing` method (before delegating to the Interviewer) is the simplest approach — a single LLM call with a classification-focused prompt that returns a JSON `{"decision_type": "purchase"|"strategic"}` object. This avoids creating a new agent and stays within the existing ADK framework.

**Alternatives considered**:
- **Separate ClassifierAgent**: Rejected — adds a new agent, extra latency, and complexity for a single-turn classification
- **Keyword-based rules**: Rejected by spec clarification (Q1)
- **Inline in InterviewerAgent**: Rejected — mixing classification with interviewing makes the prompt too complex and harder to test independently

## R2: Dynamic Criteria Generation for Strategic Mode

**Decision**: Enhance the `InterviewerAgent` with a conditional instruction set that includes a "criteria generation" phase when `decision_type=strategic`. The agent will first output a criteria list, then ask questions one at a time.

**Rationale**: The spec requires criteria to be surfaced briefly upfront before questions begin. This is naturally modeled by having the Interviewer's first response (in strategic mode) be a message like "For this decision I'll explore: X, Y, Z. Let's start…" followed by the first question. The criteria set is capped at 7 (per clarification Q4).

**Alternatives considered**:
- **Separate CriteriaGeneratorAgent**: Rejected — over-engineering for a prompt-level behavioral change
- **Frontend-driven criteria selection**: Rejected — spec says no user approval needed

## R3: Decision-Type-Aware Researcher Instructions

**Decision**: Pass `decision_type` as context to the Researcher agent via the research prompt. The Researcher's instruction already supports variable prompts; we add conditional guidance (e.g., "perform thorough, multi-dimensional research" for strategic vs. "find top 3-5 products" for purchase).

**Rationale**: The Researcher agent uses Google Search grounding. For strategic mode, the prompt will instruct the agent to search across multiple dimensions (cost, capability, risk, ecosystem) rather than just matching product criteria. No code changes to the agent itself — only to how `primary.py` and `decision_service.py` construct the prompt.

**Alternatives considered**:
- **Two separate Researcher agents**: Rejected — unnecessary duplication; the same agent with different prompts achieves the goal
- **Multiple sequential research calls**: Considered but deferred — the single-call approach with richer prompting should be sufficient given the 90s time budget

## R4: Domain-Specific Evaluation Matrices

**Decision**: Enhance the `EvaluatorAgent` instruction to accept `decision_type` and `decision_domain` context, then conditionally apply different scoring frameworks:
- **Purchase**: Current matrix (Budget, Use-Case, Preferences — 1-10 weighted)
- **Strategic/Financial**: ROI/NPV, Strategic Fit, Ease of Execution, Risk Mitigation
- **Strategic/Infrastructure**: Technical Fit, Scalability, Vendor Lock-in, Compliance
- **Strategic/General**: A baseline strategic matrix the LLM adapts to the domain

**Rationale**: The spec requires different evaluation frameworks for different domains. Rather than hard-coding every possible matrix, we provide explicit matrices for the two most common strategic sub-domains (finance and infrastructure) and let the LLM adapt for others. The `decision_domain` is determined during classification.

**Alternatives considered**:
- **Fully LLM-determined matrix for all strategic decisions**: Too unpredictable — scoring criteria would vary across runs
- **Hard-coded matrix registry**: Over-engineering — the LLM can select from a small set of provided templates

## R5: Differentiated Supporter Output Formats

**Decision**: Pass `decision_type` to the Supporter agent's prompt context. For `purchase`, use the existing concise style. For `strategic`, instruct the Supporter to generate a structured stakeholder report with: Executive Summary, Full Comparison Table, Risk Analysis, and Recommendation with Justification.

**Rationale**: The spec requires "detailed stakeholder-ready report" for strategic decisions. This is purely a prompt-level change — the Supporter already generates free-form text.

**Alternatives considered**:
- **Structured JSON output from Supporter**: Rejected — the Supporter is the user-facing output agent; natural language is appropriate
- **Frontend-driven report formatting**: Could complement but doesn't replace the agent's content generation

## R6: Session Data Extension

**Decision**: Add `decision_type` (str: `"purchase"` | `"strategic"`) and `decision_domain` (str: e.g., `"finance"`, `"infrastructure"`, `"general"`) fields to the `DecisionSession` entity and Firestore document. These are set once at classification time and are immutable per session (per clarification Q3, FR-015).

**Rationale**: Every downstream agent needs access to the decision type. Storing it in session data (which is already passed through the pipeline) is the simplest approach with no architectural changes.

**Alternatives considered**:
- **In-memory only (not persisted)**: Rejected — session reload from Firestore on reconnect would lose the classification
- **Separate classification collection in Firestore**: Over-engineering for a single field

## R7: Pipeline Timeout Handling

**Decision**: Add `asyncio.wait_for` wrapping around the auto-chain pipeline execution in `primary.py` with differentiated timeouts: 30s for purchase, 90s for strategic. On timeout, return a graceful error message rather than silently hanging.

**Rationale**: Per clarification Q5 and FR-016, both modes must surface a result or error within their time windows. `asyncio.wait_for` is the idiomatic Python approach for enforcing async timeouts.

**Alternatives considered**:
- **HTTP-level timeout only**: Insufficient — doesn't produce a user-friendly error message
- **Per-agent timeouts**: More granular but adds complexity; pipeline-level timeout is sufficient for MVP
