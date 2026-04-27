---
description: "Task list for Shared Guest Account feature implementation"
---

# Tasks: Shared Guest Account

**Input**: Design documents from `/specs/002-shared-guest-account/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

*(No setup tasks needed for this feature as it modifies existing infrastructure)*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

*(No foundational blocking tasks; the backend and frontend changes can be implemented per story)*

---

## Phase 3: User Story 1 - Unified Shared Guest Experience (Priority: P1) 🎯 MVP

**Goal**: All users who opt to continue as a Guest must be routed to a single, shared system identity, and be exempt from decision limits.

**Independent Test**: Opening the application in two different incognito browsers, logging in as Guest on both, and verifying that a decision created in browser A is immediately visible in browser B's session history.

### Implementation for User Story 1

- [ ] T001 [P] [US1] Update `verify_id_token` in `backend/app/core/auth.py` to inspect `decoded.get("firebase", {}).get("sign_in_provider")` and return `"anonymous"` if it is `"anonymous"`.
- [ ] T002 [P] [US1] Update `check_user_decision_limit` in `backend/app/services/decision_service.py` to explicitly bypass the 50-decision limit for the `"anonymous"` user ID.
- [ ] T003 [P] [US1] Verify and update `frontend/src/context/AuthContext.jsx` to ensure guest state operates cleanly with the backend changes if necessary.

**Checkpoint**: At this point, Guest users should share a single identity and have unlimited decisions.

---

## Phase 4: User Story 2 - Strict Isolation for Permanent Users (Priority: P2)

**Goal**: Permanent, registered users must remain strictly isolated from both the shared Guest pool and other permanent users.

**Independent Test**: Verifying that a registered user cannot see Guest decisions, and Guest users cannot see the registered user's decisions.

### Implementation for User Story 2

- [ ] T004 [US2] Add unit test in `backend/tests/test_multi_user_isolation.py` verifying that permanent users are not mapped to `"anonymous"`, and their decision limits are still strictly enforced.
- [ ] T005 [US2] Add unit test in `backend/tests/test_multi_user_isolation.py` verifying that anonymous users correctly map to `"anonymous"` and bypass the decision limit.

**Checkpoint**: Isolation logic is fully tested and verified against regressions.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T006 [P] Run `quickstart.md` manual validation to verify both the Shared Pool visibility and Decision Limit Exemption.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup & Foundational**: N/A
- **User Story 1 (P1)**: Can start immediately.
- **User Story 2 (P2)**: Tests can be written in parallel, but will pass only after US1 implementation is complete.

### Parallel Opportunities

- Backend modifications (T001, T002) can be done in parallel.
- Frontend modifications (T003) can be done in parallel with backend tasks.
- Testing (T004, T005) can be developed concurrently.

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 3: User Story 1 (T001-T003).
2. **STOP and VALIDATE**: Test User Story 1 independently via the Quickstart guide.
3. Complete Phase 4: User Story 2 (Automated Testing T004-T005).
4. Complete Phase 5: Polish & Validation (T006).
