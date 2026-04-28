# Feature Specification: Adaptive Decision Modes

**Feature Branch**: `003-003-adaptive-decision-modes`  
**Created**: 2026-04-28  
**Status**: Draft  
**Input**: User description: "Modify how the agent works to distinguish between purchase decisions and strategic/important decisions, adapting the entire pipeline (interview, research, evaluation, presentation) based on decision type."

## Clarifications

### Session 2026-04-28

- Q: What signals does the system use to classify a decision as "purchase" vs "strategic"? → A: Pure LLM free-form reasoning — the agent uses open-ended contextual understanding of the user's first message with no fixed keyword rules or predefined signal list.
- Q: For strategic decisions, are the dynamically generated criteria shown to the user before questions begin? → A: Yes — criteria are surfaced briefly upfront (e.g., "For this decision I'll explore: X, Y, Z. Let's start…") so the user has visibility and early correction is possible, then questions proceed immediately without requiring explicit user approval.
- Q: What happens when a user reveals mid-interview that their question is a different decision type than initially classified? → A: Classification is locked at first message — the decision type is fixed and never changes during a session; the current interview mode absorbs any newly revealed context naturally without reclassification or restart.
- Q: What is the maximum number of questions the Interviewer may ask for a strategic decision? → A: Hard cap of 7 questions — regardless of decision complexity, the strategic Interviewer MUST NOT exceed 7 criteria questions per session.
- Q: What is the expected end-to-end completion time for each decision mode? → A: Differentiated targets — purchase mode must complete within 30 seconds; strategic mode must complete within 90 seconds; both must surface a result or a graceful error within those windows.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Purchase Decision Flow (Priority: P1)

A user asks Decidely.ai to help them decide which product to buy (e.g., "Which laptop should I buy?", "Best noise-canceling headphones under $300"). The system classifies this as a **purchase decision** and follows the existing lightweight pipeline: gathers Budget, Use-Case, and Preferences through 3 fixed interview questions, searches for product options, scores them with the current weighted matrix (Budget/Use-Case/Preferences), and presents a warm, concise recommendation.

**Why this priority**: Purchase decisions are the existing, proven use case. Maintaining backward compatibility is critical — the current user experience must not regress.

**Independent Test**: Can be fully tested by asking any product-buying question and verifying the system uses the 3-criteria interview, standard product search, weighted scoring matrix, and concise supporter output.

**Acceptance Scenarios**:

1. **Given** a user asks "Which laptop should I buy for gaming under $1500?", **When** the system classifies the question, **Then** it is identified as a "purchase" decision type
2. **Given** a purchase decision is classified, **When** the Interviewer engages, **Then** it asks exactly 3 questions (Budget, Use-Case, Preferences) as it does today
3. **Given** criteria are gathered for a purchase decision, **When** the Researcher runs, **Then** it searches for 3-5 product options matching the criteria
4. **Given** research is complete for a purchase decision, **When** the Evaluator scores, **Then** it uses the existing weighted matrix (Budget, Use-Case, Preferences with standard weights)
5. **Given** evaluation is complete for a purchase decision, **When** the Supporter presents results, **Then** it uses the current warm, concise 3-4 paragraph style

---

### User Story 2 - Strategic Business Decision Flow (Priority: P1)

A user asks Decidely.ai to help with a significant business or financial decision (e.g., "Should we migrate to AWS or GCP?", "Which SaaS vendor should we contract for our CRM?", "Should we expand to the EU market?"). The system classifies this as a **strategic decision** and adapts the entire pipeline: dynamically generates relevant criteria (which may range from 3 to N questions), performs deep multi-angle research, applies domain-appropriate evaluation matrices (e.g., ROI/NPV, Strategic Fit, Ease of Execution, Risk Mitigation for financial decisions; or Technical Fit, Scalability, Vendor Lock-in, Compliance for infrastructure decisions), and presents a detailed, stakeholder-ready report.

**Why this priority**: This is the core new capability — the entire feature request is about enabling richer, more thorough decision support for non-purchase decisions.

**Independent Test**: Can be fully tested by asking a business decision question and verifying the system uses dynamic interview criteria, thorough research, domain-specific evaluation matrix, and a detailed stakeholder report.

**Acceptance Scenarios**:

