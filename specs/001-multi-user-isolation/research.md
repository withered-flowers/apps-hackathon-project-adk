# Technical Research: Multi-User Isolation

**Date**: 2026-04-26
**Feature**: 001-multi-user-isolation

## Decision 1: Authentication Implementation (Firebase)
* **Decision**: Use Firebase Authentication for both frontend and backend. The frontend will use the Firebase JS SDK to handle Email/Password, OAuth, and Anonymous (Guest) sign-ins. The backend will use `firebase-admin` to verify the ID tokens sent in the `Authorization: Bearer <token>` header.
* **Rationale**: Firebase is specifically listed as a requirement in the specification assumptions. It naturally supports all three required auth methods (Email, OAuth, Anonymous) out of the box, and `firebase-admin` integrates cleanly with the existing Google Cloud environment (Firestore is already in use).
* **Alternatives considered**: None, as Firebase Authentication was explicitly required.

## Decision 2: Backend API Compatibility and Authorization
* **Decision**: Do not create breaking changes on the existing backend API. The existing endpoints (`/api/chat`, `/api/history/{session_id}`, etc.) will become *optionally* authenticated. If no `Authorization` header is provided, the backend will treat the request as belonging to `user_id = "anonymous"`. If a token is provided, it will be decoded to the user's permanent `uid`. The system will then enforce ownership: if the requested session's `user_id` does not match the requester's `user_id`, a 403 Forbidden error will be returned.
* **Rationale**: The user explicitly requested "do not create a breaking changes on the backend (if there's an api changes, do not modify the api, but create a new version for the api)". However, adding an *optional* `Authorization` header with a fallback to `"anonymous"` allows the existing APIs to satisfy the new isolation requirements (FR-003, FR-004) without actually breaking the contract for existing clients (who will just be treated as Guest users and access the shared pool). Alternatively, if a new API version is strictly preferred even for non-breaking additions, we will duplicate the existing routes under a `/api/v2/` prefix that *requires* authentication, leaving `/api/` entirely unchanged but enforcing `"anonymous"` ownership. We will go with the optional token approach on existing routes as it avoids code duplication while fulfilling the strict non-breaking requirement, but we will also expose `/api/v2/` for purely authenticated access if the frontend prefers it.
* **Alternatives considered**: Creating a strict `/api/v2/` and deprecating `/api/` (adds maintenance overhead), or forcing tokens on `/api/` (which breaks existing clients).

## Decision 3: Legacy Data Migration
* **Decision**: Treat any existing `DecisionSession` in Firestore without a `user_id` (or with `user_id == "anonymous"`) as belonging to the Guest pool. The `list_sessions` and `get_session` methods in `app.core.firestore` will be updated to accept a `user_id` parameter and filter queries accordingly.
* **Rationale**: This fulfills FR-006 (legacy data belongs to the shared Guest profile). The `DecisionSession` model already defaults `user_id` to `"anonymous"`, which aligns perfectly with this strategy.
* **Alternatives considered**: Running a script to backfill `user_id = "anonymous"` on all existing records. This is unnecessary since we can handle it at query time or let it default.

## Decision 4: Frontend State Management for Auth
* **Decision**: Introduce a top-level Auth Provider (e.g., using React Context) that initializes the Firebase app, listens to `onAuthStateChanged`, and provides the current `user` object and a `getToken` function to the rest of the app. Axios interceptors will be used to automatically attach the `Authorization` header to all backend requests if a user is logged in.
* **Rationale**: Centralizing auth state makes it easy to handle UI changes (login/logout buttons, protecting routes) and ensures API requests are always authenticated correctly.
* **Alternatives considered**: Passing tokens manually to every API call (error-prone and verbose).