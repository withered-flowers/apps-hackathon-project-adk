# Feature Specification: Landing Page with Pricing and Rate Limit UI

**Feature Branch**: `006-landing-page-pricing`
**Created**: 2026-04-29
**Status**: Draft
**Input**: User description: "Implement rate limit on the frontend: (1) Make a landing page for the decidely.ai to show what it can do, and the pricing and have a navigation into the decision making page. (2) Don't forget to implement the voucher code redemption, since this is a prototype, tell user to use the voucher "DEMO" for the free upgrade. (3) Implement the rate limiter on the frontend (show resource exhausted and tell user to upgrade when rate limit is reached)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Landing Page Discovery (Priority: P1)

As a new visitor, I want to understand what Decidely.ai does and how it can help me make better decisions.

**Why this priority**: First impression is critical for conversion.

**Independent Test**: Can be fully tested by visiting the landing page and verifying all sections are visible and navigable.

**Acceptance Scenarios**:

1. **Given** I am a new visitor, **When** I visit the landing page, **Then** I can see a clear value proposition explaining what Decidely.ai does
2. **Given** I am a new visitor, **When** I visit the landing page, **Then** I can see pricing information
3. **Given** I am a new visitor, **When** I click on "Start Decision" or similar CTA, **Then** I am navigated to the decision-making interface

---

### User Story 2 - Voucher Code Redemption (Priority: P1)

As a registered user, I want to redeem a voucher code to upgrade my rate limits.

**Why this priority**: This is the monetization mechanism for the prototype.

**Independent Test**: Can be fully tested by entering voucher code "DEMO" and verifying upgrade confirmation.

**Acceptance Scenarios**:

1. **Given** I am a registered user, **When** I navigate to the upgrade/voucher page, **Then** I can enter a voucher code
2. **Given** I enter the code "DEMO", **When** I submit the code, **Then** I receive confirmation that my rate limit is upgraded to 20 requests per hour
3. **Given** I enter an invalid voucher code, **When** I submit the code, **Then** I receive an error message

---

### User Story 3 - Rate Limit UI Feedback (Priority: P1)

As a user, I want to see my current rate limit status and be informed when I am exhausted.

**Why this priority**: Users need to understand their usage to plan their decision-making process.

**Independent Test**: Can be tested by checking rate limit display and triggering exhaustion scenario.

**Acceptance Scenarios**:

1. **Given** I am using the application, **When** I view the interface, **Then** I can see my current rate limit status (e.g., "5 requests remaining")
2. **Given** I am approaching my rate limit, **When** I have 1-2 requests left, **Then** I see a warning indicator
3. **Given** I have exceeded my rate limit, **When** I try to make a request, **Then** I see a message explaining my limit is reached and offering upgrade option
4. **Given** I am rate-limited, **When** I view the message, **Then** I see instructions to use voucher code "DEMO" for free upgrade

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Landing page MUST display the product's value proposition and capabilities
- **FR-002**: Landing page MUST display pricing information for registered users
- **FR-003**: Landing page MUST include a clear call-to-action to start the decision-making process
- **FR-004**: System MUST provide a voucher redemption interface for registered users
- **FR-005**: System MUST accept voucher code "DEMO" and confirm successful upgrade
- **FR-006**: System MUST reject invalid voucher codes with an appropriate error message
- **FR-007**: Frontend MUST display current rate limit status to the user
- **FR-008**: Frontend MUST display a warning when user is approaching their rate limit (1-2 requests remaining)
- **FR-009**: Frontend MUST display an error/exhausted state when rate limit is reached
- **FR-010**: Rate-limited state MUST include upgrade instructions with voucher code "DEMO"

### Key Entities *(include if feature involves data)*

- **RateLimitStatus**: Displays current tier (guest/registered/upgraded), remaining requests, and reset time
- **VoucherRedemptionForm**: Input field for voucher code and submit button
- **PricingPlan**: Defines what each tier offers (guest: 30/5hr, registered: 3/2hr, upgraded: 20/1hr)

## Clarifications

### Session 2026-04-29

- Q: Voucher redemption UI location → A: Integrate VoucherRedeem component into App.jsx header area (next to user info) for simplicity

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Landing page has a visible CTA button that navigates to decision interface in 100% of page loads
- **SC-002**: Voucher code "DEMO" successfully upgrades user tier and displays confirmation within 2 seconds of submission
- **SC-003**: Invalid voucher codes display error message within 1 second
- **SC-004**: Rate limit status is visible on every page where user can make requests
- **SC-005**: Rate-limited users see upgrade prompt with "DEMO" voucher code instruction

## Assumptions

- Landing page is the default route (/) when not authenticated
- Pricing display shows guest (30 requests/5 hours), registered (3 requests/2 hours), and upgraded (20 requests/1 hour)
- Voucher redemption UI is integrated into App.jsx header (simpler approach)
- Rate limit display is integrated into the header area for authenticated users
- Rate limit exhausted message appears as a modal or inline error message