# Phase 0: Outline & Research

## Technical Approach: Backend Override for Anonymous Tokens

**Decision**: Intercept Firebase Anonymous Tokens on the Backend to force a shared ID.
**Rationale**: Firebase Auth SDK naturally generates unique UIDs for anonymous users. To make them share a single identity, the most secure and robust approach is to allow Firebase to generate the unique anonymous token on the client, but have the FastAPI backend (`backend/app/core/auth.py`) inspect the decoded token. If `decoded.get("firebase", {}).get("sign_in_provider") == "anonymous"`, the backend will override the returned `user_id` to the static string `"anonymous"`. This ensures all guests read/write to the same data pool.
**Alternatives considered**: 
- **Modifying the frontend to stop sending a token entirely when the user is a guest.** Rejected because sending the token ensures the backend can still cryptographically verify the request legitimately originated from our Firebase app, preventing basic unauthenticated API spam.
- **Creating a single hardcoded email/password "guest@example.com" and having the frontend secretly log into it.** Rejected because it exposes credentials to the client and bypasses the built-in anonymous auth flow provided cleanly by Firebase.

## Technical Approach: Limit Exemption

**Decision**: Hardcode an exemption for the `"anonymous"` ID in `decision_service.py`.
**Rationale**: The previous feature introduced a strict limit of 50 decisions per user to prevent abuse. If all guests share one ID, they will hit this limit almost immediately. The `check_user_decision_limit` function must explicitly `return` early if `user_id == "anonymous"`.
