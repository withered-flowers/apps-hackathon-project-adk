# Implementation Plan: Adaptive Decision Modes

**Branch**: `003-003-adaptive-decision-modes` | **Date**: 2026-04-28 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `specs/003-003-adaptive-decision-modes/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

Enhance the Decidely.ai multi-agent pipeline to distinguish between **purchase decisions** and **strategic/important decisions**. The system classifies the user's first message via LLM free-form reasoning, then adapts every pipeline stage: interview depth (3 fixed vs. 3-7 dynamic criteria), research breadth (product search vs. multi-dimensional analysis), evaluation framework (standard weighted matrix vs. domain-specific matrices like ROI/NPV or Technical Fit), and output format (concise summary vs. detailed stakeholder report). All changes are prompt-level behavioral adaptations within the existing agent architecture — no new agents or structural pipeline changes.

## Technical Context

**Language/Version**: Python 3.13 (Backend)
**Primary Dependencies**: google-adk ≥1.0.0, FastAPI ≥0.115.0, Pydantic ≥2.9.0, google-cloud-firestore ≥2.19.0
**Storage**: Firestore (session persistence), SQLite via MCP (criteria/options)
**Testing**: pytest with pytest-asyncio (asyncio_mode=auto)
**Target Platform**: Linux server (Cloud Run)
**Project Type**: Web service (multi-agent AI backend)
**Performance Goals**: Purchase pipeline completes within 30 seconds; Strategic pipeline completes within 90 seconds
**Constraints**: No new agents; prompt-level changes only; backward compatible with existing sessions
**Scale/Scope**: Single-user to ~50 concurrent sessions per user

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Code Verbosity & Clarity | ✅ PASS | All changes use descriptive naming (`decision_type`, `decision_domain`). Agent instructions include inline documentation explaining the behavioral modes. |
| II. User Experience Consistency | ✅ PASS | Purchase mode preserves exact current UX. Strategic mode follows a consistent internal pattern (classification → interview → research → evaluate → support). Both modes use the same UI layout — only content depth changes. |
| III. Requirement-Driven Prototyping | ✅ PASS | Every change maps directly to an FR in the spec (FR-001 through FR-016). No speculative features. |
| Technology Stack | ✅ PASS | No new dependencies. Uses existing Python + google-adk + FastAPI stack. |
| Development Workflow | ✅ PASS | Changes are testable via existing pytest infrastructure. |

**Post-Phase-1 Re-check**: All gates still pass. No new dependencies, no structural changes, all changes are prompt-level + data model extensions.

## Project Structure

### Documentation (this feature)

```text
specs/003-003-adaptive-decision-modes/
├── spec.md              # Feature specification
├── plan.md              # This file
├── research.md          # Phase 0 output — design decisions
├── data-model.md        # Phase 1 output — entity changes
├── quickstart.md        # Phase 1 output — change summary
├── contracts/
│   └── api-changes.md   # Phase 1 output — API contract changes
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (created by /speckit-tasks)
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── agents/
│   │   ├── primary.py          # MODIFY — classification + timeout + decision_type routing
│   │   ├── interviewer.py      # MODIFY — conditional purchase/strategic instructions
│   │   ├── researcher.py       # MODIFY — conditional research depth instructions
│   │   ├── evaluator.py        # MODIFY — conditional evaluation matrix instructions
│   │   └── supporter.py        # MODIFY — conditional output format instructions
│   ├── models/
│   │   ├── entities.py         # MODIFY — add decision_type, decision_domain to DecisionSession
│   │   └── schemas.py          # MODIFY — add decision_type to ChatResponse, HistoryResponse
│   └── services/
│       └── decision_service.py # MODIFY — pass decision_type through pipeline, handle timeouts
└── tests/
    └── test_adaptive_modes.py  # NEW — test classification, pipeline routing, timeout behavior
```

**Structure Decision**: Web application (Option 2) — existing `backend/` + `frontend/` structure. All changes are in `backend/`. No frontend changes required for MVP.

## Implementation Details

### Step 1: Data Model Extension (entities.py, schemas.py)

Add `decision_type` and `decision_domain` fields to `DecisionSession`:

```python
class DecisionSession(BaseModel):
    # ... existing fields ...
    decision_type: str = "purchase"       # "purchase" | "strategic"
    decision_domain: str = "general"      # "finance" | "infrastructure" | "general" | etc.
```

Add `decision_type` to `ChatResponse` and `HistoryResponse`:

```python
class ChatResponse(BaseModel):
    # ... existing fields ...
    decision_type: str = Field(default="purchase", description="Decision mode: purchase or strategic")
```

### Step 2: Classification in Primary Orchestrator (primary.py)

Add a `_classify_decision` method to `DecisionPipeline`:

```python
CLASSIFICATION_PROMPT = """
Analyze the user's question and classify it as one of two decision types:
- "purchase": The user wants to buy a product or service (e.g., which laptop, best headphones, etc.)
- "strategic": The user is making an important non-purchase decision or complex organizational decision
  (e.g., should we migrate to AWS, which vendor for CRM, expand to EU market)

Also determine the decision domain:
- "finance": Involves financial/business ROI, investment, or budget allocation decisions
- "infrastructure": Involves technology, cloud, systems, or platform decisions
- "general": Any other strategic decision type

Respond ONLY with JSON: {"decision_type": "purchase"|"strategic", "decision_domain": "finance"|"infrastructure"|"general"}

User's question: {question}
"""
```

This is called once in `_run_interviewing` when the session has no `decision_type` yet (i.e., first message).

### Step 3: Conditional Agent Instructions

Each agent gets an enhanced instruction template that branches on `decision_type`:

- **Interviewer**: Purchase → current 3-criteria flow. Strategic → generate criteria list (3-7), surface them, then ask one at a time.
- **Researcher**: Purchase → "find top 3-5 products". Strategic → "perform thorough multi-dimensional research covering cost, capability, risk, ecosystem".
- **Evaluator**: Purchase → current Budget/Use-Case/Preferences matrix. Strategic → domain-specific matrix passed via prompt.
- **Supporter**: Purchase → current warm 3-4 paragraph style. Strategic → structured report with Executive Summary, Comparison, Risk Analysis, Recommendation.

### Step 4: Pipeline Context Passing (primary.py, decision_service.py)

Update all prompt construction to include `decision_type` and `decision_domain` context. The `session_data` dict already flows through the pipeline — the new fields are simply added to it.

### Step 5: Timeout Handling (primary.py)

Wrap `_run_full_pipeline` with `asyncio.wait_for`:

```python
import asyncio

timeout = 30 if session_data.get("decision_type") == "purchase" else 90
try:
    result = await asyncio.wait_for(
        self._run_full_pipeline(session_id, session_data),
        timeout=timeout,
    )
except asyncio.TimeoutError:
    return ("System", "I'm taking too long. Please try again or simplify your question.", "Error", session_data)
```

### Step 6: Decision Service Updates (decision_service.py)

Pass `decision_type` through SSE events and final response. Ensure `decision_type` is persisted to Firestore and returned in API responses.

## Complexity Tracking

No constitution violations. No complexity justifications needed.
