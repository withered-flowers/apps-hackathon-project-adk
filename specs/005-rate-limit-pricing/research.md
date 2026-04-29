# Research: Rate Limiting with Upgrade Pricing

## Rate Limiting Strategy

### Decision
Use `slowapi` library with in-memory storage for rate limiting middleware.

### Rationale
- **slowapi** is the de-facto standard rate limiting library for FastAPI
- In-memory storage is explicitly approved in spec assumptions for MVP
- Easy migration path to Redis when scale requires
- Integrates cleanly with FastAPI's dependency injection system
- Well-maintained with active community

### Alternatives Evaluated

| Alternative | Why Rejected |
|-------------|--------------|
| Custom middleware with dict | Higher bug risk, no community support, reinventing wheel |
| Redis-only solution | Overcomplicates MVP; spec says Redis deferred |
| API Gateway throttling | Not in scope for self-hosted MVP; adds infrastructure dependency |

### Implementation Approach

1. Install `slowapi` package
2. Create `RateLimitManager` class wrapping slowapi's limiter
3. Use in-memory store with rolling window algorithm
4. Apply limits per user_id (registered) or session_id (guests)
5. Add rate limit headers to all responses

---

## Voucher Redemption Storage

### Decision
Store `rate_limit_tier` as a field on the existing User entity in Firestore.

### Rationale
- User data already persisted in Firestore per existing architecture
- Single field addition is minimal change
- Upgraded status is permanent per FR-010
- Easy query to check upgrade status

### Implementation Approach

1. Add `rate_limit_tier: str` field to User entity ("baseline" | "upgraded")
2. Create VoucherRedemption record to prevent duplicate redemptions
3. On "DEMO" redemption: update User.rate_limit_tier = "upgraded"
4. Check tier on each request to apply correct rate limit

---

## Specification Compliance Matrix

| FR | Implementation | Location |
|----|----------------|----------|
| FR-001 | slowapi limit guest: 30/5hr | backend/app/core/rate_limiter.py |
| FR-002 | slowapi limit registered: 3/2hr | backend/app/core/rate_limiter.py |
| FR-003 | slowapi limit upgraded: 20/1hr | backend/app/core/rate_limiter.py |
| FR-004 | POST /api/voucher/redeem endpoint | backend/app/api/routes.py |
| FR-005 | Return 429 on limit exceeded | slowapi middleware |
| FR-006 | X-RateLimit-* headers | slowapi middleware |
| FR-007 | Track per user_id/session_id | RateLimitManager class |
| FR-008 | Rolling window expiry | slowapi with in-memory store |
| FR-009 | Reject invalid codes | voucher_service.py |
| FR-010 | Permanent upgrade on DEMO | User entity + voucher_service.py |