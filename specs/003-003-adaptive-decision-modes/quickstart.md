# Quickstart: Adaptive Decision Modes

**Feature**: 003-003-adaptive-decision-modes  
**Date**: 2026-04-28

## What Changes

This feature adds decision-type-aware behavior to the entire Decidely.ai agent pipeline. The system now distinguishes between **purchase decisions** (buy something) and **strategic decisions** (important business/organizational decisions), adapting each agent's behavior accordingly.

## Files Modified

### Backend — Agent Instructions
| File | Change |
|------|--------|
| `backend/app/agents/primary.py` | Add classification step before interviewing; pass `decision_type` + `decision_domain` through the pipeline; add timeout wrapping (30s purchase / 90s strategic) |
| `backend/app/agents/interviewer.py` | Conditional instruction: purchase → 3 fixed criteria; strategic → dynamic 3-7 criteria with upfront criteria listing |
| `backend/app/agents/researcher.py` | Conditional instruction: purchase → product search; strategic → multi-dimensional research |
| `backend/app/agents/evaluator.py` | Conditional instruction: purchase → standard matrix; strategic → domain-specific matrix (finance/infrastructure/general) |
| `backend/app/agents/supporter.py` | Conditional instruction: purchase → concise summary; strategic → detailed stakeholder report |

### Backend — Models & Services
| File | Change |
|------|--------|
| `backend/app/models/entities.py` | Add `decision_type` and `decision_domain` fields to `DecisionSession` |
| `backend/app/models/schemas.py` | Add `decision_type` field to `ChatResponse` and `HistoryResponse` |
| `backend/app/services/decision_service.py` | Pass `decision_type` context through pipeline calls; handle timeout errors |

### No Frontend Changes Required
The frontend does not need to change for the MVP. The new `decision_type` field in API responses is backward-compatible. The Supporter agent's output (the user-facing text) is already rendered as-is by the frontend — the strategic mode's detailed report will display naturally.

## How to Test

```bash
# Start the backend
cd backend && uv run uvicorn app.api.main:app --reload

# Purchase mode test (should behave exactly as before):
# Ask: "Which laptop should I buy for gaming under $1500?"

# Strategic mode test:
# Ask: "Should our company migrate from GCP to AWS for our cloud infrastructure?"
# Expect: dynamic criteria, detailed research, domain-specific matrix, stakeholder report
```

## Key Design Decisions

1. **Classification in primary.py** — not a separate agent. Single LLM call before interviewing.
2. **Prompt-level behavioral changes** — agent code stays the same; only instructions change based on decision type.
3. **Immutable decision type** — once classified, it never changes during a session (per spec Q3).
4. **Hard cap of 7 criteria** — strategic interviews max out at 7 questions (per spec Q4).
5. **Differentiated timeouts** — 30s purchase / 90s strategic pipeline deadlines (per spec Q5).
