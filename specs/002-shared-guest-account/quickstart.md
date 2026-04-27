# Quickstart: Shared Guest Account

This feature unifies all anonymous Guest sessions into a single shared `"anonymous"` pool.

## How to Test the Shared Pool

1. Open a browser window and navigate to the application.
2. Click **"Continue as Guest"**.
3. Create a new decision and ensure it saves correctly.
4. Open a **new Incognito window** and navigate to the application.
5. Click **"Continue as Guest"**.
6. Verify that you can immediately see the decision created in step 3 in your session history.

## How to Test the Decision Limit Exemption

1. Locate the `check_user_decision_limit` function in `backend/app/services/decision_service.py`.
2. Temporarily lower the `MAX_DECISIONS_PER_USER` variable to `1` for testing.
3. Log in as a Guest and create two decisions.
4. Verify that the second decision is successfully created (because Guests are exempt from the limit).
5. Log out and log in with a registered Email or Google account.
6. Attempt to create two decisions.
7. Verify that the system blocks the creation of the second decision and returns an error (because registered users are subject to the limit).
8. **IMPORTANT**: Revert `MAX_DECISIONS_PER_USER` back to its original value after testing!
