# Contract Changes: Multi-User Isolation

**Date**: 2026-04-26
**Feature**: 001-multi-user-isolation

The existing `/api/chat`, `/api/history/{session_id}`, `/api/session/new`, `/api/sessions/recent`, `/api/export/{session_id}` and `/api/export/{session_id}/download` APIs will have an updated contract for Authorization.

## Request Header Additions (Optional)

The frontend MAY pass an `Authorization` header containing the Firebase ID Token for all existing endpoints. The token will be verified by the backend.

```json
{
  "Authorization": "Bearer <firebase_id_token>"
}
```

If the header is omitted, or if the token is invalid/expired, the backend will treat the request as belonging to the `"anonymous"` guest user pool. This ensures zero breaking changes for existing unauthenticated clients while satisfying the multi-user requirement.

## Ownership Checking
All endpoints that retrieve or mutate a specific `session_id` will verify that `session.user_id == current_user_uid`.
If a user is logged in as a permanent user (e.g., `user_id = "uid123"`) but tries to access a session belonging to `"uid456"` or `"anonymous"`, the backend returns:

```json
// HTTP 403 Forbidden
{
  "detail": "You do not have permission to access this session."
}
```

## `list_sessions_by_user`
The `/api/sessions/recent` endpoint will filter by `user_id` equal to the currently authenticated user's `uid` (or `"anonymous"` if no token).

## Frontend Authentication Context
The React application will expose a global context providing the current `user` and `token`. Components will consume this context to conditionally render "Login/Signup", "Login as Guest", or the "Dashboard", and attach the `Authorization` header to Axios requests if `token` is non-null.