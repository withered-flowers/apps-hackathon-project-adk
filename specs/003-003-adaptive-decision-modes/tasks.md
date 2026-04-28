# Tasks: Adaptive Decision Modes

**Input**: Design documents from `specs/003-003-adaptive-decision-modes/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: No test tasks are generated (not explicitly requested in specification). Manual testing guidance is provided in quickstart.md.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/app/`, `frontend/src/`
- All changes are in the `backend/` directory. No frontend changes required.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Extend data models and schemas with decision_type support. No new project init needed — this is an existing codebase.

- [ ] T001 [P] Add `decision_type` and `decision_domain` fields to `DecisionSession` entity in backend/app/models/entities.py
- [ ] T002 [P] Add `decision_type` field to `ChatResponse` and `HistoryResponse` schemas in backend/app/models/schemas.py

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Classification logic and pipeline context passing — MUST be complete before any agent behavioral changes

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T003 Add `_classify_decision` method to `DecisionPipeline` in backend/app/agents/primary.py — accepts user's first message, returns `{"decision_type": "purchase"|"strategic", "decision_domain": "finance"|"infrastructure"|"general"}` via a single LLM call using pure free-form reasoning
- [ ] T004 Update `_run_interviewing` in backend/app/agents/primary.py to call `_classify_decision` on first message (when session has no `decision_type` yet), store result in `session_data["decision_type"]` and `session_data["decision_domain"]`
- [ ] T005 Update `process_message` in backend/app/services/decision_service.py to persist `decision_type` and `decision_domain` from pipeline results to Firestore session document and include `decision_type` in the `ChatResponse` return value
- [ ] T006 Update `process_message_stream` in backend/app/services/decision_service.py to persist `decision_type` and `decision_domain` from pipeline results and include `decision_type` in SSE `done` event payload
- [ ] T007 Update `get_history` in backend/app/services/decision_service.py to include `decision_type` in `HistoryResponse`

**Checkpoint**: Foundation ready — classification works, decision_type flows through pipeline and persists. All agents still use current (purchase-mode) behavior.

---

## Phase 3: User Story 1 — Purchase Decision Flow (Priority: P1) 🎯 MVP

**Goal**: Ensure the existing purchase decision pipeline works identically after classification is added. Zero regression.

**Independent Test**: Ask "Which laptop should I buy for gaming under $1500?" — system should classify as "purchase", use 3 fixed criteria (Budget, Use-Case, Preferences), standard product search, weighted scoring, and concise supporter output. Behavior must be identical to the pre-feature experience.

### Implementation for User Story 1

- [ ] T008 [US1] Update `INTERVIEWER_INSTRUCTION` in backend/app/agents/interviewer.py to accept `decision_type` context in the prompt and use the existing 3-criteria flow when `decision_type=purchase` (preserving current behavior exactly)
- [ ] T009 [US1] Update research prompt construction in `_run_full_pipeline` of backend/app/agents/primary.py to include `decision_type=purchase` context and keep the existing "find top 3-5 best options" instruction for purchase mode
- [ ] T010 [US1] Update evaluation prompt construction in `_run_full_pipeline` of backend/app/agents/primary.py to include `decision_type=purchase` context and keep the existing Budget/Use-Case/Preferences weighted scoring for purchase mode
- [ ] T011 [US1] Update support prompt construction in `_run_full_pipeline` of backend/app/agents/primary.py to include `decision_type=purchase` context and keep the existing concise 3-4 paragraph warm summary for purchase mode
- [ ] T012 [US1] Add `asyncio.wait_for` timeout wrapping (30 seconds) around the purchase-mode pipeline execution in `_run_full_pipeline` of backend/app/agents/primary.py with graceful error message on timeout

**Checkpoint**: Purchase flow works identically to before, with classification now set to "purchase". This is the MVP — deploy/demo if ready.

---

## Phase 4: User Story 2 — Strategic Business Decision Flow (Priority: P1)

