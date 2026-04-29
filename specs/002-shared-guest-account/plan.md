# Implementation Plan: Shared Guest Account

**Branch**: `002-shared-guest-account` | **Date**: 2026-04-27 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-shared-guest-account/spec.md`

**Note**: This template is filled in by the `/speckit-plan` workflow.

## Summary

Modify the application to ensure all anonymous Guest sessions are routed to a single, shared system identity (`"anonymous"`). This unifies the guest experience into a shared public pool, maintaining backward compatibility with legacy decisions while enforcing strict data isolation for permanently registered users. The 50-decision limit will also be bypassed for this shared account to avoid blocking collaborative usage.

## Technical Context

**Language/Version**: Python 3.11+ (Backend), JavaScript/TypeScript (Frontend)
**Primary Dependencies**: FastAPI, google-cloud-firestore, React, Vite, Firebase
**Storage**: Google Cloud Firestore (sessions collection)
**Testing**: pytest (Backend), npm test/eslint (Frontend)
**Target Platform**: Web (Browser) + Cloud Run (Backend)
**Project Type**: web-application
**Performance Goals**: Session retrieval < 2 seconds
**Constraints**: Do not create breaking changes on the backend API.
**Scale/Scope**: Arbitrary number of simultaneous guests creating decisions collectively under one ID.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- **Tech Stack Deviation**: The project uses Python 3.11+ for the backend, invoking the "unless otherwise specified" clause of the Constitution (III. Technology Stack) due to the constraints of the existing legacy Python codebase.
- No explicit constitution violations detected.

## Project Structure

### Documentation (this feature)

```text
specs/002-shared-guest-account/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
backend/
├── app/
│   ├── core/
│   │   └── auth.py             # Modified: Map anonymous tokens to "anonymous" ID
│   └── services/
│       └── decision_service.py # Modified: Exempt "anonymous" from the 50-decision limit
└── tests/
    └── test_multi_user_isolation.py # Modified: Update tests for shared guest behavior

frontend/
├── src/
│   └── context/
│       └── AuthContext.jsx     # Modified: Expose guest state explicitly for UI updates
└── tests/
```

**Structure Decision**: Web application separated into backend and frontend directories, adhering to existing patterns.