1. **Given** a user asks "Should we migrate our infrastructure to AWS or stay with GCP?", **When** the system classifies the question, **Then** it is identified as a "strategic" decision type
2. **Given** a strategic decision is classified, **When** the Interviewer engages, **Then** it briefly surfaces the generated criteria categories to the user (e.g., "For this decision I'll explore: Budget, Strategic Fit, Technical Complexity, Risk. Let's start…") before asking questions — no explicit approval required, questions proceed immediately
3. **Given** criteria are gathered for a strategic infrastructure decision, **When** the Researcher runs, **Then** it performs thorough, multi-faceted research covering multiple dimensions (cost analysis, vendor capabilities, ecosystem, migration complexity, etc.)
4. **Given** research is complete for a financial/business strategic decision, **When** the Evaluator scores, **Then** it uses a finance-oriented matrix (ROI/NPV, Strategic Fit, Ease of Execution, Risk Mitigation)
5. **Given** research is complete for a non-financial strategic decision (e.g., infrastructure), **When** the Evaluator scores, **Then** it selects an appropriate domain-specific matrix (e.g., Technical Fit, Scalability, Vendor Lock-in, Compliance)
6. **Given** evaluation is complete for a strategic decision, **When** the Supporter presents results, **Then** it generates a detailed stakeholder-ready report with executive summary, full comparison, risk analysis, and clear recommendation with justification

---

### User Story 3 - Ambiguous Decision Classification (Priority: P2)

A user asks a question that could be either a purchase or strategic decision (e.g., "We need to pick a new project management tool for the team"). The system makes its best classification based on contextual signals (scale, budget mentions, organizational language) and proceeds accordingly. If misclassified, the adaptive interview process still gathers relevant information.

**Why this priority**: Handles the gray area between decision types gracefully, ensuring no user gets stuck or receives an inappropriate experience.

**Independent Test**: Can be tested by asking borderline questions and verifying the system makes a reasonable classification and delivers a coherent end-to-end experience regardless.

**Acceptance Scenarios**:

1. **Given** a user asks "We need to pick a new project management tool for the team", **When** the system classifies, **Then** it selects the most appropriate decision type based on context signals
2. **Given** an ambiguous question is classified, **When** the pipeline runs, **Then** the entire flow is consistent with the chosen decision type (interview depth, research breadth, evaluation matrix, and output format all match)

---

### Edge Cases

