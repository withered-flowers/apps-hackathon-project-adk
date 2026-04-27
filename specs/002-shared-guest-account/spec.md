# Feature Specification: Shared Guest Account

**Feature Branch**: `002-shared-guest-account`  
**Created**: 2026-04-27  
**Status**: Draft  
**Input**: User description: "Help me to modify the apps: for the user Guest, there can be only 1 guest (1 shared anonymous account). currently it's always create a new unique account id for each guest. But I want this to be converted to just 1 guest user account id shared."

## Clarifications

### Session 2026-04-27
- Q: Guest Decision Limit → A: Exempt the Guest account from the limit entirely.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Unified Shared Guest Experience (Priority: P1)

All users who opt to continue as a Guest must be routed to a single, shared system identity. This ensures that guest sessions are collaborative and public among all unregistered users.

**Why this priority**: This directly addresses the user request to convert unique guest IDs into a single shared pool, simplifying the guest experience and matching legacy data handling.

**Independent Test**: Can be fully tested by opening the application in two different incognito browsers, logging in as Guest on both, and verifying that a decision created in browser A is immediately visible in browser B's session history.

**Acceptance Scenarios**:

1. **Given** User A selects "Continue as Guest", **When** they create a new decision, **Then** the decision is saved under the shared guest identity.
2. **Given** User B also selects "Continue as Guest", **When** they view the recent sessions list, **Then** they can see the decision created by User A.
3. **Given** a Guest user, **When** they view historical sessions, **Then** they can see all legacy decisions previously assigned to the "anonymous" pool.

---

### User Story 2 - Strict Isolation for Permanent Users (Priority: P2)

Permanent, registered users must remain strictly isolated from both the shared Guest pool and other permanent users. 

**Why this priority**: It is critical to ensure that making Guest accounts shared does not accidentally leak private data of registered users into the shared pool.

**Independent Test**: Can be fully tested by verifying that a registered user (e.g., via Email or Google Auth) cannot see Guest decisions, and Guest users cannot see the registered user's decisions.

**Acceptance Scenarios**:

1. **Given** a permanently registered user is logged in, **When** they view their sessions, **Then** they do not see any decisions from the shared Guest pool.
2. **Given** a Guest user is logged in, **When** they view sessions, **Then** they do not see any decisions created by permanently registered users.

---

### Edge Cases

- What happens if two Guest users attempt to modify the same active decision simultaneously?
  - System handles it via standard "last write wins" or real-time event streaming without breaking.
- How are legacy decisions treated?
  - Legacy decisions were originally assigned to an `"anonymous"` user ID. The new shared guest identity should map directly to this existing `"anonymous"` identifier to preserve continuity.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST map all anonymous/Guest logins to a single, static shared user identifier (e.g., `"anonymous"`).
- **FR-002**: System MUST allow any user authenticated as a Guest to read, update, and interact with all decisions owned by the shared Guest identifier.
- **FR-003**: System MUST NOT alter the unique identifiers or data isolation policies for authenticated permanent users (Email/Password or OAuth).
- **FR-004**: System MUST ensure that the shared Guest pool merges seamlessly with existing legacy decisions previously categorized as anonymous.
- **FR-005**: System MUST exempt the shared Guest identity from the standard 50-decision per-user limit, allowing unlimited decisions in the shared pool.

### Key Entities

- **Guest Identity**: A singleton representation in the system that all anonymous sessions map to for database operations, replacing the dynamically generated unique anonymous IDs.
- **Decision**: The existing entity. For Guests, the `user_id` field will always be the static shared identifier.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of new decisions created by any Guest user are assigned the identical shared user identifier.
- **SC-002**: Two distinct browsers authenticated as Guest can successfully view each other's newly created sessions with a 100% success rate in testing.
- **SC-003**: Zero instances of permanent user decisions leaking into the shared Guest pool.

## Assumptions

- We assume the backend identifier for the shared pool remains `"anonymous"` as established in the previous multi-user isolation feature.
- We assume that simultaneous interactions by multiple Guests on the same decision are an acceptable edge case that does not require complex locking mechanisms, matching existing chat behavior.
