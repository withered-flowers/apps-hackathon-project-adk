# Research: Decidely.ai Core

## 1. Decision Matrix Tooling (SQLite MCP)

**Decision**: Use SQLite MCP for all structured comparison and scoring operations.
**Rationale**: To fulfill the hackathon requirement for MCP, SQLite provides a reliable way to store temporary structured data that agents can query to weigh pros/cons objectively. It ensures the "Evaluator" agent works on concrete data rather than just vague text.
**Alternatives**: 
- *Python In-Memory Lists*: Rejected because they don't fulfill the MCP requirement and are harder for LLMs to query complexly.
- *Cloud SQL (MySQL/PostgreSQL)*: Rejected because of the $5/month budget constraint; too expensive for an MVP.

## 2. Real-Time Research Strategy (Google Search Grounding)

**Decision**: Leverage Gemini's built-in Google Search Grounding tool via Google ADK.
**Rationale**: Provides the most up-to-date information on laptop models, travel destinations, etc., without additional cost or API keys. ADK integrates this tool natively into agents.
**Alternatives**: 
- *SerpAPI/Custom Crawlers*: Rejected because of complexity and potential cost.

## 3. Session Persistence & Context (Firestore)

**Decision**: Use Google Cloud Firestore (Native Mode) for session and matrix persistence.
**Rationale**: Firestore's free tier is generous and perfectly suited for saving chat histories and JSON representations of the SQLite matrices. It fits the "scale-to-zero" and budget requirements.
**Alternatives**: 
- *Local Storage / SQLite File*: Rejected because Cloud Run is stateless; persistent storage is required across multiple requests.

## 4. Multi-Agent Orchestration (Supervisor Pattern)

**Decision**: Implement the Supervisor Pattern using Google ADK's routing logic.
**Rationale**: ADK is specifically designed for this. The Primary agent acts as the supervisor, delegating to specialists (Interviewer, Researcher, etc.) and synthesizing the final answer.
**Alternatives**: 
- *Manual LangChain/LlamaIndex Routing*: Rejected because ADK is the preferred framework for this project's requirements.

## 5. Development Workflow & Package Management

**Decision**: Use `uv` for Python and `Bun` for React.
**Rationale**: Both provide significant speed advantages during development (important for hackathons) and reliable dependency resolution.
