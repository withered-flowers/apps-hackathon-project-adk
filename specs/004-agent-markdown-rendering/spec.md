# Feature Specification: Agent Markdown Rendering & Strategic Decision Output

**Feature Branch**: `004-agent-markdown-rendering`
**Created**: 2026-04-28
**Status**: Draft
**Input**: User description: "Create a new specs: (1) For the Output from agent must be rendered markdown, currently there's still text in single asterisk or double asterisks. this must be rendered to italic or bold. (2) For the SupporterAgent — generates the final recommendation summary. Supports dual-mode behavior (T019): - "purchase" mode: Produces a warm, conversational 3-4 paragraph summary that celebrates the user, presents the top pick, explains why it scored highest, and encourages action. - "strategic" mode: Generates a structured, stakeholder-ready report with sections for Executive Summary, Full Option Comparison table, Risk Analysis, and Recommendation with detailed justification. If the decision type is strategic, the final result of the summary and the recommendation & justification must be solving the question and giving final decision based on the given output (remember, this apps is called decidely.ai specially for this decision making.)"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Markdown Rendering in Agent Output (Priority: P1)

As a user reviewing agent-generated recommendations, I want text formatting (italics and bold) to be properly rendered so that I can easily read emphasis and key points in the output.

**Why this priority**: This is a core readability requirement - agents generate content with markdown formatting, but users see raw asterisks instead of styled text.

**Independent Test**: Can be fully tested by triggering any agent that returns formatted text and verifying the output displays italic text for single asterisks and bold text for double asterisks.

**Acceptance Scenarios**:

1. **Given** an agent generates output containing `*italic text*`, **When** the output is displayed to the user, **Then** the text appears in italic style (not with asterisks visible)
2. **Given** an agent generates output containing `**bold text**`, **When** the output is displayed to the user, **Then** the text appears in bold style (not with asterisks visible)
3. **Given** an agent generates output containing mixed `*italic*` and `**bold**` text, **When** the output is displayed, **Then** both styles render correctly independently
4. **Given** an agent generates output without any markdown formatting, **When** displayed, **Then** the text appears normally without any changes

---

### User Story 2 - Strategic Mode Final Decision Clarity (Priority: P1)

As a user receiving a strategic decision report, I want the recommendation section to explicitly state the final decision and show how it solves my original decision question, so I can confidently take action.

**Why this priority**: Decidely.ai's core purpose is decision-making. Strategic mode stakeholders need crystal-clear conclusions, not just analysis.

**Independent Test**: Can be fully tested by providing a strategic decision scenario and verifying the Executive Summary and Recommendation sections state a clear final decision.

**Acceptance Scenarios**:

1. **Given** a strategic decision with multiple evaluated options, **When** the SupporterAgent generates the report, **Then** the Executive Summary clearly states which option is recommended
2. **Given** a strategic decision with multiple evaluated options, **When** the SupporterAgent generates the report, **Then** the Recommendation section explicitly names the chosen option and explains how it addresses the original decision question
3. **Given** a strategic decision, **When** the SupporterAgent generates the report, **Then** the Recommendation section provides specific next steps that are actionable

---

### User Story 3 - Purchase Mode Celebratory Output (Priority: P2)

As a user in purchase mode, I want a warm, encouraging summary that celebrates my decision process and clearly presents the top recommendation.

**Why this priority**: Purchase decisions are personal; the tone should be supportive and action-oriented.

**Independent Test**: Can be tested by providing a purchase-type decision and verifying the output is 3-4 paragraphs, warm in tone, and includes a clear top recommendation.

**Acceptance Scenarios**:

1. **Given** a purchase decision completed, **When** the SupporterAgent generates purchase-mode output, **Then** the output is 3-4 short paragraphs
2. **Given** a purchase decision completed, **When** the SupporterAgent generates purchase-mode output, **Then** it celebrates the user for completing the process
3. **Given** a purchase decision completed, **When** the SupporterAgent generates purchase-mode output, **Then** it clearly presents the top recommendation
4. **Given** a purchase decision completed, **When** the SupporterAgent generates purchase-mode output, **Then** it references 2-3 key criteria that drove the recommendation
5. **Given** a purchase decision completed, **When** the SupporterAgent generates purchase-mode output, **Then** it acknowledges one trade-off (con) worth mentioning
6. **Given** a purchase decision completed, **When** the SupporterAgent generates purchase-mode output, **Then** it ends with an encouraging closing line including "Feel free to ask me anything else about your decision! 🎯"

