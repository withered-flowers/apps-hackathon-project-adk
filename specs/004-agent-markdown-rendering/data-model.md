# Data Model: Agent Markdown Rendering & Strategic Decision Output

## Entity Definitions

### AgentOutput (Existing)

| Field | Type | Description |
|-------|------|-------------|
| content | string | Raw markdown text from agent, may contain `*italic*` and `**bold**` |
| agent | string | Agent name (e.g., "SupporterAgent") |
| role | string | "user" or "assistant" |
| isProgress | boolean | Whether this is an in-progress message |

### MarkdownContent

| Field | Type | Description |
|-------|------|-------------|
| text | string | Markdown text to be rendered by react-markdown |

---

## Data Flow

```
Agent Output (markdown string)
    ↓
ChatInterface.jsx (MessageBubble component)
    ↓
ReactMarkdown (renders markdown to styled HTML)
    ↓
User sees italic/bold text (not raw asterisks)
```

---

## Validation Rules

1. **FR-001 & FR-002**: Single asterisk `*text*` → italic, double asterisk `**text**` → bold
2. **FR-003**: Multiple formatting marks handled correctly by react-markdown
3. **FR-004**: Code blocks (backticks) and escaped characters NOT rendered as formatting

---

## State Transitions

No new state transitions required. This feature modifies display rendering only.

---

## Constraints

- Markdown rendering must not break existing message bubble layout
- Styled content must respect existing CSS variables (colors, fonts)
- Rendering must complete in < 50ms for user perceived responsiveness