# Tasks: Decidely.ai Core

**Input**: Design documents from `/specs/001-decidely-ai-core/`
**Prerequisites**: plan.md ✅, spec.md ✅, research.md ✅, data-model.md ✅, contracts/ ✅, quickstart.md ✅

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.
**MVP Scope**: User Story 1 (Structured Decision Support) is the core deliverable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, directory structure, and environment configuration for both backend and frontend.

- [X] T001 Create backend/ project structure per plan.md (app/agents/, app/mcp/, app/core/, app/api/, app/models/) in backend/
- [X] T002 Initialize Python 3.13 backend project with uv and pyproject.toml including google-adk, fastapi, uvicorn, google-cloud-firestore in backend/
- [X] T003 [P] Create frontend/ project structure using Bun + Vite + React with Tailwind CSS in frontend/
- [X] T004 [P] Create root .gitignore with Python, Node, and environment patterns
- [X] T005 [P] Create backend/Dockerfile for Cloud Run deployment
- [X] T006 [P] Create backend/.env.example with GOOGLE_CLOUD_PROJECT, GOOGLE_ADK_MODEL variables

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T007 Implement Pydantic models for ChatRequest, ChatResponse, HistoryResponse, Message, MatrixData in backend/app/models/schemas.py
- [X] T008 Implement Pydantic models for DecisionSession, DecisionCriteria, Option in backend/app/models/entities.py
- [X] T009 [P] Implement Firestore client singleton and session CRUD operations in backend/app/core/firestore.py
- [X] T010 [P] Implement config loader for environment variables (GOOGLE_CLOUD_PROJECT, model name) in backend/app/core/config.py
- [X] T011 Implement FastAPI app factory with CORS middleware and /health endpoint in backend/app/api/main.py
- [X] T012 Implement POST /api/chat and GET /api/history/{session_id} route handlers (stubs) in backend/app/api/routes.py
- [X] T013 [P] Set up frontend Tailwind CSS config, global styles, and design tokens in frontend/src/index.css and frontend/tailwind.config.js

**Checkpoint**: Foundation ready — agent implementation and user story work can begin.

---

## Phase 3: User Story 1 — Structured Decision Support (Priority: P1) 🎯 MVP

**Goal**: Implement the full multi-agent decision pipeline: Primary orchestrator routes through Interviewer → Researcher → Evaluator → Supporter and returns a structured recommendation with a comparison matrix.

**Independent Test**: Send POST /api/chat with `{"session_id": "test-001", "message": "I need to buy a laptop for $1000"}` and verify the response includes `status: "Interviewing"` and clarifying questions from the Interviewer agent.

### Implementation for User Story 1

- [X] T014 [P] [US1] Implement InterviewerAgent (ADK LlmAgent) that extracts Budget, Use-Case, and Preferences criteria and returns them as structured JSON in backend/app/agents/interviewer.py
- [X] T015 [P] [US1] Implement ResearcherAgent (ADK LlmAgent) with Google Search Grounding tool enabled to find product options in backend/app/agents/researcher.py
- [X] T016 [P] [US1] Implement SQLite MCP client wrapper for creating/querying `criteria` and `options` tables in backend/app/mcp/sqlite_client.py
- [X] T017 [US1] Implement EvaluatorAgent (ADK LlmAgent) that reads criteria/options from SQLite MCP and produces a weighted score matrix in backend/app/agents/evaluator.py (depends on T016)
- [X] T018 [US1] Implement SupporterAgent (ADK LlmAgent) that generates an encouraging final summary and recommendation text in backend/app/agents/supporter.py
- [X] T019 [US1] Implement PrimaryAgent (ADK LlmAgent Supervisor) that orchestrates Interviewer → Researcher → Evaluator → Supporter pipeline with multi-turn context in backend/app/agents/primary.py (depends on T014, T015, T017, T018)
- [X] T020 [US1] Implement DecisionService that manages session lifecycle, runs the PrimaryAgent pipeline, persists session to Firestore, and returns ChatResponse in backend/app/services/decision_service.py (depends on T009, T019)
- [X] T021 [US1] Wire POST /api/chat route to DecisionService and implement GET /api/history/{session_id} with Firestore lookup in backend/app/api/routes.py (depends on T020)
- [X] T022 [US1] Build React ChatInterface component (message bubbles, input form, send button) in frontend/src/components/ChatInterface.jsx
- [X] T023 [P] [US1] Build React DecisionMatrix component that renders options vs criteria comparison table from matrix JSON in frontend/src/components/DecisionMatrix.jsx
- [X] T024 [P] [US1] Build React AgentStatusBadge component showing current agent name and session status in frontend/src/components/AgentStatusBadge.jsx
- [X] T025 [US1] Implement API service layer with axios for POST /api/chat and GET /api/history calls in frontend/src/services/api.js (depends on T022)
- [X] T026 [US1] Assemble App.jsx with ChatInterface, DecisionMatrix, and AgentStatusBadge, wiring state and session_id management in frontend/src/App.jsx (depends on T022, T023, T024, T025)

