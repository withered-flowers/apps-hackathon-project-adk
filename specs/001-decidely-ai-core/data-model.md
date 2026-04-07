# Data Model: Decidely.ai Core

## 1. DecisionSession (Firestore Collection: `sessions`)

- **session_id**: (str, PK) Unique identifier for the decision journey.
- **user_id**: (str) Identifier for the user (default 'anonymous' for hackathon).
- **status**: (str) Current state (Interviewing, Researching, Evaluating, Complete).
- **last_message_at**: (datetime) Timestamp of the last interaction.
- **transcript**: (List[Message]) Full chat history.

## 2. DecisionCriteria (SQLite Table: `criteria` / Firestore Sub-collection)

- **criterion_id**: (str, PK) Unique identifier.
- **session_id**: (str, FK) Link to session.
- **name**: (str) e.g., "Budget", "Battery Life".
- **weight**: (float) Importance score (0.0 to 1.0).
- **value**: (str) User-specified preference/constraint.

## 3. Option (SQLite Table: `options` / Firestore: `decisions` collection)

- **option_id**: (str, PK) Unique identifier.
- **session_id**: (str, FK) Link to session.
- **title**: (str) e.g., "MacBook Air M3".
- **description**: (str) Summary of features.
- **score**: (float) Final weighted score from Evaluator.
- **pros**: (List[str]) Key advantages.
- **cons**: (List[str]) Key disadvantages.
- **url**: (str) Source link from Researcher grounding.

## 4. Report (Generated Artifact)

- **summary**: (str) Final recommendation text.
- **matrix_data**: (JSON) The structured comparison matrix for UI rendering.
