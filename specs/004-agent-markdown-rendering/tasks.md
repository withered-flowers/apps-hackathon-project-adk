# Tasks: Agent Markdown Rendering & Strategic Decision Output

**Feature**: 004-agent-markdown-rendering | **Date**: 2026-04-28 | **Branch**: `004-agent-markdown-rendering`
**Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

---

## Phase 1: Setup

- [x] T001 Install react-markdown dependency in frontend
  - File: `frontend/package.json` (or run `cd frontend && npm install react-markdown`)
  - Dependency: `react-markdown@^9.0.0`

- [x] T002 [P] Install Vitest for frontend testing (required by constitution)
  - File: `frontend/package.json`
  - Dependencies: `vitest@^2.0.0`, `@testing-library/react@^16.0.0`, `jsdom@^25.0.0`

- [x] T003 [P] Configure Vitest in frontend/vite.config.js
  - File: `frontend/vite.config.js`
  - Task: Add test configuration for Vitest

---

## Phase 2: Foundational

- [x] T004 [P] Verify ChatInterface.jsx MessageBubble component structure
  - File: `frontend/src/components/ChatInterface.jsx`
  - Task: Confirm MessageBubble function renders message.content and identify exact location for ReactMarkdown integration

---

## Phase 3: User Story 1 - Markdown Rendering in Agent Output

**Goal**: Users see italic and bold text rendered properly instead of raw asterisks

**Independent Test**: Trigger any agent with formatted output (e.g., `*italic*` or `**bold**`) and verify styling appears correctly

**Acceptance Criteria**:
- Single asterisk `*text*` renders as italic
- Double asterisk `**text*` renders as bold
- Mixed formatting renders correctly
- Plain text without formatting remains unchanged

- [x] T005 [P] [US1] Import ReactMarkdown in ChatInterface.jsx
  - File: `frontend/src/components/ChatInterface.jsx`
  - Add: `import ReactMarkdown from 'react-markdown';`

- [x] T006 [P] [US1] Wrap message.content with ReactMarkdown in MessageBubble
  - File: `frontend/src/components/ChatInterface.jsx`
  - Change: `{message.content}` → `<ReactMarkdown>{message.content}</ReactMarkdown>`

- [x] T007 [US1] Write unit test for ReactMarkdown rendering in MessageBubble
  - File: `frontend/src/components/__tests__/ChatInterface.test.jsx`
  - Task: Test that `*italic*` renders as `<em>`, `**bold**` renders as `<strong>`, and plain text is unchanged

- [x] T008 [US1] Run frontend tests to verify markdown rendering
  - Command: `cd frontend && npm run test -- --run`
  - Task: Execute Vitest tests and verify all pass

---

## Phase 4: User Story 2 & 4 - Strategic Mode Improvements

**Goal**: Strategic reports clearly state the final decision and have proper structure

**Independent Test**: Generate a strategic decision and verify Executive Summary starts with "FINAL DECISION:" and Recommendation explains how choice solves the question

**Acceptance Criteria**:
- Executive Summary contains "FINAL DECISION: [Option Name]" at start
- Recommendation section explicitly addresses the user's original question
- All 4 sections present: Executive Summary, Full Option Comparison, Risk Analysis, Recommendation & Justification

- [x] T009 [P] [US2/US4] Update SUPPORTER_INSTRUCTION for strategic mode final decision
  - File: `backend/app/agents/supporter.py`
  - Task: Add to Executive Summary section: "**FINAL DECISION:** [Option Name]" prefix requirement

- [x] T010 [P] [US2/US4] Update SUPPORTER_INSTRUCTION to explain question alignment in Recommendation
  - File: `backend/app/agents/supporter.py`
  - Task: Add to Recommendation section: Must explain how chosen option addresses the original decision question

- [x] T011 [P] [US4] Verify strategic mode report structure completeness
  - File: `backend/app/agents/supporter.py`
  - Task: Confirm all 4 sections are required in prompt (Executive Summary, Full Option Comparison, Risk Analysis, Recommendation & Justification)

---

## Phase 5: User Story 3 - Purchase Mode Verification

**Goal**: Purchase mode outputs remain warm, celebratory, and complete

**Independent Test**: Generate a purchase decision and verify output is 3-4 paragraphs with closing line

**Acceptance Criteria**:
- Output is 3-4 paragraphs
- Celebrates user for completing process
- Clearly presents top recommendation
- References 2-3 key criteria
- Acknowledges one trade-off
- Ends with "Feel free to ask me anything else about your decision! 🎯"

- [x] T012 [P] [US3] Verify purchase mode instructions in SUPPORTER_INSTRUCTION
  - File: `backend/app/agents/supporter.py`
  - Task: Confirm purchase mode section includes all 5 required elements (celebrate, present, explain, acknowledge trade-off, encourage closing)

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T013 Run frontend build to verify no compilation errors
  - Command: `cd frontend && npm run build`

- [x] T014 Run backend lint to verify Python code quality
  - Command: `cd backend && ruff check app/agents/supporter.py`

- [x] T015 Run frontend tests to verify all tests pass
  - Command: `cd frontend && npm run test -- --run`

---

## Dependency Graph

```
Phase 1 (Setup: T001-T003)
    ↓
Phase 2 (Foundational: T004)
    ↓
Phase 3 (US1 - Frontend) ──────────────────┐
    ↓                                       ↓
Phase 4 (US2/US4 - Backend) ← ─ ─ ─ ─ ─ ─ ┘
    ↓
Phase 5 (US3 - Purchase) ← ─ ─ ─ ─ ─ ─ ─ ─┘
    ↓
Phase 6 (Polish)
```

---

## Parallel Execution Opportunities

| Tasks | Reason they can run in parallel |
|-------|--------------------------------|
| T002, T003 | Both modify frontend package.json and config but are independent setup steps |
| T005, T006 | Both modify ChatInterface.jsx but at different locations |
| T009, T010, T011 | All modify supporter.py but different sections of SUPPORTER_INSTRUCTION |
| T012 | Independent verification of existing purchase mode |

---

## Implementation Strategy

**MVP Scope**: Phase 1-3 (T001-T008) - Frontend markdown rendering with tests

**Incremental Delivery**:
1. Install react-markdown and Vitest testing dependencies
2. Configure Vitest for frontend testing
3. Verify component structure
4. Integrate ReactMarkdown in MessageBubble
5. Write and run unit tests for markdown rendering
6. Update backend prompt for strategic decision clarity
7. Verify purchase mode instructions
8. Final polish and build verification

---

## Summary

| Metric | Value |
|--------|-------|
| Total Tasks | 15 |
| User Story 1 Tasks | 4 (T005-T008) |
| User Story 2/4 Tasks | 3 (T009-T011) |
| User Story 3 Tasks | 1 (T012) |
| Setup/Foundational | 5 (T001-T004) |
| Polish | 3 (T013-T015) |
| Test Tasks | 2 (T007, T008, T015) |
| Parallelizable Tasks | 7 |
| MVP Tasks | 8 |
| **Completed** | **15/15** |