# Feature Specification: Decidely.ai Core

**Feature Branch**: `001-decidely-ai-core`  
**Created**: 2026-04-04  
**Status**: Draft  
**Input**: User description: "see the @initials/01.requirements.md, this file is is for the specification of the apps that I want to create."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Structured Decision Support (Priority: P1)

As a user overwhelmed by options (e.g., buying a laptop), I want an AI board of advisors to guide me through a structured decision process so that I can make a confident choice without analysis paralysis.

**Why this priority**: This is the core value proposition of Decidely.ai. Without a structured process, the app is just a generic chatbot.

**Independent Test**: Can be tested by initiating a decision query (e.g., "Which laptop should I buy?") and verifying that the system asks clarifying questions, researches options, and presents a structured comparison matrix.

**Acceptance Scenarios**:

1. **Given** a vague user query about a purchase decision, **When** the Primary Agent receives it, **Then** it must route the task to the Interviewer agent to ask for specific criteria (budget, preferences).
2. **Given** criteria provided by the user, **When** the Researcher agent gathers data, **Then** it must use Google Search Grounding to find up-to-date options.
3. **Given** researched options and criteria, **When** the Evaluator agent processes them, **Then** it must generate a structured pro/con matrix using SQLite MCP to store and score options.
4. **Given** a completed analysis, **When** the Primary Agent presents the result, **Then** it must include a specific recommendation and encouraging feedback from the Supporter agent.

---

### User Story 2 - Knowledge Export (Priority: P2)

As a user who has reached a decision, I want to save the structured report of my decision process to my Google Drive so that I can refer to it later or share it with others.

**Why this priority**: Enhances the utility of the decision-making process by providing a permanent record.

**Independent Test**: Can be tested by reaching a decision and then asking the agent to "Save this report," verifying that a document is created in the user's Google Drive.

**Acceptance Scenarios**:

1. **Given** a completed decision history, **When** the user requests to save the report, **Then** the system must format the history into a structured document and use Google Drive MCP to export it.

---

### Edge Cases

- **No options found**: What happens if the Researcher cannot find any options matching the user's criteria? (System should inform the user and suggest adjusting criteria).
- **Conflicting criteria**: How does the Evaluator handle criteria that are mutually exclusive? (e.g., "Cheapest laptop" vs "Highest performance" with no overlap).
- **Search failure**: Handling API timeouts or grounding errors during research phase.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST implement a Supervisor Pattern using Google ADK to route tasks between Primary and Sub-agents.
- **FR-002**: The Primary Agent MUST maintain conversational context across multiple turns.
- **FR-003**: The Interviewer Agent MUST extract at least three core criteria (e.g., Budget, Timeline, Features) before proceeding to research.
- **FR-004**: The Researcher Agent MUST use Google Search Grounding to fetch current market data.
- **FR-005**: The Evaluator Agent MUST use SQLite MCP to create a dynamic decision matrix table for every session.
- **FR-006**: The system MUST store session history and structured decision data in Google Cloud Firestore.
- **FR-007**: The frontend MUST provide a responsive interface using Vite + React for user interaction.
- **FR-008**: [NEEDS CLARIFICATION: Should the system support multiple concurrent decision threads for the same user?]

### Key Entities *(include if feature involves data)*

- **DecisionSession**: Represents a unique decision-making journey (user ID, criteria, options, status).
- **DecisionCriteria**: Key parameters defined by the user (name, weight, value).
- **Option**: A potential choice researched by the system (title, description, score, pros/cons).
- **Report**: The finalized structured output (summary, matrix, recommendation).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can reach a final recommendation in under 10 conversational turns for standard purchase decisions.
- **SC-002**: The system must handle up to 50 concurrent users within the $5/month budget constraint on Google Cloud Run.
- **SC-003**: 90% of user-provided criteria are successfully extracted and utilized in the SQLite decision matrix.
- **SC-004**: Exported reports are available in Google Drive within 5 seconds of the user's request.

## Assumptions

- **Stable ADK**: Assumes Google Agent Development Kit provides the necessary dynamic routing capabilities out of the box.
- **Free Tier Eligibility**: Assumes current usage patterns stay within the Google Cloud and Firestore free tiers to meet the $5 budget goal.
- **Search Grounding Quality**: Assumes Gemini's Google Search Grounding provides sufficiently structured data for the Evaluator to parse.
- **MCP Availability**: Assumes standard SQLite and Google Drive MCP servers are accessible in the target environment.
