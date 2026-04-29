# Implementation Plan: Agent Markdown Rendering & Strategic Decision Output

**Branch**: `004-agent-markdown-rendering` | **Date**: 2026-04-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-agent-markdown-rendering/spec.md`

## Summary

Two-part feature: (1) Render markdown formatting (*italic*, **bold**) in frontend ChatInterface from agent outputs. (2) Update SupporterAgent prompt to ensure strategic mode explicitly states the final decision that answers the user's question.

## Technical Context

**Language/Version**: Python 3.11+ (backend), JavaScript/TypeScript (frontend)
**Primary Dependencies**: React, react-markdown (frontend rendering), google-adk (backend agents)
**Storage**: N/A (no data persistence changes)
**Testing**: pytest (backend), manual testing (frontend)
**Target Platform**: Web application (Linux server)
**Project Type**: Web-service + React frontend
**Performance Goals**: Markdown rendering < 50ms
**Constraints**: Must not break existing message rendering
**Scale/Scope**: All agent messages in ChatInterface

## Constitution Check

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Code Verbosity & Clarity | PASS | Adding clear component names and comments |
| II. User Experience Consistency | PASS | Consistent message bubble styling with markdown |
| III. Requirement-Driven Prototyping | PASS | Each FR addressed individually |

## Project Structure

### Source Code (repository root)

```text
backend/
├── app/
│   ├── agents/
│   │   └── supporter.py      # SUPPORTER_INSTRUCTION update (FR-005 to FR-011)
│   └── ...
frontend/
├── src/
│   ├── components/
│   │   └── ChatInterface.jsx  # MessageBubble markdown rendering (FR-001 to FR-004)
│   └── ...
```

**Structure Decision**: Web application with React frontend and Python/FastAPI backend. Markdown rendering occurs in frontend display layer.

## Phase 0: Research

### Research: Markdown Rendering Options

**Decision**: Use react-markdown library for frontend markdown rendering

**Rationale**:
- Standard React markdown library with broad adoption
- Handles *italic*, **bold**, code blocks, and other common markdown
- Small bundle size impact acceptable
- Server-side rendering compatible

**Alternatives considered**:
- Custom regex replacement: Too limited for nested cases
- dangerouslySetInnerHTML: Security risk
- @tailwindcss/typography: Overkill for simple bold/italic

### Research: Strategic Mode Decision Clarity

**Decision**: Update SUPPORTER_INSTRUCTION to add explicit "FINAL DECISION:" prefix in strategic mode Executive Summary and Recommendation

**Rationale**:
- Requires only prompt text change, no code modification
- LLM will naturally follow when explicitly instructed
- No hallucination risk since it uses provided evaluation data

## Phase 1: Design & Contracts

### Data Model (Entities from Spec)

| Entity | Fields | Notes |
|--------|--------|-------|
| AgentOutput | content: string, agent: string, role: string | Existing message structure |
| MarkdownContent | text: string | Content with *italic* and **bold** markers |

### Interface Contracts

**Frontend Contract**: `MessageBubble` component accepts markdown content and renders styled output

**Expected behavior**:
- Input: `"This is *italic* and this is **bold**"`
- Output: HTML with `<em>italic</em>` and `<strong>bold</strong>`

### Quickstart

1. `cd frontend && npm install react-markdown`
2. Update `ChatInterface.jsx` to import and use `<ReactMarkdown>`
3. Update `supporter.py` SUPPORTER_INSTRUCTION to emphasize final decision clarity

## Complexity Tracking

> No constitution violations requiring justification.

## Implementation Notes

### Frontend Changes (FR-001 to FR-004)

1. Install `react-markdown` in frontend
2. Import `ReactMarkdown` in `ChatInterface.jsx`
3. Replace `{message.content}` with `<ReactMarkdown>{message.content}</ReactMarkdown>` in MessageBubble
4. Ensure CSS classes `.bubble-assistant` apply to markdown-rendered content

### Backend Changes (FR-005 to FR-011)

1. Update `SUPPORTER_INSTRUCTION` in `supporter.py`
2. Add explicit instruction for strategic mode to start Executive Summary with: "**FINAL DECISION:** [Option Name]"
3. Add instruction that Recommendation section must explicitly state how the choice solves the user's question
4. Ensure purchase mode closing line is preserved