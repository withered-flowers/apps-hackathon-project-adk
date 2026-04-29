# Data Model: Landing Page with Pricing and Rate Limit UI

## Entity Definitions

### RateLimitStatus

| Field | Type | Description |
|-------|------|-------------|
| tier | string | "guest" \| "registered" \| "upgraded" |
| remaining | int | Number of requests left in current window |
| reset | int | Unix timestamp when window resets |
| limit | int | Max requests allowed in window |

### VoucherRedemptionForm

| Field | Type | Description |
|-------|------|-------------|
| code | string | User-entered voucher code |

### PricingPlan

| Field | Type | Description |
|-------|------|-------------|
| name | string | Tier name (Guest, Registered, Upgraded) |
| requests | int | Requests allowed |
| window | string | Time window (e.g., "per 5 hours") |
| price | string | Price display (e.g., "Free", "$10") |

---

## Data Flow

```
User loads page
    ↓
Check auth state
    ↓
If not authenticated → Show LandingPage component
    ↓
If authenticated → Show RateLimitBanner + ChatInterface
    ↓
Rate limit headers from API response → RateLimitBanner displays status
    ↓
If user enters DEMO code → VoucherRedeem form → API call → User tier updated
```

---

## State Transitions

| State | Event | New State |
|-------|-------|-----------|
| Unauthenticated | Login success | Authenticated |
| Guest | Redeem DEMO | Upgraded |
| Any tier | Window expires | Same tier, counter reset |

---

## Constraints

- Landing page must be visible to unauthenticated users only
- Rate limit banner only visible to authenticated users
- Voucher redemption only accepts "DEMO" code for MVP