**Checkpoint**: User Story 1 fully functional — a user can have a complete decision conversation ending in a recommendation with a rendered matrix.

---

## Phase 4: User Story 2 — Knowledge Export (Priority: P2)

**Goal**: Allow users to export their completed decision report to Google Drive via an export button in the UI.

**Independent Test**: After reaching a `Complete` status in a session, click "Save to Drive" and verify a Google Doc is created in the user's Google Drive.

### Implementation for User Story 2

- [X] T027 [P] [US2] Implement Google Drive MCP client wrapper with create-document operation in backend/app/mcp/drive_client.py
- [X] T028 [US2] Implement ReportService that formats session transcript + matrix into a structured Markdown/text document and calls Drive MCP to export it in backend/app/services/report_service.py (depends on T009, T027)
- [X] T029 [US2] Add POST /api/export/{session_id} route that calls ReportService and returns the Drive document URL in backend/app/api/routes.py (depends on T028)
- [X] T030 [US2] Build React ExportButton component that calls POST /api/export and shows a link to the created Drive document in frontend/src/components/ExportButton.jsx
- [X] T031 [US2] Integrate ExportButton into App.jsx, visible only when session status is "Complete" in frontend/src/App.jsx (depends on T030)

**Checkpoint**: Users can save completed decision reports to Google Drive.

---

## Phase 5: Polish & Cross-Cutting Concerns

**Purpose**: Validation, error handling, documentation, and deployment readiness.

- [X] T032 [P] Add structured error handling and user-friendly error messages for search failures, MCP errors, and Firestore timeouts in backend/app/core/errors.py and backend/app/api/routes.py
- [X] T033 [P] Add logging with structured output (agent name, session_id, step) in backend/app/core/logging.py
- [X] T034 [P] Create frontend/src/components/LoadingSpinner.jsx and frontend/src/components/ErrorBanner.jsx for loading/error UI states
- [X] T035 Update README.md with architecture overview, setup instructions, and live demo link
- [ ] T036 Run quickstart.md validation: start backend with `uv run uvicorn app.api.main:app --reload`, start frontend with `bun run dev`, and verify end-to-end flow at <http://localhost:5173>

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Setup (Phase 1) completion — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) completion
- **User Story 2 (Phase 4)**: Depends on US1 routes existing (T021) for session data
- **Polish (Phase 5)**: Depends on both user stories being complete

### Within Phase 3 (US1)

- T014, T015, T016 can run in parallel (independent agents/clients)
- T017 depends on T016 (needs SQLite MCP client)
- T018 can run in parallel with T017
- T019 depends on T014, T015, T017, T018 (supervisor needs all sub-agents)
- T020 depends on T009, T019
- T021 depends on T020
- T022, T023, T024 can run in parallel (independent React components)
- T025 depends on T022
- T026 depends on T022, T023, T024, T025

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup ✅
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories) ✅
3. Complete Phase 3: User Story 1 ✅
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Demo at <http://localhost:5173>

### Current Status: All phases complete except T036 (live validation)

---

## Notes

- [P] tasks = different files, no cross-dependencies within the phase
- [Story] label maps task to specific user story for traceability
- Use `uv run` for all Python commands to respect the virtual environment
- Use `bun` for all frontend commands
- SQLite MCP runs as a subprocess; ensure `mcp` package is installed
- For hackathon: default `user_id` to `"anonymous"` (FR-008 is deferred)
