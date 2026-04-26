---
description: "Task list for Multi-User Isolation"
---

# Tasks: Multi-User Isolation

**Input**: Design documents from `/specs/001-multi-user-isolation/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api-v2.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Add `firebase-admin` dependency to `backend/pyproject.toml`
- [ ] T002 Add `firebase` dependency to `frontend/package.json`
- [ ] T003 [P] Create `backend/app/core/auth.py` placeholder
- [ ] T004 [P] Create `frontend/src/context/AuthContext.jsx` placeholder
- [ ] T005 [P] Create `frontend/src/components/Login.jsx` placeholder

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core authentication infrastructure that MUST be complete before user stories can be fully implemented.

- [ ] T006 Implement Firebase Admin initialization and token verification logic in `backend/app/core/auth.py`
- [ ] T007 Implement Firebase JS SDK initialization and AuthProvider context in `frontend/src/context/AuthContext.jsx`
- [ ] T008 Update `backend/app/models/entities.py` to add `user_id` to `DecisionSession` defaulting to `"anonymous"`
- [ ] T009 Update `backend/app/core/firestore.py` to support `user_id` filtering in `get_session` and `list_sessions`

**Checkpoint**: Firebase auth is configured on both sides and database queries support the new schema.

---

## Phase 3: User Story 1 - Secure User Authentication and Session Management (Priority: P1) 🎯 MVP

**Goal**: Users must be able to securely log into the application so that their session is uniquely identified and tied to their personal data.

**Independent Test**: Can be fully tested by verifying that two different users can log in on separate devices/browsers and receive distinct, isolated sessions in the frontend state.

### Implementation for User Story 1

- [ ] T010 [US1] Implement `frontend/src/components/Login.jsx` UI supporting Email/Password, Google OAuth, and Guest logins using Firebase Auth.
- [ ] T011 [US1] Update `frontend/src/App.jsx` (or routing layer) to conditionally render the Login screen if unauthenticated, or the main dashboard if authenticated.
- [ ] T012 [US1] Update Axios interceptors in `frontend/src/services/` to automatically attach the `Authorization: Bearer <token>` header if a user is logged in.

**Checkpoint**: Users can log in/out on the frontend and the backend receives the token.

---

## Phase 4: User Story 2 - Isolated Decision Creation and Retrieval (Priority: P2)

**Goal**: Users must be able to create new decisions and view only the decisions they have created, without seeing decisions created by others. Legacy data belongs to the shared Guest pool.

**Independent Test**: Can be fully tested by having User A create a decision, logging in as User B, and verifying that User B cannot see User A's decision.

### Implementation for User Story 2

- [ ] T013 [US2] Update `/api/chat` and `/api/chat/stream` in `backend/app/api/routes.py` to inject the authenticated `user_id` (or `"anonymous"`) when creating or updating a session.
- [ ] T014 [US2] Update `process_message` and `process_message_stream` in `backend/app/services/decision_service.py` to pass the `user_id` down to `save_session`.
- [ ] T015 [US2] Update `/api/history/{session_id}`, `/api/export/{session_id}`, and `/api/export/{session_id}/download` in `backend/app/api/routes.py` to verify ownership before returning data (return 403 if `user_id` mismatch).
- [ ] T016 [US2] Update `/api/sessions/recent` in `backend/app/api/routes.py` to pass the current `user_id` to `list_recent_sessions`.
- [ ] T017 [US2] Update `list_recent_sessions` in `backend/app/services/decision_service.py` to accept and pass the `user_id` to Firestore.

**Checkpoint**: At this point, the backend enforces strict isolation based on the token provided by the frontend.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T018 Verify no regressions in existing unit/integration tests (`pytest` and frontend tests).
- [ ] T019 Update frontend UI to show the current logged-in user's email or "Guest" status in the header.
- [ ] T020 Add a "Logout" button to the frontend header.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion
- **User Stories (Phase 3+)**: 
  - US1 depends on Foundational (specifically the frontend AuthContext).
  - US2 depends on Foundational (specifically the backend auth logic and Firestore updates).
- **Polish (Final Phase)**: Depends on all user stories being complete

### Parallel Opportunities

- T003, T004, and T005 can be created simultaneously.
- Foundational Phase (T006, T007, T008, T009) can be worked on in parallel by frontend and backend developers.
- Phase 3 (US1 - Frontend) and Phase 4 (US2 - Backend) can be implemented completely in parallel since they rely on the contract established in the Foundational phase.

## Implementation Strategy

### Incremental Delivery
1. **Foundation**: Get Firebase packages installed and contexts/auth dependencies built.
2. **Frontend Auth (US1)**: Build the Login UI and route protection. Verify Firebase login works in isolation.
3. **Backend Isolation (US2)**: Enforce the ownership checks on the API routes using the verified token.
4. **Integration**: Combine them. Log in via frontend, create a decision, verify it saves with the correct `user_id` in Firestore, and ensure other users cannot read it.