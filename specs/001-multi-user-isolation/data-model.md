# Data Model: Multi-User Isolation

**Date**: 2026-04-26
**Feature**: 001-multi-user-isolation

## Entities

### User (Firebase Auth)
The `User` entity is not strictly managed in our database (Firestore), but rather by the identity provider (Firebase Authentication). Our system only stores a reference (the user ID) to associate decisions.

* **Attributes (managed by Firebase)**:
  * `uid` (string): The unique identifier for the user. Permanent accounts have a unique `uid`, while Guest users will either share a single `uid` ("anonymous") or each get a temporary `uid` (but per FR-006, Guest users share a single pool, so we will treat all anonymous logins as the `user_id = "anonymous"` profile).
  * `email` (string, optional): For permanent Email/Password accounts.
  * `providerId` (string): e.g., "password", "google.com", "anonymous".

### DecisionSession
The core entity storing the state of a multi-agent decision journey. It maps directly to the existing Firestore collection.

* **Fields**:
  * `session_id` (string, PK): Unique identifier.
  * `user_id` (string): **NEW/UPDATED** - Foreign key to the User. Defaults to `"anonymous"` for Guest users and legacy data. Permanent users will store their Firebase `uid` here.
  * `status` (string): Current state of the pipeline (Interviewing, Researching, Evaluating, Complete).
  * `last_message_at` (datetime): Timestamp of the last interaction.
  * `transcript` (array of Messages): The conversation history.
  * `criteria` (array of DecisionCriteria): Extracted user criteria.
  * `options` (array of Options): Researched options.
  * `matrix` (MatrixData): The final evaluated decision matrix.
  * `recommendation` (string): Final AI recommendation.

## Validation Rules & State Transitions

* **Creation**: A new `DecisionSession` is created with `user_id` set to the currently authenticated user's `uid` (or `"anonymous"` if no token is provided).
* **Retrieval (Single)**: When retrieving a session by `session_id`, the system MUST verify that `session.user_id == request.user_id`. If `request.user_id` is `"anonymous"`, they can only access `"anonymous"` sessions. If `request.user_id == "permanent_uid"`, they can only access `"permanent_uid"` sessions.
* **Retrieval (List)**: When listing recent sessions, the query MUST filter by `user_id == request.user_id`.
* **State Transitions**: `DecisionSession.status` continues to follow the existing state machine (`Interviewing` -> `Researching` -> `Evaluating` -> `Complete`), but all state updates enforce the same ownership check as Retrieval.

## Scale / Volume
* Multi-user capability will increase the total number of sessions. Firestore easily handles horizontal scaling.
* The queries for listing sessions require an index on `user_id` and `last_message_at` (descending). A composite index must be created in Firestore for `user_id` ASC, `last_message_at` DESC.