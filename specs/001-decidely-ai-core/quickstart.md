# Quickstart: Decidely.ai Core

## 1. Prerequisites

- **Python 3.13** (installed via `uv`)
- **Node.js 20+** (installed via `Bun`)
- **Google Cloud Platform** (GCP) Project with Firestore and Vertex AI enabled.
- **Application Default Credentials (ADC)** configured: `gcloud auth application-default login`.

## 2. Backend Setup

```bash
cd backend
uv venv --python=3.13
source .venv/bin/activate
uv sync
# Set GOOGLE_CLOUD_PROJECT environment variable
uv run adk api_server
```

## 3. Frontend Setup

```bash
cd frontend
bun install
bun run dev
```

## 4. Verification

1. Open `http://localhost:5173` in your browser.
2. Type "I need to buy a laptop for $1000".
3. Observe the orchestrator routing to the Interviewer agent.