**Goal**: Enable strategic decision mode with dynamic criteria, thorough research, domain-specific evaluation matrices, and detailed stakeholder reports.

**Independent Test**: Ask "Should our company migrate from GCP to AWS for our cloud infrastructure?" — system should classify as "strategic", generate and surface dynamic criteria (up to 7), perform multi-dimensional research, apply an infrastructure-specific evaluation matrix (Technical Fit, Scalability, Vendor Lock-in, Compliance), and deliver a detailed stakeholder-ready report.

### Implementation for User Story 2

- [ ] T013 [US2] Update `INTERVIEWER_INSTRUCTION` in backend/app/agents/interviewer.py to add the strategic-mode instruction branch — when `decision_type=strategic`: analyze the decision domain, dynamically generate 3-7 relevant criteria, surface them briefly upfront ("For this decision I'll explore: X, Y, Z. Let's start…"), then ask questions one at a time targeting each criterion
- [ ] T014 [US2] Update the criteria-complete JSON schema in backend/app/agents/interviewer.py to support dynamic criteria with variable names, weights, and count (3-7) for strategic mode, while preserving the fixed 3-criteria schema for purchase mode
- [ ] T015 [US2] Update `RESEARCHER_INSTRUCTION` in backend/app/agents/researcher.py to add the strategic-mode instruction branch — when `decision_type=strategic`: perform thorough multi-dimensional research covering cost analysis, vendor capabilities, ecosystem, migration complexity, risks, and ecosystem factors; search across multiple angles rather than just product matching
- [ ] T016 [US2] Update research prompt construction in `_run_full_pipeline` of backend/app/agents/primary.py to pass `decision_type=strategic` and `decision_domain` context to the Researcher, instructing multi-dimensional research
- [ ] T017 [US2] Update `EVALUATOR_INSTRUCTION` in backend/app/agents/evaluator.py to add domain-specific evaluation matrices — when `decision_type=strategic` and `decision_domain=finance`: use ROI/NPV, Strategic Fit, Ease of Execution, Risk Mitigation; when `decision_domain=infrastructure`: use Technical Fit, Scalability, Vendor Lock-in, Compliance; when `decision_domain=general`: let the LLM adapt an appropriate domain-specific matrix
- [ ] T018 [US2] Update evaluation prompt construction in `_run_full_pipeline` of backend/app/agents/primary.py to pass `decision_type`, `decision_domain`, and dynamically-generated criteria to the Evaluator for strategic mode
- [ ] T019 [US2] Update `SUPPORTER_INSTRUCTION` in backend/app/agents/supporter.py to add the strategic-mode instruction branch — when `decision_type=strategic`: generate a structured stakeholder-ready report with sections for Executive Summary, Full Option Comparison table, Risk Analysis, and Recommendation with detailed justification
- [ ] T020 [US2] Update support prompt construction in `_run_full_pipeline` of backend/app/agents/primary.py to pass `decision_type=strategic` context to the Supporter
- [ ] T021 [US2] Update `asyncio.wait_for` timeout in `_run_full_pipeline` of backend/app/agents/primary.py to use 90-second timeout for strategic mode (vs 30 seconds for purchase)
- [ ] T022 [US2] Update SSE progress event messages in `_run_full_pipeline` of backend/app/services/decision_service.py to be decision-type-aware (e.g., "Performing deep research across multiple dimensions…" for strategic vs "Searching for the best options…" for purchase)

**Checkpoint**: Both purchase and strategic flows work end-to-end. Strategic decisions produce detailed stakeholder reports.

---

## Phase 5: User Story 3 — Ambiguous Decision Classification (Priority: P2)

**Goal**: Handle borderline questions that could be either purchase or strategic, ensuring the system makes a reasonable classification and delivers a coherent end-to-end experience.

**Independent Test**: Ask "We need to pick a new project management tool for the team" — system should make a classification (likely strategic given organizational context), and deliver a coherent experience matching the chosen type throughout the entire pipeline.

### Implementation for User Story 3

