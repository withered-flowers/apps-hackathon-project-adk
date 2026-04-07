# Implementation Plan: Decidely.ai Core

**Branch**: `001-decidely-ai-core` | **Date**: 2026-04-04 | **Spec**: [specs/001-decidely-ai-core/spec.md](specs/001-decidely-ai-core/spec.md)
**Input**: Feature specification from `/specs/001-decidely-ai-core/spec.md`

## Summary

Decidely.ai is a multi-agent decision support system. The core requirement is to implement an orchestrator (Supervisor Pattern) that coordinates specialized agents (Interviewer, Researcher, Evaluator, Supporter) using Google Agent Development Kit (ADK). The system will use Google Search Grounding for real-time research, SQLite MCP for structured decision matrix management, and Firestore for session persistence.

## Technical Context

**Language/Version**: Python 3.13 (Backend), React + Vite (Frontend)
**Primary Dependencies**: google-adk, FastAPI, uv (Backend); Tailwind CSS, Axios, Bun (Frontend)
**Storage**: Google Cloud Firestore (Native Mode), SQLite MCP (Structured matrices)
**Testing**: pytest (Backend), Vitest (Frontend)
**Target Platform**: Google Cloud Run (Backend), GitHub Pages (Frontend)
**Project Type**: Web application
**Performance Goals**: Scale-to-zero serverless architecture, <$5/month cost, <3s status updates
**Constraints**: strictly <$5/month, multi-agent Supervisor orchestration, Google ADK requirement
**Scale/Scope**: Hackathon MVP (~50 concurrent users, single-active sessions)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Justification |
|------|--------|---------------|
| I. Code Verbosity & Clarity | ✅ | Descriptive naming and docstrings will be mandatory in all Python/React files. |
| II. User Experience Consistency | ✅ | Tailwind CSS will be used with a central theme config for unified styling. |
| III. Requirement-Driven Prototyping | ✅ | Core focus is functional ADK/MCP integration for the MVP. |

## Project Structure

### Documentation (this feature)

```text
specs/001-decidely-ai-core/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── agents/          # ADK Agent definitions
│   ├── mcp/             # MCP clients
│   ├── core/            # Config/Firestore
│   ├── api/             # FastAPI routes
│   └── models/          # Pydantic schemas
├── Dockerfile
└── pyproject.toml

frontend/
├── src/            # Vite + React app code
│   ├── components/      # React components
│   ├── services/        # API logic
│   └── App.jsx
├── package.json
└── vite.config.js
```

**Structure Decision**: Option 2: Web application (frontend/ + backend/) as per hackathon folder-structure requirements.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | | |
