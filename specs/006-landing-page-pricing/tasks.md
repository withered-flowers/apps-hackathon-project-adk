# Tasks: Landing Page with Pricing and Rate Limit UI

**Feature**: 006-landing-page-pricing | **Date**: 2026-04-29 | **Branch**: `006-landing-page-pricing`
**Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

---

## Phase 1: Setup

- [x] T001 Verify frontend dependencies (React already set up)
  - File: `frontend/package.json`
  - Task: Confirm React, Tailwind CSS, and framer-motion are installed

---

## Phase 2: Foundational - Component Creation

- [x] T002 [P] Create LandingPage component
  - File: `frontend/src/components/LandingPage.jsx`
  - Task: Create hero section with value proposition and CTA button

- [x] T003 [P] Create PricingCard component
  - File: `frontend/src/components/PricingCard.jsx`
  - Task: Display pricing tiers (Guest: 30/5hr, Registered: 3/2hr, Upgraded: 20/1hr)

- [x] T004 [P] Create RateLimitBanner component
  - File: `frontend/src/components/RateLimitBanner.jsx`
  - Task: Display current rate limit status with warning and exhausted states

- [x] T005 [P] Create VoucherRedeem component
  - File: `frontend/src/components/VoucherRedeem.jsx`
  - Task: Input field for voucher code with submit button

---

## Phase 3: User Story 1 - Landing Page Discovery

**Goal**: Visitors see landing page with value proposition, pricing, and CTA

**Independent Test**: Visit landing page and verify sections visible

- [x] T006 [US1] Integrate LandingPage into App.jsx
  - File: `frontend/src/App.jsx`
  - Task: Show LandingPage when user is not authenticated

- [x] T007 [US1] Add pricing section to LandingPage
  - File: `frontend/src/components/LandingPage.jsx`
  - Task: Include PricingCard component with all three tiers

- [x] T008 [US1] Add CTA button to navigate to auth
  - File: `frontend/src/components/LandingPage.jsx`
  - Task: Button triggers login flow

---

## Phase 4: User Story 2 - Voucher Code Redemption

**Goal**: Registered users can redeem "DEMO" voucher

**Independent Test**: Enter "DEMO" code and verify upgrade

- [x] T009 [US2] Integrate VoucherRedeem into App.jsx header
  - File: `frontend/src/App.jsx`
  - Task: Show voucher redemption form in header area for authenticated users

- [x] T010 [US2] Connect voucher form to API endpoint
  - File: `frontend/src/services/api.js`
  - Task: Add POST /api/voucher/redeem call

---

## Phase 5: User Story 3 - Rate Limit UI Feedback

**Goal**: Users see their rate limit status and get upgrade prompts

**Independent Test**: View rate limit display and exhaustion scenario

- [x] T011 [US3] Add RateLimitBanner to header area
  - File: `frontend/src/App.jsx`
  - Task: Show RateLimitBanner in header for authenticated users

- [x] T012 [US3] Implement warning state (1-2 requests remaining)
  - File: `frontend/src/components/RateLimitBanner.jsx`
  - Task: Display warning indicator when remaining <= 2

- [x] T013 [US3] Implement exhausted state with DEMO prompt
  - File: `frontend/src/components/RateLimitBanner.jsx`
  - Task: Show "Resource Exhausted" message with DEMO voucher code

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T014 Run frontend build to verify no compilation errors
  - Command: `cd frontend && bun run build`

- [x] T015 Run frontend tests to verify all tests pass
  - Command: `cd frontend && bun run test`

---

## Dependency Graph

```
Phase 1 (Setup)
    ↓
Phase 2 (Components: T002-T005)
    ↓
Phase 3 (US1 - Landing) ──────────────────┐
    ↓                                       ↓
Phase 4 (US2 - Voucher) ← ─ ─ ─ ─ ─ ─ ─ ┘
    ↓
Phase 5 (US3 - Rate Limit UI) ← ─ ─ ─ ─┘
    ↓
Phase 6 (Polish)
```

---

## Parallel Execution Opportunities

| Tasks | Reason they can run in parallel |
|-------|--------------------------------|
| T002, T003, T004, T005 | Different component files, no dependencies |

---

## Implementation Strategy

**MVP Scope**: Phase 2-3 (T002-T008) - Landing page visible to visitors

**Incremental Delivery**:
1. Create all UI components
2. Integrate landing page for unauthenticated users
3. Add voucher redemption flow
4. Add rate limit banner with warning states
5. Polish and test

---

## Summary

| Metric | Value |
|--------|-------|
| Total Tasks | 15 |
| User Story 1 Tasks | 3 (T006-T008) |
| User Story 2 Tasks | 2 (T009-T010) |
| User Story 3 Tasks | 3 (T011-T013) |
| Setup/Foundational | 6 (T001-T005) |
| Polish | 2 (T014-T015) |
| Parallelizable Tasks | 4 |
| MVP Tasks | 11 |