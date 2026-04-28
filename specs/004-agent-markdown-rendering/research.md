# Research: Agent Markdown Rendering & Strategic Decision Output

## Markdown Rendering (Frontend)

### Decision
Use `react-markdown` library for frontend markdown rendering.

### Rationale
- Standard React markdown library with broad adoption and active maintenance
- Handles *italic*, **bold**, code blocks, and other common markdown syntax
- Small bundle size impact (~15KB minified)
- Server-side rendering compatible via @vitejs/plugin-react

### Alternatives Evaluated

| Alternative | Why Rejected |
|-------------|--------------|
| Custom regex replacement | Too limited for nested cases like `**bold *and italic***` |
| dangerouslySetInnerHTML | XSS security vulnerability risk |
| @tailwindcss/typography | Overkill for simple bold/italic; adds significant bundle size |

### Implementation Approach
1. `npm install react-markdown` in frontend
2. Import `ReactMarkdown` in `ChatInterface.jsx`
3. Wrap message content: `<ReactMarkdown>{message.content}</ReactMarkdown>`
4. Ensure bubble CSS classes style the rendered markdown

---

## Strategic Mode Decision Clarity (Backend)

### Decision
Update `SUPPORTER_INSTRUCTION` to explicitly require "FINAL DECISION:" prefix and mandate that Recommendation explain how the chosen option solves the user's original question.

### Rationale
- Requires only prompt text change, no code modification needed
- LLM follows explicit instructions reliably
- No hallucination risk since it uses only provided evaluation data
- Directly addresses user complaint that strategic mode doesn't give clear final decisions

### Instruction Changes

**Executive Summary section** - Add:
```
**FINAL DECISION:** [Option Name]

[2-3 sentence summary]
```

**Recommendation & Justification section** - Add:
```
Your decision question was: "[original question]"
This option was chosen because: [explanation directly addressing the question]
```

---

## Specification Compliance Matrix

| FR | Implementation | Location |
|----|----------------|----------|
| FR-001 | react-markdown italic rendering | frontend/ChatInterface.jsx |
| FR-002 | react-markdown bold rendering | frontend/ChatInterface.jsx |
| FR-003 | react-markdown handles nesting | frontend/ChatInterface.jsx |
| FR-004 | react-markdown ignores code blocks | frontend/ChatInterface.jsx |
| FR-005 | Prompt update for final decision | backend/agents/supporter.py |
| FR-006 | Prompt update for question alignment | backend/agents/supporter.py |
| FR-007 | Prompt update for next steps | backend/agents/supporter.py |
| FR-008 | Purchase mode 3-4 paragraphs | backend/agents/supporter.py |
| FR-009 | Purchase mode closing line | backend/agents/supporter.py |
| FR-010 | No JSON output | Already in SUPPORTER_INSTRUCTION |
| FR-011 | No fabricated data | Already in SUPPORTER_INSTRUCTION |