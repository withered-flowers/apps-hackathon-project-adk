# Feature Specification: Multi-User Isolation

**Feature Branch**: `001-multi-user-isolation`  
**Created**: 2026-04-26  
**Status**: Draft  
**Input**: User description: "Modify the existing apps: (1) Current backend and frontend currently is only for one user with shared all decision. Modify this into multi user and share this into multi user, with each of the user have its decision protected - one user can only see their decision only. (2) See the current for more info."

## Clarifications

### Session 2026-04-26
- Q: What happens to decisions made during a Guest session if that user creates a permanent account? → A: Keep separate (start the permanent account with a fresh slate).
- Q: How should new Guest users interact with the legacy data assigned to the Guest profile? → A: Shared Pool (All Guest users share access to the legacy decisions).
- Q: Should we implement a limit on the maximum number of decisions a single user can create? → A: 50 per user.
- Q: How long should an anonymous Guest session remain active? → A: Permanent (Never expire).
- Q: Should new decisions created by a Guest be private or added to the Shared Pool? → A: Shared Pool (All Guests see all Guest work).
- Q: Should permanent accounts have any sharing functionality? → A: Strictly 1-to-1 (No sharing allowed).
- Q: How should the system respond to unauthorized access attempts (e.g., guessing IDs)? → A: 404 Not Found (Stealth).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Secure User Authentication and Session Management (Priority: P1)

Users must be able to securely log into the application so that their session is uniquely identified and tied to their personal data.

**Why this priority**: Without authentication and unique user sessions, it is impossible to separate data securely between different users.

**Independent Test**: Can be fully tested by verifying that two different users can log in on separate devices/browsers and receive distinct, isolated sessions.

**Acceptance Scenarios**:

1. **Given** a user is not logged in, **When** they access the application, **Then** they are prompted to authenticate.
2. **Given** a user provides valid credentials, **When** they log in, **Then** they are granted access to the application under their unique user identity.
3. **Given** an authenticated user, **When** their session expires or they log out, **Then** they must re-authenticate to access the application.

---

### User Story 2 - Isolated Decision Creation and Retrieval (Priority: P2)

Users must be able to create new decisions and view only the decisions they have created, without seeing decisions created by others.

**Why this priority**: This is the core requirement of the feature—protecting user data and ensuring isolation in a multi-user environment.

**Independent Test**: Can be fully tested by having User A create a decision, logging in as User B, and verifying that User B cannot see User A's decision.

**Acceptance Scenarios**:

1. **Given** User A is logged in, **When** they create a new decision, **Then** the decision is saved and associated exclusively with User A.
2. **Given** User A is logged in, **When** they view the list of decisions, **Then** they only see decisions created by User A.
3. **Given** User B is logged in, **When** they attempt to access a decision created by User A (e.g., via a direct link or system interface), **Then** the system denies access and returns an authorization error.

---

### Edge Cases

- What happens if a user attempts to manually manipulate system requests to view decisions belonging to another user ID? → System responds with 404 Not Found.
- How does the system handle legacy decisions created before multi-user support was implemented? → Assigned to a shared 'Guest' pool.

## Requirements *(mandatory)*

### Functional Requirements

- FR-001: System MUST uniquely identify and authenticate each user.
- FR-002: System MUST associate every created decision with the authenticated user who created it.
- FR-003: System MUST filter all decision-listing queries to return only records belonging to the currently authenticated user.
- FR-004: System MUST enforce authorization checks on all single-decision retrieval, update, and deletion operations to ensure the requesting user owns the decision.
- FR-005: System MUST authenticate users via an authentication provider supporting Email/Password, third-party OAuth, and Guest (anonymous) logins.
- FR-006: System MUST handle existing legacy data by assigning ownership of all pre-existing decisions to a shared 'Guest' user profile, meaning all users logging in as a Guest will share access to these legacy decisions.
- FR-007: System MUST NOT migrate Guest session data when a user creates a permanent account (permanent accounts start with a fresh slate).
- FR-008: System MUST limit each user to a maximum of 50 decisions to manage resource usage.
- FR-009: System MUST respond with a 404 Not Found status when a user attempts to access a decision they do not own.

### Key Entities

- User: Represents an individual interacting with the system. Contains authentication credentials and profile information.
- Decision: Represents a choice or outcome generated/saved in the app. Must contain an identifier linking it securely to the `User` who owns it.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- SC-001: 100% of system interfaces returning or modifying decisions enforce user-ownership checks.
- SC-002: Users can successfully log in and view their personal dashboard in under 2 seconds.
- SC-003: Automated tests verify that User A cannot access User B's decisions with a 100% pass rate.
- SC-004: No regressions in existing decision-making performance (decision creation time remains within 10% of 500ms baseline).
- SC-005: System successfully enforces a hard limit of 50 decisions per user profile.
- SC-006: Security audit confirms that unauthorized ID probing returns 404 responses.

## Assumptions

- The frontend application has or will be updated with a login interface to support the authentication requirement.
- User registration/provisioning flow is either out of scope for this specific task or will use a standard self-serve registration model.
- There are no "shared" decisions or "admin" roles needed for permanent accounts; strictly 1-to-1 isolation between a permanent user and their decisions (Guest accounts will act as a shared pool).
- Firebase Authentication will be utilized as the technical identity provider to fulfill the authentication requirements.