# Data Model: Shared Guest Account

## Entities

### `DecisionSession`

This entity represents a user's interactions and decisions. It is stored in Google Cloud Firestore in the `sessions` collection.

**Modified Field Behavior**:
- `user_id` (string): For permanently registered users, this remains their unique Firebase UID. For Guest users, the backend will forcibly override this value to the static string `"anonymous"` prior to saving, ensuring all guest decisions are grouped under a single shared identifier.
