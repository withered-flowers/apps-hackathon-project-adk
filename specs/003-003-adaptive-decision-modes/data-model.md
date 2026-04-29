# Data Model: Adaptive Decision Modes

**Feature**: 003-003-adaptive-decision-modes  
**Date**: 2026-04-28

## Entity Changes

### DecisionSession (MODIFY)

Existing entity at `backend/app/models/entities.py`. Two new fields added:

| Field | Type | Default | Constraints | Description |
|-------|------|---------|-------------|-------------|
| `decision_type` | `str` | `"purchase"` | One of: `"purchase"`, `"strategic"` | Classified decision mode. Set once at classification, immutable thereafter. |
| `decision_domain` | `str` | `"general"` | Free-form string, e.g., `"finance"`, `"infrastructure"`, `"general"` | Sub-domain for strategic decisions. Determines which evaluation matrix is used. Ignored for purchase decisions. |

**State transitions**: No change to existing status flow (`Interviewing → Researching → Evaluating → Complete`). The new `decision_type` field is set during the `Interviewing` phase (before the first Interviewer call) and never transitions.

### Existing Entities (NO CHANGE)

- **Message**: No changes needed.
- **DecisionCriteria**: No changes needed. Dynamic criteria for strategic mode use the same structure — they just have different names/weights.
- **Option**: No changes needed.

## Firestore Document Changes

The Firestore session document gains two new top-level fields:

```json
{
  "session_id": "...",
  "user_id": "...",
  "status": "Interviewing",
  "decision_type": "purchase",
  "decision_domain": "general",
  "topic": "...",
  "criteria": [],
  "options": [],
  "matrix": {},
  "recommendation": "",
  "transcript": [],
  "last_message_at": "..."
}
```

**Migration**: No migration needed. Existing sessions without `decision_type` will default to `"purchase"` when loaded (backward compatible via Pydantic default).

## Pipeline Data Flow

```
User Message
    │
    ▼
┌─────────────────┐
│  Classification  │  Sets: decision_type, decision_domain
│  (in primary.py) │  Stored in: session_data dict
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  InterviewerAgent│  Receives: decision_type in prompt context
│                  │  Purchase: 3 fixed criteria
│                  │  Strategic: dynamic 3-7 criteria
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  ResearcherAgent │  Receives: decision_type + criteria in prompt
│                  │  Purchase: product-focused search
│                  │  Strategic: multi-dimensional research
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  EvaluatorAgent  │  Receives: decision_type + decision_domain + criteria + options
│                  │  Purchase: Budget/Use-Case/Preferences matrix
│                  │  Strategic/Finance: ROI/NPV/Strategic Fit/Ease/Risk
│                  │  Strategic/Infra: Tech Fit/Scalability/Lock-in/Compliance
│                  │  Strategic/General: LLM-adapted domain matrix
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  SupporterAgent  │  Receives: decision_type + full context
│                  │  Purchase: concise 3-4 paragraph warm summary
│                  │  Strategic: structured stakeholder report
└─────────────────┘
```
