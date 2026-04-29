# Decidely.ai

**Multi-agent decision support system powered by Google ADK**

Decidely.ai helps you make confident decisions through a structured AI-guided process — from clarifying your criteria to researching and ranking your options.

## Deployment Link

- Backend(Cloud Run): [Here](https://decidely-ai-backend-2-42922152355.us-central1.run.app)
- Frontend(Github Pages): [Here](https://withered-flowers.github.io/apps-hackathon-genai-apac/)
- Frontend(Cloud Storage): [Here](https://storage.googleapis.com/apps-hackathon-project-adk/index.html)

## Disclaimer

Decidely.ai entire infrastructure is optimized to stay within a **$5/month budget** using only free-tier resources. This means:

- **Cloud SQL is not used** — it has no free tier and would exceed the budget. The decision matrix uses an in-memory SQLite MCP server instead.
- **Cloud Run scales to zero** when idle to avoid baseline compute costs.
- **Firestore Native mode** is used for session storage (generous free tier: 1 GB storage, 50k reads/day).
- **Vertex AI** is used for Gemini models with careful token management to stay within free-tier limits.
- **GitHub Pages** hosts the frontend at zero cost.

Some production best practices (CI/CD pipelines, monitoring, persistent databases) are simplified or omitted to fit the hackathon timeline and budget constraints.

## Use Case Diagram

```mermaid
flowchart LR
    %% Styling
    classDef actor fill:#f3f4f6,stroke:#94a3b8,stroke-width:2px,color:#0f172a
    classDef usecase fill:#e0e7ff,stroke:#6366f1,stroke-width:2px,rx:20px,ry:20px,color:#312e81
    classDef boundary fill:#ffffff,stroke:#cbd5e1,stroke-width:2px,stroke-dasharray: 5 5

    %% Actor
    User((👤 <br/>End User)):::actor

    %% System Boundary
    subgraph System [Decidely.ai Platform]
        direction TB
        UC0([🔐 Authenticate / Login]):::usecase
        UC1([💬 Submit a Decision Dilemma]):::usecase
        UC1a([⚙️ Auto-classify Decision Mode]):::usecase
        UC2([🗣️ Answer Clarifying Questions]):::usecase
        UC3([👀 Monitor Live AI Swarm Status]):::usecase
        UC4([📊 Review Scored Decision Matrix]):::usecase
        UC5([📥 Download Markdown Report]):::usecase
        UC6([🕒 View Past Sessions]):::usecase
        UC8([🎟️ Redeem Voucher Code]):::usecase
    end
    class System boundary

    %% Interactions
    User --> UC0
    User --> UC1
    User --> UC2
    User --> UC3
    User --> UC4
    User --> UC5
    User --> UC6
    User --> UC8

    %% Optional dependency flow
    UC0 -.->|Enables| UC1
    UC1 -.->|Triggers| UC1a
    UC1a -.->|Contextualizes| UC3
    UC4 -.->|Enables| UC5
```

## Mock UI Layout Diagram

### Landing Page (Unauthenticated Users)

[![Landing Page](documents/assets/landing_page.png)](documents/assets/landing_page.png)

### Login Page

```mermaid
flowchart TB
    classDef panel fill:#ffffff,stroke:#e4e4e7,stroke-width:1px,rx:12px,ry:12px
    classDef btn fill:#4f46e5,stroke:#4f46e5,stroke-width:0px,color:#ffffff,rx:8px,ry:8px
    classDef input fill:#f8fafc,stroke:#e4e4e7,stroke-width:1px,rx:6px,ry:6px

    LoginPane["<b>🔐 Sign In to Decidely.ai</b><br/><br/>
    [ 📧 Continue with Email ]<br/>
    [ 🔵 Continue with Google ]<br/>
    [ 👤 Continue as Guest ]<br/><br/>
    ─────────────────────────<br/>
    New here? [ Create Account ]"]:::panel
```

### Main App (Authenticated Users)

```mermaid
flowchart TB
    classDef header fill:#fcfcf9,stroke:#e4e4e7,stroke-width:1px,color:#18181b,rx:8px,ry:8px
    classDef banner fill:#fef3c7,stroke:#fbbf24,stroke-width:1px,color:#92400e,rx:6px,ry:6px
    classDef panel fill:#ffffff,stroke:#e4e4e7,stroke-width:1px,rx:12px,ry:12px
    classDef chatUser fill:#f1f0eb,stroke:#e4e4e7,color:#18181b,rx:15px,ry:15px
    classDef chatAI fill:#ffffff,stroke-width:0px,border-left:2px solid #e4e4e7,color:#52525b,rx:0px,ry:0px
    classDef status fill:#f4f4f0,stroke:#e4e4e7,stroke-dasharray: 4 4,color:#a1a1aa,rx:8px,ry:8px
    classDef nobg fill:none,stroke:none

    NavApp["<b>🧠 Decidely.ai</b> &nbsp;&nbsp; 👤 john@example.com &nbsp; 🌗 &nbsp; 🎟️ Redeem &nbsp; 🔄 EVALUATING | Evaluator &nbsp; [ New Session ] &nbsp; [ Sign Out ]"]:::header
    RateBanner["⚠️ Guest Tier: 28 decisions remaining (expires in 4h 32m)"]:::banner

    subgraph DesktopApp ["🖥️ Main Application Layout"]
        direction LR

        subgraph LeftCol ["💬 Chat Interface (Left Column)"]
            direction TB
            M1["<b>User</b><br/>Which laptop for a CS degree under $1200?"]:::chatUser
            M2["<b>INTERVIEWER 💬</b><br/>I can help! Do you prefer MacOS or Windows?"]:::chatAI
            M3["<b>User</b><br/>MacOS, mostly for coding."]:::chatUser
            M4["<b>RESEARCHER 🔍</b><br/>Finding current options via Google Search..."]:::chatAI
            M5["<b>EVALUATOR ⚖️</b><br/>Crunching numbers..."]:::chatAI
            M6["<b>SUPPORTER 🎉</b><br/>Based on your criteria: MacBook Air M2!"]:::chatAI
            Input["Ask your question... &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ⬆️"]:::panel

            M1 ~~~ M2 ~~~ M3 ~~~ M4 ~~~ M5 ~~~ M6 ~~~ Input
        end

        subgraph RightCol ["📊 Decision Dashboard (Right Column)"]
            direction TB
            Title["<b>Matrix Evaluation</b>"]:::nobg

            Table["<b>Subject Target &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp; Price &nbsp;|&nbsp; Battery &nbsp;|&nbsp; Total Rank &nbsp;|&nbsp; Reference</b><br/>-----------------------------------------------------------------------------------------------------------------<br/><b>▌MacBook Air M2</b> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp; 8.5 &nbsp;&nbsp;&nbsp;|&nbsp; 9.0 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp; <b>8.75</b> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp; [ ↗ ]<br/>MacBook Air M3 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp; 7.0 &nbsp;&nbsp;&nbsp;|&nbsp; 9.2 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp; 8.10 &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp; [ ↗ ]"]:::panel

            Breakdown["<b>MacBook Air M2</b><br/><span style='color:#10b981'>+ Great value for students</span><br/><span style='color:#10b981'>+ Excellent battery life</span><br/><span style='color:#a1a1aa'>- Older generation chip</span>"]:::panel

            ExportSection["<b>Documentation Lifecycle</b><br/><br/>[ 📥 Download Markdown ]"]:::panel

            Title ~~~ Table ~~~ Breakdown ~~~ ExportSection
        end

        LeftCol ~~~ RightCol
    end

    NavApp --> RateBanner
    RateBanner --- DesktopApp
```

### Mobile Layout

```mermaid
flowchart TB
    classDef header fill:#fcfcf9,stroke:#e4e4e7,stroke-width:1px,color:#18181b,rx:8px,ry:8px
    classDef panel fill:#ffffff,stroke:#e4e4e7,stroke-width:1px,rx:12px,ry:12px
    classDef drawer fill:#f1f0eb,stroke:#e4e4e7,stroke-width:1px,rx:0px,ry:0px

    NavMobile["<b>🧠 Decidely.ai</b> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; [ ☰ Menu ]"]:::header

    subgraph MobileContent ["📱 Mobile View"]
        direction TB
        ChatMobile["<b>Chat</b><br/><br/>User message<br/>AI Response<br/><br/><input>Ask...</input>"]:::panel

        Drawer["<b>☰ Menu</b><br/>──────────<br/>📊 Matrix<br/>🕒 History<br/>🎟️ Redeem<br/>🌗 Theme<br/>──────────<br/>[ New Session ]<br/>[ Sign Out ]"]:::drawer
    end

    NavMobile --> MobileContent
    MobileContent --- Drawer
```

## Adaptive Decision Modes

The decision pipeline features an **Adaptive Classifier** that automatically categorizes the user's initial dilemma to optimize downstream agent behavior. The classification is locked for the duration of the session and dictates the entire swarm's approach:

1. **Purchase Mode** (`decision_type = "purchase"`)
   - **Triggered by**: Requests to buy specific products or services with personal/consumer language or price caps (e.g., *"Which laptop should I buy under $1200?"*).
   - **Agent Behavior**: The swarm focuses on finding specific, actionable, and buyable options. The Researcher identifies direct product matches, and the Evaluator ranks them based on cost and consumer features.
   - **Performance**: Optimized with a rapid 30-second execution timeout.

2. **Strategic Mode** (`decision_type = "strategic"`)
   - **Triggered by**: Organizational language, long-term impact decisions, or complex vendor evaluations (e.g., *"Should we migrate from GCP to AWS?"*).
   - **Agent Behavior**: The swarm shifts to multi-dimensional analysis. The Researcher explores distinct strategic paths, focusing on Total Cost of Ownership (TCO), risks, compliance, and vendor lock-in, rather than simple product listings.
   - **Performance**: Granted an extended 90-second execution timeout for deep research.

Additionally, the classifier determines a **Decision Domain** (`finance`, `infrastructure`, or `general`), which is injected into the prompt of every downstream agent (Interviewer, Researcher, Evaluator, Supporter) to ensure highly contextualized responses.

## Architecture

```mermaid
graph TD
    classDef userNode fill:#ede9fe,stroke:#a78bfa,color:#5b21b6,stroke-width:3px,rx:10px,ry:10px
    classDef frontendNode fill:#dbeafe,stroke:#60a5fa,color:#1e40af,stroke-width:3px,rx:10px,ry:10px
    classDef backendNode fill:#e0e7ff,stroke:#818cf8,color:#3730a3,stroke-width:3px,rx:10px,ry:10px
    classDef orchestratorNode fill:#fce7f3,stroke:#f472b6,color:#9d174d,stroke-width:3px,rx:10px,ry:10px
    classDef agentNode fill:#f1f5f9,stroke:#94a3b8,color:#475569,stroke-width:2px,rx:8px,ry:8px
    classDef storageNode fill:#d1fae5,stroke:#34d399,color:#065f46,stroke-width:3px,rx:10px,ry:10px
    classDef authNode fill:#fef3c7,stroke:#fbbf24,color:#92400e,stroke-width:3px,rx:10px,ry:10px
    classDef rateNode fill:#fee2e2,stroke:#ef4444,color:#991b1b,stroke-width:2px,rx:8px,ry:8px
    classDef exportNode fill:#fef3c7,stroke:#fbbf24,color:#92400e,stroke-width:3px,rx:10px,ry:10px

    User(["<b>👤 User</b>"]) -->|"<b>Firebase Auth</b>"| FE["<b>⚛️ React + Vite Frontend</b><br/>Firebase Auth SDK<br/>Axios + Token Interceptor"]
    FE -->|"<b>POST /api/chat<br/>Bearer Token</b>"| BE["<b>🖥️ FastAPI Backend</b>"]
    BE -->|"<b>verify token</b>"| FA["<b>🔥 Firebase Auth<br/>Admin SDK</b>"]
    BE -->|"<b>check rate limit</b>"| RL["<b>⚡ Rate Limiter</b><br/>Guest: 30/5hrs<br/>Registered: 3/2hrs<br/>Upgraded: 20/1hr"]
    BE -->|"<b>orchestrate</b>"| PA["<b>🎯 DecisionPipeline<br/>Orchestrator</b>"]

    PA -->|"<b>purchase / strategic (mode)</b>"| IA["<b>💬 Interviewer Agent</b><br/>Criteria Extraction"]
    PA -->|"<b>grounded research</b>"| RA["<b>🔍 Researcher Agent</b><br/>Google Search"]
    PA -->|"<b>weighted scoring</b>"| EA["<b>⚖️ Evaluator Agent</b><br/>Decision Matrix"]
    PA -->|"<b>final recommendation</b>"| SA["<b>🎉 Supporter Agent</b><br/>Final Report"]

    EA -.->|"<b>read/write criteria & options</b>"| MCP[("<b>🗃️ SQLite MCP<br/>Decision Matrix</b>")]
    BE -->|"<b>persist sessions</b>"| FS[("<b>📦 Firestore<br/>Session Storage</b>")]
    BE -->|"<b>generate markdown</b>"| MG["<b>📥 Markdown Generator MCP</b><br/>Session Summary + SWOT"]
    BE -->|"<b>redeem voucher</b>"| VS["<b>🎟️ Voucher Service</b><br/>DEMO → Upgraded Tier"]

    class User userNode
    class FE frontendNode
    class BE backendNode
    class FA authNode
    class RL rateNode
    class PA orchestratorNode
    class IA,RA,EA,SA agentNode
    class MCP,FS storageNode
    class MG exportNode
    class VS rateNode
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Python 3.11+, Google ADK, FastAPI, uv |
| Frontend | React 19, Vite 8, Tailwind CSS, Bun |
| AI Agents | Gemini 3.1 Flash Lite (Preview) via Google ADK (Vertex) |
| Authentication | Firebase Auth (Email/Password, Google OAuth, Anonymous) |
| Storage | Google Cloud Firestore |
| Decision Matrix | SQLite via MCP |
| Report Export | Markdown Generator MCP |
| Rate Limiting | Token bucket per user tier (Guest/Registered/Upgraded) |
| Deployment | Cloud Run (backend), GitHub Pages (frontend), Cloud Storage (frontend) |

## Prerequisites

- Python 3.11+
- Bun v1.3+
- Google Cloud Project with Firestore and Vertex AI API enabled
- Firebase project with Authentication enabled (Email/Password, Google OAuth, Anonymous)
- `gcloud auth application-default login`

## Quick Start (Development)

### Backend

```bash
cd backend
cp .env.example .env
# Edit .env — set GOOGLE_CLOUD_PROJECT
uv sync
uv run uvicorn app.api.main:app --reload
```

Server starts at <http://localhost:8000>. Docs at <http://localhost:8000/docs>.

### Frontend

```bash
cd frontend
bun install
bun run dev
```

App starts at <http://localhost:5173>.

## Usage

1. Open `http://localhost:5173`
2. Type a decision query (e.g. "Which laptop should I buy for $1000?")
3. Answer the Interviewer agent's clarifying questions
4. Watch the Researcher find current options via Google Search
5. See the Evaluator produce a weighted comparison matrix
6. Receive the Supporter's final recommendation
7. Click **Download Report as Markdown** to save your decision report

## Project Structure

```
backend/
├── app/
│   ├── agents/          # ADK Agent definitions
│   │   ├── primary.py       # DecisionPipeline orchestrator
│   │   ├── interviewer.py   # Criteria extraction
│   │   ├── researcher.py    # Google Search grounding
│   │   ├── evaluator.py     # Weighted scoring matrix
│   │   └── supporter.py     # Final recommendation
│   ├── mcp/             # MCP clients (SQLite, Markdown Generator)
│   ├── core/            # Config, Firebase Auth, Firestore, rate limiter, logging
│   ├── api/             # FastAPI routes
│   ├── models/          # Pydantic schemas & entities
│   └── services/        # Decision, report, voucher services
├── tests/
└── pyproject.toml

frontend/
├── src/
│   ├── components/      # React UI components (LandingPage, Chat, Matrix, etc.)
│   ├── context/         # AuthContext (Firebase Auth provider)
│   ├── services/        # API client with auth interceptor + SSE streaming
│   ├── App.jsx          # Root application with conditional routing
│   └── main.jsx
└── package.json
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/chat` | Send a message, advance the decision pipeline |
| `POST` | `/api/chat/stream` | Stream real-time agent status updates via SSE |
| `GET` | `/api/history/{session_id}` | Get conversation history (ownership verified) |
| `GET` | `/api/session/new` | Generate a new session ID |
| `GET` | `/api/sessions/recent` | List the 5 most recent sessions |
| `POST` | `/api/export/{session_id}` | Export report to Google Drive |
| `GET` | `/api/export/{session_id}/download` | Download report as markdown file |
| `POST` | `/api/voucher/redeem` | Redeem voucher code for upgraded tier |
| `GET` | `/api/user/status` | Get user's rate limit tier and upgrade status |
| `GET` | `/health` | Health check |

## Notes for Reviewers

- **Budget**: Targets <$5/month on Cloud Run (scale-to-zero) + Firestore free tier
- **Authentication**: Firebase Auth with email/password, Google OAuth, and anonymous guest login
- **MCP**: SQLite MCP for decision matrix storage, Markdown Generator for reports
- **ADK**: DecisionPipeline orchestrator in `app/agents/primary.py` with adaptive modes (purchase/strategic)
- **Context**: Multi-turn context maintained via session state in Firestore
- **Rate Limiting**: Token bucket per tier — Guest (30/5hrs), Registered (3/2hrs), Upgraded (20/1hr)
- **Voucher System**: DEMO code upgrades to Upgraded tier
- **FR-008**: Multiple concurrent decision threads is deferred — default `user_id` is `"anonymous"`
