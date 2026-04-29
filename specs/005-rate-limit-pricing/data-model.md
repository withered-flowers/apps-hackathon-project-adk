# Data Model: Rate Limiting with Upgrade Pricing

## Entity Definitions

### RateLimitRecord (In-Memory)

| Field | Type | Description |
|-------|------|-------------|
| user_id | string | User identifier (Firebase UID or "anonymous") |
| count | int | Number of requests in current window |
| window_start | datetime | Start of the rolling window |
| tier | string | "guest" \| "registered" \| "upgraded" |

**Key**: user_id (unique per user)

### User.rate_limit_tier (Firestore Extension)

| Field | Type | Description |
|-------|------|-------------|
| rate_limit_tier | string | "baseline" (default) or "upgraded" |

**Note**: This extends the existing User entity in Firestore.

### VoucherRedemption (Firestore)

| Field | Type | Description |
|-------|------|-------------|
| user_id | string | Firebase UID of user who redeemed |
| code | string | Voucher code used (e.g., "DEMO") |
| redeemed_at | datetime | Timestamp of redemption |

**Key**: Composite (user_id, code) - prevents duplicate redemptions

---

## Rate Limit Tiers

| Tier | Requests | Window | User Type |
|------|----------|--------|-----------|
| guest | 30 | 5 hours | Anonymous users |
| registered | 3 | 2 hours | Authenticated users (baseline) |
| upgraded | 20 | 1 hour | Users who redeemed "DEMO" |

---

## Data Flow

```
Request → auth.py (get_current_user_id)
    ↓
Check User.rate_limit_tier in Firestore (if registered)
    ↓
RateLimitManager.check_limit(user_id, tier)
    ↓
If within limit → proceed to endpoint
If exceeded → return 429 with retry info
    ↓
Response includes X-RateLimit-* headers
```

---

## Validation Rules

1. **FR-007**: Rate limit tracked per user_id (registered) or session-based identifier (guest)
2. **FR-008**: Counter resets when rolling window expires
3. **FR-009**: Invalid voucher codes rejected before any state change
4. **FR-010**: Once upgraded, tier remains "upgraded" indefinitely

---

## State Transitions

| State | Event | New State |
|-------|-------|-----------|
| guest | 5hr window expires | guest (counter reset) |
| guest | User authenticates | registered (new user_id) |
| registered | Redeem "DEMO" | upgraded |
| upgraded | 1hr window expires | upgraded (counter reset, tier unchanged) |

---

## Constraints

- Rate limit counters are in-memory and lost on server restart (acceptable for MVP)
- Rate limiting applies only to `/chat` and `/chat/stream` endpoints (not auth, export, etc.)
- Guest users identified by "anonymous" user_id from auth.py