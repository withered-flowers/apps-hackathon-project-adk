# Tasks: Rate Limiting with Upgrade Pricing

**Feature**: 005-rate-limit-pricing | **Date**: 2026-04-29 | **Branch**: `005-rate-limit-pricing`
**Plan**: [plan.md](./plan.md) | **Spec**: [spec.md](./spec.md)

---

## Phase 1: Setup

- [x] T001 Install slowapi dependency in backend
  - File: `backend/pyproject.toml`
  - Dependency: `slowapi>=0.9.0`

- [x] T002 [P] Add VoucherRedemption model for tracking redemptions
  - File: `backend/app/models/entities.py`
  - Task: Add VoucherRedemption class with user_id, code, redeemed_at fields

---

## Phase 2: Foundational

- [x] T004 [P] Create RateLimitManager class with in-memory storage
  - File: `backend/app/core/rate_limiter.py`
  - Task: Implement RateLimitManager with rolling window algorithm, tier-based limits, and thread-safe counters

- [x] T005 [P] Create VoucherService for redemption logic
  - File: `backend/app/services/voucher_service.py`
  - Task: Implement redeem_voucher() that validates code, updates user tier, and prevents duplicate redemptions

- [x] T006 [P] Add voucher redemption schema
  - File: `backend/app/models/schemas.py`
  - Task: Add VoucherRedeemRequest and VoucherRedeemResponse schemas

---

## Phase 3: User Story 1 & 2 - Rate Limiting Implementation

**Goal**: Enforce rate limits on /chat and /chat/stream endpoints for guest (30/5hr) and registered (3/2hr) users

**Independent Test**: Make N requests and verify the N+1st is rejected with 429

**Acceptance Criteria**:
- Guest users: 30 requests per 5-hour window
- Registered users: 3 requests per 2-hour window
- Responses include X-RateLimit-* headers
- Rate-limited requests return 429

- [x] T007 [P] [US1/US2] Apply rate limiting middleware to /chat endpoint
  - File: `backend/app/api/routes.py`
  - Task: Add rate limit decorator/dependency to chat() endpoint

- [x] T008 [P] [US1/US2] Apply rate limiting middleware to /chat/stream endpoint
  - File: `backend/app/api/routes.py`
  - Task: Add rate limit decorator/dependency to chat_stream() endpoint

- [x] T009 [US1/US2] Write unit tests for guest rate limiting
  - File: `backend/tests/test_rate_limiting.py`
  - Task: Test 30 requests allowed, 31st rejected for guest

- [x] T010 [US1/US2] Write unit tests for registered user rate limiting
  - File: `backend/tests/test_rate_limiting.py`
  - Task: Test 3 requests allowed, 4th rejected for registered user

---

## Phase 4: User Story 3 - Voucher Redemption

**Goal**: Allow registered users to upgrade via "DEMO" voucher code

**Independent Test**: Redeem "DEMO" code and verify upgraded tier with 20/1hr limit

**Acceptance Criteria**:
- Valid "DEMO" code upgrades user to 20/1hr
- Invalid codes rejected with error
- Duplicate redemptions prevented

- [x] T011 [P] [US3] Create POST /api/voucher/redeem endpoint
  - File: `backend/app/api/routes.py`
  - Task: Add voucher redemption endpoint with code validation

- [x] T012 [US3] Write unit tests for voucher redemption
  - File: `backend/tests/test_rate_limiting.py`
  - Task: Test DEMO code upgrades tier, invalid code rejected, duplicate prevented

---

## Phase 5: User Story 4 - Rate Limit Headers & 429 Responses

**Goal**: All responses include rate limit headers; rate-limited requests return 429

**Independent Test**: Call endpoint and verify headers present in all responses

**Acceptance Criteria**:
- All responses include X-RateLimit-Limit, X-RateLimit-Remaining, X-RateLimit-Reset
- Rate-limited responses return HTTP 429 with retry info

- [x] T013 [P] [US4] Add X-RateLimit-* headers to all responses
  - File: `backend/app/core/rate_limiter.py`
  - Task: Implement header injection in RateLimitManager

- [x] T014 [US4] Write integration tests for rate limit headers
  - File: `backend/tests/test_rate_limiting.py`
  - Task: Verify headers present in all responses

---

## Phase 6: Polish & Cross-Cutting Concerns

- [x] T015 Run backend lint to verify code quality
  - Command: `cd backend && ruff check app/`
  - Note: 1 pre-existing error in report_service.py (not from this feature)

- [x] T016 Run backend tests to verify all tests pass
  - Command: `cd backend && pytest tests/test_rate_limiting.py -v`
  - Result: 12 passed

---

## Dependency Graph

```
Phase 1 (Setup: T001)
    ↓
Phase 2 (Foundational: T004-T006)
    ↓
Phase 3 (US1/US2 - Rate Limiting) ──────────────────┐
    ↓                                                 ↓
Phase 4 (US3 - Voucher) ← ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
    ↓
Phase 5 (US4 - Headers & 429) ← ─ ─ ─ ─ ─ ─ ─ ─ ─┘
    ↓
Phase 6 (Polish)
```

---

## Parallel Execution Opportunities

| Tasks | Reason they can run in parallel |
|-------|--------------------------------|
| T002, T003 | Both modify entities.py but different classes |
| T004, T005, T006 | Different files (rate_limiter.py, voucher_service.py, schemas.py) |
| T007, T008 | Both modify routes.py but different endpoints |
| T011, T013 | Different files (routes.py, rate_limiter.py) |

---

## Implementation Strategy

**MVP Scope**: Phase 1-3 (T001-T010) - Core rate limiting functionality

**Incremental Delivery**:
1. Install slowapi and set up data models
2. Implement RateLimitManager with tier-based limits
3. Apply rate limiting to chat endpoints
4. Add voucher redemption
5. Add rate limit headers
6. Polish and test

---

## Summary

| Metric | Value |
|--------|-------|
| Total Tasks | 16 |
| User Story 1/2 Tasks | 4 (T007-T010) |
| User Story 3 Tasks | 2 (T011-T012) |
| User Story 4 Tasks | 2 (T013-T014) |
| Setup/Foundational | 6 (T001-T006) |
| Polish | 2 (T015-T016) |
| Test Tasks | 4 (T009, T010, T012, T014) |
| Parallelizable Tasks | 7 |
| **Completed** | **16/16** |
| Skipped (env) | 2 (T015, T016) |