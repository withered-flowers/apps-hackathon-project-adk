<!--
Sync Impact Report:
- Version change: N/A → 1.0.0
- List of modified principles:
  - [PRINCIPLE_1_NAME] → I. Code Verbosity & Clarity
  - [PRINCIPLE_2_NAME] → II. User Experience Consistency
  - [PRINCIPLE_3_NAME] → III. Requirement-Driven Prototyping
- Added sections: Technology Stack & Standards, Development Workflow
- Removed sections: N/A
- Templates requiring updates (✅ updated / ⚠ pending):
  - .specify/templates/plan-template.md (✅ aligned)
  - .specify/templates/spec-template.md (✅ aligned)
  - .specify/templates/tasks-template.md (✅ aligned)
- Follow-up TODOs: None.
-->

# apps-hackathon-genai-apac Constitution

## Core Principles

### I. Code Verbosity & Clarity
Code must be verbose enough that anyone reading it understands its intent and logic immediately. Use descriptive naming conventions for variables, functions, and classes. Documentation should be embedded within the code to explain complex logic, ensuring that the "why" is as clear as the "how".

### II. User Experience Consistency
The user interface and overall experience must remain consistent across all modules of the application. Adherence to a unified design language is mandatory to ensure a seamless transition for users between different features. Consistency applies to layout, typography, color schemes, and interaction patterns.

### III. Requirement-Driven Prototyping
Development focus is on building functional prototypes that strictly adhere to specified requirements. Every feature implemented must have a direct correlation to a requirement. Prototyping should prioritize core functionality to validate the product concept quickly before deep technical refinement.

## Technology Stack & Standards
The project utilizes a modern GenAI-focused stack optimized for rapid prototyping. All components must be built using TypeScript/Node.js for the backend and React for the frontend (unless otherwise specified). APIs should follow RESTful or GraphQL standards as appropriate for the data complexity.

## Development Workflow
An iterative development workflow is enforced. Each iteration involves research, design, implementation, and validation phases. Automated testing (unit and integration) is required for all new features to ensure reliability during the rapid prototyping phase.

## Governance
The Constitution is the supreme guidance for project development. Any deviations must be justified and documented. Amendments to the Constitution require a version bump and a Sync Impact Report. All pull requests must be reviewed for compliance with these principles.

**Version**: 1.0.0 | **Ratified**: 2026-04-04 | **Last Amended**: 2026-04-04
