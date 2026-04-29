# API Contract Changes: Adaptive Decision Modes

**Feature**: 003-003-adaptive-decision-modes  
**Date**: 2026-04-28

## Changed Contracts

No new endpoints are added. Existing endpoints are unchanged in URL/method. The **response payloads** are extended with new optional fields.

### POST /api/chat & POST /api/chat/stream

**Request**: No change.

**Response** (ChatResponse): Extended with `decision_type`.

```json
{
  "session_id": "uuid",
  "agent": "InterviewerAgent",
  "response": "...",
  "status": "Interviewing",
  "decision_type": "purchase",
  "matrix": { "options": [], "criteria": [] }
}
```

| Field | Type | Added? | Description |
|-------|------|--------|-------------|
| `decision_type` | `string` | **NEW** | `"purchase"` or `"strategic"`. Set after classification on first message. Defaults to `"purchase"` for backward compatibility. |

### GET /api/history/{session_id}

**Response** (HistoryResponse): Extended with `decision_type`.

```json
{
  "session_id": "uuid",
  "decision_type": "strategic",
  "messages": [...],
  "matrix": { "options": [], "criteria": [] }
}
```

### SSE Events (POST /api/chat/stream)

**`progress` event**: No change to structure. The `message` field content may now be decision-type-aware (e.g., "Performing deep research across multiple dimensions..." for strategic mode).

**`done` event**: Extended with `decision_type` field, same as ChatResponse.

## Backward Compatibility

- All new fields have defaults (`"purchase"` for `decision_type`)
- Existing frontend clients that don't read `decision_type` will continue to work unchanged
- Existing sessions loaded from Firestore without `decision_type` will default to `"purchase"`
