# Implementation Plan: Rate Limiting with Upgrade Pricing

**Branch**: `005-rate-limit-pricing` | **Date**: 2026-04-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-rate-limit-pricing/spec.md`

## Summary

Implement rate limiting for the Decidely.ai API with three tiers: guest (30/5hr), registered (3/2hr), upgraded (20/1hr). Upgrade is unlocked via "DEMO" voucher code redemption.

## Technical Context

**Language/Version**: Python 3.11+ (backend), JavaScript/TypeScript (frontend)
**Primary Dependencies**: FastAPI (backend), slowapi (rate limiting), Firebase Auth
**Storage**: In-memory dict for MVP (Redis deferred per spec assumption)
**Testing**: pytest (backend), manual testing
**Target Platform**: Linux server (Cloud Run)
**Project Type**: Web-service + React frontend
**Performance Goals**: Rate limit checks < 10ms overhead
**Constraints**: Must not break existing API contracts; 429 responses must be properly formatted
**Scale/Scope**: All users (guest + registered); primary endpoints: /chat, /chat/stream

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Code Verbosity & Clarity | PASS | Rate limit logic will be documented with clear function names |
| II. User Experience Consistency | PASS | Consistent 429 responses with rate limit headers |
| III. Requirement-Driven Prototyping | PASS | Each FR addressed; in-memory storage for MVP |

## Project Structure

### Source Code (repository root)

```text
backend/
├── app/
│   ├── api/
│   │   └── routes.py           # Add rate limiting middleware
│   ├── core/
│   │   ├── auth.py             # get_current_user_id (existing)
│   │   └── rate_limiter.py     # NEW: Rate limiting logic
│   ├── models/
│   │   ├── entities.py         # Add rate_limit_tier to User
│   │   └── schemas.py          # Add voucher redemption schema
│   └── services/
│       └── voucher_service.py   # NEW: Voucher redemption logic
frontend/
├── src/
│   ├── context/
│   │   └── AuthContext.jsx     # Show rate limit status to user
│   └── ...
```

**Structure Decision**: Web application with FastAPI backend. Rate limiting implemented as FastAPI middleware with in-memory storage.

## Phase 0: Research

### Research: Rate Limiting Strategy

**Decision**: Use slowapi library with in-memory storage for rate limiting

**Rationale**:
- slowapi is the standard rate limiting library for FastAPI
- In-memory storage sufficient for MVP scale (per spec assumption)
- Easy to swap to Redis later when needed
- Integrates well with FastAPI dependency injection

**Alternatives evaluated**:
| Alternative | Why Rejected |
|-------------|--------------|
| Custom middleware | More error-prone, no community support |
| Redis-only | Overcomplicates MVP; spec says deferred |
| API Gateway rate limiting | Not in scope for MVP |

### Research: Voucher Redemption Storage

**Decision**: Add `rate_limit_tier` field to User entity in Firestore

**Rationale**:
- User already stored in Firestore
- Simple boolean or tier string is sufficient for MVP
- Permanent upgrade (per spec FR-010)

## Phase 1: Design & Contracts

### Data Model (Entities from Spec)

| Entity | Fields | Notes |
|--------|--------|-------|
| RateLimitRecord | user_id: string, count: int, window_start: datetime, tier: string | In-memory only |
| User.rate_limit_tier | string ("baseline" \| "upgraded") | Added to existing User entity |
| VoucherRedemption | user_id: string, code: string, redeemed_at: datetime | Prevent duplicate redemptions |

### Interface Contracts

**Rate Limit Headers** (added to all responses):
```
X-RateLimit-Limit: <max_requests>
X-RateLimit-Remaining: <requests_left>
X-RateLimit-Reset: <unix_timestamp>
```

**429 Response Format**:
```json
{
  "detail": "Rate limit exceeded. Try again in X minutes.",
  "retry_after": <seconds>
}
```

**Voucher Redemption Endpoint**:
```
POST /api/voucher/redeem
Body: { "code": "DEMO" }
Response: { "status": "upgraded", "new_limit": "20 per hour" }
```

### Quickstart

1. Add slowapi to backend requirements
2. Create rate_limiter.py with RateLimitManager class
3. Add rate limit headers to all API responses
4. Apply rate limits to /chat and /chat/stream endpoints
5. Create voucher redemption endpoint

## Complexity Tracking

> No constitution violations requiring justification.