# Quickstart: Multi-User Isolation

**Date**: 2026-04-26
**Feature**: 001-multi-user-isolation

This feature implements strict multi-user isolation on top of the existing Decidely.ai decision system.

## Setup Requirements

1. **Firebase Project**: You must have a Firebase project created with Authentication enabled.
2. **Auth Providers**: Enable "Email/Password", "Google" (OAuth), and "Anonymous" (Guest) sign-in methods in the Firebase Console.
3. **Backend Service Account**: Download the Firebase Admin SDK service account JSON and set the `FIREBASE_CREDENTIALS_PATH` (or default `GOOGLE_APPLICATION_CREDENTIALS`) in your backend `.env`.
4. **Frontend Config**: Add the Firebase project config (`apiKey`, `authDomain`, `projectId`, etc.) to your frontend `.env.local`.

## Backend Updates
* Add `firebase-admin` to `backend/pyproject.toml` dependencies.
* Create `backend/app/core/auth.py` for token verification via FastAPI `Depends()`.
* Update `DecisionSession` entity to use `user_id` and ensure legacy queries filter by it.

## Frontend Updates
* Add `firebase` to `frontend/package.json`.
* Create `frontend/src/context/AuthContext.jsx`.
* Update Axios interceptors to add the `Authorization` header.
* Add a login UI component (`frontend/src/components/Login.jsx`) supporting Email, Google, and Guest.

## Usage
Start the backend and frontend:
```bash
# Backend
cd backend
uv sync
uv run uvicorn app.api.main:app --reload

# Frontend
cd frontend
bun install
bun run dev
```