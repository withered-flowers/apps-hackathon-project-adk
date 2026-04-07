# API Contracts: Decidely.ai Core

## 1. Chat Endpoint

**Endpoint**: `POST /api/chat`

**Request Body**:
```json
{
  "session_id": "string",
  "message": "string"
}
```

**Response Body**:
```json
{
  "session_id": "string",
  "agent": "string",
  "response": "string",
  "status": "Interviewing | Researching | Evaluating | Complete",
  "matrix": {"options": [], "criteria": []}
}
```

## 2. History Endpoint

**Endpoint**: `GET /api/history/{session_id}`

**Response Body**:
```json
{
  "session_id": "string",
  "messages": [
    {"role": "user", "content": "..."},
    {"role": "assistant", "agent": "...", "content": "..."}
  ],
  "matrix": {"options": [], "criteria": []}
}
```