- What happens when a user changes their mind mid-interview (e.g., starts with a purchase question then reveals it's actually a strategic vendor selection)? → Classification is locked at the first message; the current interview mode absorbs newly revealed context naturally without reclassification or session restart.
- How does the system handle a decision that spans both purchase and strategic domains (e.g., "Should we buy 500 licenses of Tool A or Tool B for the company?")?
- What happens when the dynamic criteria generation for strategic decisions produces too many questions (user fatigue)? → Resolved by a hard cap of 7 questions; the Interviewer selects the 7 highest-impact criteria if more than 7 are generated.
- How does the system handle follow-up questions after a strategic decision is complete?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST classify the user's initial question into one of two decision types: "purchase" (buying a product/service) or "strategic" (important decision without direct purchasing, or complex organizational purchasing); classification is performed via pure LLM free-form reasoning applied to the full context of the first user message — no keyword lists or fixed signal rules are used
- **FR-002**: System MUST perform the classification before beginning the interview phase, using the user's first question as the sole input to the LLM classifier
- **FR-003**: For purchase decisions, the Interviewer MUST use the existing 3 fixed criteria (Budget, Use-Case, Preferences) with the current weights
- **FR-004**: For strategic decisions, the Interviewer MUST first analyze the decision domain, dynamically generate relevant criteria categories, and briefly surface those categories to the user (e.g., "For this decision I'll explore: X, Y, Z. Let's start…") before asking questions — no explicit user approval of the criteria list is required
- **FR-005**: For strategic decisions, the Interviewer MUST ask between 3 and 7 questions (hard cap of 7), with each question targeting one of the dynamically generated criteria; the number of questions is determined by decision complexity up to the cap
- **FR-006**: For purchase decisions, the Researcher MUST search for 3-5 product options matching the criteria (current behavior)
- **FR-007**: For strategic decisions, the Researcher MUST perform thorough, multi-dimensional research covering multiple aspects of each option (cost, capability, risks, ecosystem, etc.)
- **FR-008**: For purchase decisions, the Evaluator MUST use the current weighted scoring matrix (1-10 per criterion, weighted sum)
- **FR-009**: For strategic decisions involving financial/business outcomes, the Evaluator MUST use a finance-oriented matrix including ROI/NPV, Strategic Fit, Ease of Execution, and Risk Mitigation as evaluation dimensions
- **FR-010**: For strategic decisions involving non-financial domains (infrastructure, technology, etc.), the Evaluator MUST select and apply a domain-appropriate evaluation matrix (e.g., Technical Fit, Scalability, Vendor Lock-in, Compliance)
- **FR-011**: For purchase decisions, the Supporter MUST present results in the current warm, concise conversational format (3-4 paragraphs)
- **FR-012**: For strategic decisions, the Supporter MUST present results in a detailed, structured stakeholder-ready format including executive summary, full option comparison, risk analysis, and recommendation with justification
- **FR-013**: The decision type classification MUST be stored in the session data and accessible to all downstream agents in the pipeline
- **FR-014**: The pipeline orchestration MUST pass the decision type context to each agent so they can adapt their behavior accordingly
- **FR-015**: The decision type MUST be immutable once set at the classification step — it cannot be changed or overridden by any subsequent agent or user input within the same session
- **FR-016**: The full pipeline auto-chain (Research → Evaluate → Support) MUST complete within 30 seconds for purchase mode and within 90 seconds for strategic mode; if the deadline is exceeded, the system MUST surface a graceful error rather than leaving the user with a silent stuck state

### Key Entities

- **Decision Type**: The classification of a user's question — either "purchase" or "strategic". Determines which behavioral mode each agent uses throughout the pipeline.
- **Dynamic Criteria**: For strategic decisions, the set of criteria generated by analyzing the decision domain. Each criterion has a name, description, and weight. The number of criteria varies based on decision complexity.
- **Evaluation Matrix**: The scoring framework used by the Evaluator. For purchase decisions, this is the fixed Budget/Use-Case/Preferences matrix. For strategic decisions, this is a domain-specific matrix (finance-oriented or domain-specific) with specialized dimensions.
- **Session Data**: The persistent state object that flows through the pipeline, now extended with `decision_type` and any domain-specific metadata.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users asking purchase questions experience the same flow and response quality as the current system (zero regression)
- **SC-002**: Users asking strategic business questions receive dynamically generated criteria that are relevant to their specific decision domain in 90%+ of cases
- **SC-003**: Strategic decision evaluations use domain-appropriate matrices (finance vs. infrastructure vs. general) correctly in 90%+ of classifications
- **SC-004**: Strategic decision outputs are detailed enough that a stakeholder could make an informed decision based solely on the report
- **SC-005**: Decision type classification correctly identifies purchase vs. strategic decisions in 90%+ of cases
- **SC-006**: The end-to-end pipeline completes successfully for both decision types without errors or stuck states
- **SC-007**: Purchase mode pipeline (Research → Evaluate → Support auto-chain) completes and delivers a result to the user within 30 seconds
- **SC-008**: Strategic mode pipeline (Research → Evaluate → Support auto-chain) completes and delivers a result to the user within 90 seconds; if completion is not possible within 90 seconds, a graceful error or partial result is surfaced

## Assumptions

- The existing multi-agent pipeline architecture (Interviewer → Researcher → Evaluator → Supporter) is preserved; changes are behavioral adaptations within each agent, not structural pipeline changes
- The Google ADK LLM agent framework supports the needed prompt variations without architectural changes (i.e., agents can receive decision-type context via their input prompts)
- The decision type classification is performed via pure LLM free-form reasoning on the user's first question alone — no separate classification model, keyword list, or signal rules are needed; classification accuracy is expected to meet or exceed 90% for unambiguous questions
- Dynamic criteria generation for strategic decisions is handled by the Interviewer agent itself via enhanced prompting, not by a separate agent
- The number of dynamic criteria for strategic decisions is hard-capped at 7 questions per session; if more than 7 criteria are generated, the Interviewer selects the 7 highest-impact ones
- The existing session data structure in the pipeline can be extended with a `decision_type` field without breaking existing functionality
- Follow-up questions after completion use the same Supporter mode (concise for purchase, detailed for strategic)
