# Feature Specification: Rate Limiting with Upgrade Pricing

**Feature Branch**: `005-rate-limit-pricing`
**Created**: 2026-04-29
**Status**: Draft
**Input**: User description: "Implement Rate limit: For registered user it is 3 per 2 hours, For guests it's 30 per 5 hours. Implement Pricing: Registered User can upgrade the limit for their usage from 3 per 2 hours to 20 per 1 hours with 10$ upgrade (for now we will just mock this upgrade, with redeem voucher code "DEMO")."

## Clarifications

### Session 2026-04-29

- Q: Guest tier data model representation → A: Guest tier is implicit based on user_id="anonymous". No explicit guest tier in data model.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Guest Rate Limiting (Priority: P1)

As a guest user, I want to make decisions with a reasonable rate limit so I can try the service before signing up.

**Why this priority**: Guest access is the first touchpoint for new users; rate limiting must be fair yet protect system resources.

**Independent Test**: Can be fully tested by making 30 requests within 5 hours and verifying the 31st request is rejected.

**Acceptance Scenarios**:

1. **Given** I am a guest user, **When** I make up to 30 requests within a 5-hour window, **Then** all requests are processed normally
2. **Given** I am a guest user, **When** I exceed 30 requests within a 5-hour window, **Then** my request is rejected with an appropriate message
3. **Given** I am a guest user and my rate limit has passed (5 hours elapsed), **When** I make a new request, **Then** my request is processed normally (counter reset)

---

### User Story 2 - Registered User Rate Limiting (Priority: P1)

As a registered user, I want a baseline rate limit that is lower than guests so I can make thoughtful decisions.

**Why this priority**: Registered users get a smaller but higher-quality allocation; encourages account creation.

**Independent Test**: Can be fully tested by making 3 requests within 2 hours and verifying the 4th request is rejected.

**Acceptance Scenarios**:

1. **Given** I am a registered user (non-upgraded), **When** I make up to 3 requests within a 2-hour window, **Then** all requests are processed normally
2. **Given** I am a registered user (non-upgraded), **When** I exceed 3 requests within a 2-hour window, **Then** my request is rejected with an appropriate message
3. **Given** I am a registered user (non-upgraded) and my rate limit window has passed (2 hours elapsed), **When** I make a new request, **Then** my request is processed normally (counter reset)

---

### User Story 3 - Registered User Upgrade via Voucher (Priority: P1)

As a registered user, I want to upgrade my rate limit so I can make more decisions per hour for intensive research.

**Why this priority**: This is the monetization mechanism; must be simple and functional.

**Independent Test**: Can be fully tested by redeeming voucher code "DEMO" and verifying the rate limit changes to 20 per 1 hour.

**Acceptance Scenarios**:

1. **Given** I am a registered user with baseline limit (3 per 2 hours), **When** I redeem the voucher code "DEMO", **Then** my rate limit is upgraded to 20 requests per 1 hour
2. **Given** I am a registered user who has redeemed "DEMO" voucher, **When** I make up to 20 requests within a 1-hour window, **Then** all requests are processed normally
3. **Given** I am a registered user who has redeemed "DEMO" voucher, **When** I exceed 20 requests within a 1-hour window, **Then** my request is rejected with an appropriate message
4. **Given** I redeem an invalid voucher code, **When** I submit the code, **Then** I receive an error message and my rate limit remains unchanged

---

### User Story 4 - Rate Limit Enforcement on API Endpoints (Priority: P1)

As the system, I need to enforce rate limits on all decision-related endpoints so that resource usage is controlled.

**Why this priority**: Core system protection; without this the rate limiting feature has no effect.

**Independent Test**: Can be tested by calling any decision API endpoint and verifying rate limit headers are present.

**Acceptance Scenarios**:

1. **Given** I am any user (guest or registered), **When** I receive a response from a rate-limited endpoint, **Then** the response includes rate limit information in headers
2. **Given** I am a guest user, **When** I am rate-limited, **Then** I receive a 429 Too Many Requests response
3. **Given** I am a registered user, **When** I am rate-limited, **Then** I receive a 429 Too Many Requests response

---

### Edge Cases

- What happens when a guest user's window is about to expire (1 minute left)? Should the request be allowed or rejected?
- How does the system handle clock drift between servers when calculating rate limit windows?
- What happens if a user transitions from guest to registered while having an active rate limit counter?
- How does the system handle concurrent requests from the same user (race conditions)?
- What happens when the "DEMO" voucher is redeemed multiple times by the same user?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST limit guest users to 30 requests per 5-hour rolling window
- **FR-002**: System MUST limit registered (non-upgraded) users to 3 requests per 2-hour rolling window
- **FR-003**: System MUST limit upgraded registered users to 20 requests per 1-hour rolling window
- **FR-004**: System MUST provide a voucher redemption mechanism for code "DEMO" that upgrades registered users
- **FR-005**: System MUST return HTTP 429 (Too Many Requests) when a user exceeds their rate limit
- **FR-006**: System MUST include rate limit status in response headers (e.g., X-RateLimit-Remaining, X-RateLimit-Reset)
- **FR-007**: System MUST track rate limit counters per user identifier (user ID for registered, session ID for guests)
- **FR-008**: System MUST reset rate limit counter when the rolling window expires
- **FR-009**: System MUST reject invalid voucher codes with an appropriate error message
- **FR-010**: Upgraded rate limit MUST persist indefinitely once "DEMO" voucher is redeemed (no expiration for MVP)

### Key Entities *(include if feature involves data)*

- **RateLimitRecord**: Tracks usage count, window start time, and limit type per user/session
- **User**: Existing entity that stores rate limit tier ("baseline" or "upgraded"). Guest tier is implicit when user_id is "anonymous".
- **VoucherRedemption**: Records voucher code usage per user (to prevent duplicate redemptions)

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Guest users can make 30 requests within a 5-hour period with 100% success rate before hitting limit
- **SC-002**: Registered users can make 3 requests within a 2-hour period with 100% success rate before hitting limit
- **SC-003**: Upgraded users can make 20 requests within a 1-hour period with 100% success rate before hitting limit
- **SC-004**: Rate-limited requests return within 100ms (no perceptible delay from rate limiting itself)
- **SC-005**: Voucher code "DEMO" successfully upgrades 100% of valid redemption attempts
- **SC-006**: Invalid voucher codes receive error response within 500ms

## Assumptions

- Rate limit counters are stored in-memory for MVP (Redis implementation deferred)
- Clock synchronization between application servers is handled at infrastructure level
- Guest users are identified by session ID stored in cookie or local storage
- The upgrade via "DEMO" voucher is permanent for this MVP (no subscription model yet)
- Rate limiting applies only to decision-related API endpoints, not to static content or auth endpoints
- Users are authenticated via existing Firebase authentication system