- [ ] T023 [US3] Refine the classification prompt in `_classify_decision` of backend/app/agents/primary.py to include guidance for ambiguous cases — add examples of borderline questions and instruct the LLM to consider organizational language, scale implications, and budget mentions as classification signals; ensure the LLM always returns a valid classification (never "unknown")
- [ ] T024 [US3] Add validation in `_classify_decision` of backend/app/agents/primary.py to ensure the LLM response always produces a valid `decision_type` ("purchase" or "strategic") and `decision_domain` — fall back to `{"decision_type": "purchase", "decision_domain": "general"}` if parsing fails

**Checkpoint**: All three user stories work independently. Ambiguous questions produce coherent end-to-end experiences.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T025 [P] Update inline docstrings and module-level docstrings in all modified agent files (backend/app/agents/interviewer.py, researcher.py, evaluator.py, supporter.py, primary.py) to document the dual-mode behavior
- [ ] T026 [P] Update `_session_to_dict` and session loading in backend/app/services/decision_service.py to handle backward compatibility — existing Firestore sessions without `decision_type` must default to "purchase" without errors
- [ ] T027 Run end-to-end manual validation per quickstart.md — test a purchase flow ("Which laptop should I buy for gaming under $1500?") and a strategic flow ("Should our company migrate from GCP to AWS?") to verify both complete successfully within their time budgets

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup (T001, T002) completion — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Foundational (Phase 2) completion — MVP target
- **User Story 2 (Phase 4)**: Depends on Foundational (Phase 2) completion — can run in parallel with US1 but logically benefits from US1 being done first
- **User Story 3 (Phase 5)**: Depends on Foundational (Phase 2) completion — refines classification logic from Phase 2
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Phase 2 — no dependencies on other stories
- **User Story 2 (P1)**: Can start after Phase 2 — independent of US1 but benefits from shared prompt structure established in US1
- **User Story 3 (P2)**: Can start after Phase 2 — independent of US1/US2, refines classification from T003/T004

### Within Each User Story

- Agent instruction updates ([P]) can run in parallel (different files)
- Prompt construction updates in primary.py must be sequential (same file)
- Pipeline timeout changes depend on prompt construction being ready

### Parallel Opportunities

- T001 and T002 (Phase 1) can run in parallel — different files
- T005, T006, T007 (Phase 2 service updates) can run in parallel with T003, T004 (Phase 2 primary updates) if T001/T002 are done
- T008 (interviewer), T015 (researcher), T017 (evaluator), T019 (supporter) can run in parallel — different files
- T025 and T026 (Phase 6) can run in parallel

---

## Parallel Example: User Story 2

```bash
# Launch all agent instruction updates in parallel (different files):
Task: "T013 — Update interviewer.py with strategic-mode instructions"
Task: "T015 — Update researcher.py with strategic-mode instructions"
Task: "T017 — Update evaluator.py with domain-specific matrices"
Task: "T019 — Update supporter.py with stakeholder report format"

# Then sequential updates to primary.py (same file):
Task: "T016 — Update research prompt in primary.py"
Task: "T018 — Update evaluation prompt in primary.py"
Task: "T020 — Update support prompt in primary.py"
Task: "T021 — Update timeout in primary.py"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T002) — ~15 min
2. Complete Phase 2: Foundational (T003-T007) — ~30 min
3. Complete Phase 3: User Story 1 (T008-T012) — ~30 min
4. **STOP and VALIDATE**: Test purchase flow end-to-end
5. Deploy/demo if ready — system works exactly as before, now with classification

### Incremental Delivery

1. Complete Setup + Foundational → Classification working
2. Add User Story 1 → Test purchase flow → Deploy/Demo (MVP!)
3. Add User Story 2 → Test strategic flow → Deploy/Demo
4. Add User Story 3 → Test ambiguous cases → Deploy/Demo
5. Polish → Documentation and validation

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Commit after each phase completion
- Stop at any checkpoint to validate story independently
- All changes are prompt-level and data model extensions — no new agents, no structural pipeline changes
- Total: 27 tasks across 6 phases