---

### User Story 4 - Strategic Mode Report Structure (Priority: P2)

As a strategic stakeholder, I want a structured report with clearly delineated sections so I can quickly find the information I need for stakeholder review.

**Why this priority**: Strategic reports serve as stakeholder communication tools; structure enables efficient review.

**Independent Test**: Can be tested by generating a strategic report and verifying all required sections are present.

**Acceptance Scenarios**:

1. **Given** a strategic decision, **When** the SupporterAgent generates strategic-mode output, **Then** it includes an Executive Summary section (2-3 sentences)
2. **Given** a strategic decision, **When** the SupporterAgent generates strategic-mode output, **Then** it includes a Full Option Comparison section with a markdown table
3. **Given** a strategic decision, **When** the SupporterAgent generates strategic-mode output, **Then** the comparison table includes weighted scores across criteria
4. **Given** a strategic decision, **When** the SupporterAgent generates strategic-mode output, **Then** it includes a Risk Analysis section with 1-2 risks per option
5. **Given** a strategic decision, **When** the SupporterAgent generates strategic-mode output, **Then** it includes a Recommendation & Justification section with detailed explanation

---

### Edge Cases

- What happens when agent output contains nested markdown (e.g., `***text***` or `**text *with* emphasis**`)?
- How does system handle markdown within code blocks or escaped characters?
- What happens when the comparison matrix is empty or has only one option?
- How does system handle when weighted scores are unavailable or incomplete?
- What happens when the user's original decision question is ambiguous or unclear?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST parse and render single-asterisk text (`*text*`) as italic in all agent outputs
- **FR-002**: System MUST parse and render double-asterisk text (`**text**`) as bold in all agent outputs
- **FR-003**: System MUST preserve the original meaning when multiple formatting marks are adjacent
- **FR-004**: System MUST NOT render markdown characters when they appear in code blocks or are escaped
- **FR-005**: SupporterAgent in strategic mode MUST state the final decision clearly in Executive Summary
- **FR-006**: SupporterAgent in strategic mode MUST explain in Recommendation how the chosen option solves the original decision question
- **FR-007**: SupporterAgent in strategic mode MUST provide concrete next steps in Recommendation section
- **FR-008**: SupporterAgent in purchase mode MUST output 3-4 short paragraphs
- **FR-009**: SupporterAgent in purchase mode MUST end with "Feel free to ask me anything else about your decision! 🎯"
- **FR-010**: SupporterAgent MUST NOT output JSON — all outputs must be natural prose or markdown
- **FR-011**: SupporterAgent MUST NOT make up data not provided in the evaluation context

### Key Entities *(include if feature involves data)*

- **AgentOutput**: Represents the final output generated by any agent, including formatted text content
- **SupporterReport**: The structured output from SupporterAgent containing sections (Executive Summary, Comparison, Risk Analysis, Recommendation)
- **DecisionContext**: Contains the original decision question, criteria, options, and evaluation matrix
- **MarkdownContent**: Text content that may contain formatting markup requiring rendering

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users see italic styling (not asterisks) for `*text*` in agent outputs 100% of the time
- **SC-002**: Users see bold styling (not asterisks) for `**text**` in agent outputs 100% of the time
- **SC-003**: Strategic mode reports contain all four required sections (Executive Summary, Comparison Table, Risk Analysis, Recommendation) in 100% of generations
- **SC-004**: Strategic mode Recommendation section explicitly names the recommended option and explains its fit to the decision question in 100% of generations
- **SC-005**: Purchase mode outputs are between 3-4 paragraphs in 100% of generations
- **SC-006**: Users can identify the final decision from strategic mode Executive Summary without reading the full report (testable via user comprehension survey)

## Assumptions

- Existing agent output generation pipeline can be modified to post-process markdown before display
- Frontend or rendering layer has capability to apply CSS styling for italic and bold text
- The evaluation matrix always contains at least one option to recommend
- Weighted scores are available from the Evaluator agent output
- The original user decision question is preserved and passed to the SupporterAgent
- Markdown rendering is applied at display time, not stored in database