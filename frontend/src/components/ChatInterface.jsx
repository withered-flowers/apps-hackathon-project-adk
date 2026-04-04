import { useEffect, useRef, useState } from 'react';
import { TypingIndicator } from './LoadingSpinner';

/**
 * ChatInterface — the main conversation UI.
 *
 * @param {Array}    messages   - [{role, content, agent}]
 * @param {boolean}  loading    - true while waiting for agent response
 * @param {Function} onSend     - called with (message: string)
 * @param {boolean}  disabled   - prevent input while processing
 */
export default function ChatInterface({ messages, loading, onSend, disabled }) {
  const [input, setInput] = useState('');
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input on mount
  useEffect(() => {
    if (!disabled) inputRef.current?.focus();
  }, [disabled]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || loading || disabled) return;
    onSend(trimmed);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
      }}
    >
      {/* Message list */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}
      >
        {messages.length === 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              gap: '16px',
              paddingBottom: '40px',
            }}
          >
            <div style={{ fontSize: '3rem' }}>🎯</div>
            <p
              style={{
                fontSize: '1.1rem',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                textAlign: 'center',
              }}
            >
              What decision are you facing today?
            </p>
            <p
              style={{
                fontSize: '0.88rem',
                color: 'var(--color-text-muted)',
                textAlign: 'center',
                maxWidth: '380px',
                lineHeight: 1.6,
              }}
            >
              Describe your decision — buying a laptop, choosing a city, picking a career path.
              Our AI board of advisors will guide you through.
            </p>

            {/* Suggestion chips */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '8px' }}>
              {[
                'Which laptop should I buy?',
                'Help me choose a programming language to learn',
                'I need to pick a cloud provider',
              ].map(sugg => (
                <button
                  key={sugg}
                  className="btn-secondary"
                  style={{ fontSize: '0.8rem', padding: '7px 14px' }}
                  onClick={() => {
                    setInput(sugg);
                    inputRef.current?.focus();
                  }}
                >
                  {sugg}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, idx) => (
          <MessageBubble key={idx} message={msg} />
        ))}

        {/* Typing indicator */}
        {loading && (
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              gap: '10px',
              maxWidth: '80%',
            }}
          >
            <AgentAvatar agent="..." />
            <div
              className="bubble-assistant"
              style={{ padding: '8px 14px', borderRadius: '18px 18px 18px 4px' }}
            >
              <TypingIndicator />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Input form */}
      <form
        onSubmit={handleSubmit}
        style={{
          padding: '12px 16px',
          borderTop: '1px solid var(--color-border)',
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-end',
          background: 'var(--color-bg-secondary)',
        }}
      >
        <textarea
          ref={inputRef}
          id="chat-input"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            disabled
              ? 'Session complete — start a new one to continue'
              : 'Type your message... (Enter to send)'
          }
          disabled={disabled || loading}
          rows={1}
          style={{
            flex: 1,
            resize: 'none',
            background: 'var(--color-bg-card)',
            border: '1px solid var(--color-border)',
            borderRadius: '12px',
            padding: '12px 16px',
            color: 'var(--color-text-primary)',
            fontSize: '0.92rem',
            fontFamily: 'inherit',
            outline: 'none',
            transition: 'border-color var(--transition-fast)',
            maxHeight: '120px',
            lineHeight: 1.5,
          }}
          onFocus={e => (e.target.style.borderColor = 'var(--color-accent)')}
          onBlur={e => (e.target.style.borderColor = 'var(--color-border)')}
        />

        <button
          id="send-button"
          type="submit"
          className="btn-primary"
          disabled={!input.trim() || loading || disabled}
          style={{ padding: '12px 20px', alignSelf: 'flex-end' }}
        >
          {loading ? '⏳' : 'Send →'}
        </button>
      </form>
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────────────────── */

function AgentAvatar({ agent }) {
  const agentEmojis = {
    InterviewerAgent: '💬',
    ResearcherAgent:  '🔍',
    EvaluatorAgent:   '⚖️',
    SupporterAgent:   '🎉',
  };
  const emoji = agentEmojis[agent] || '🤖';

  return (
    <div
      title={agent}
      style={{
        width: '32px',
        height: '32px',
        borderRadius: '50%',
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '0.9rem',
        flexShrink: 0,
      }}
    >
      {emoji}
    </div>
  );
}

function MessageBubble({ message }) {
  const isUser = message.role === 'user';

  return (
    <div
      className="animate-fade-in"
      style={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems: 'flex-end',
        gap: '10px',
        maxWidth: '80%',
        alignSelf: isUser ? 'flex-end' : 'flex-start',
      }}
    >
      {!isUser && <AgentAvatar agent={message.agent} />}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {/* Agent label */}
        {!isUser && message.agent && (
          <span
            style={{
              fontSize: '0.72rem',
              color: 'var(--color-text-muted)',
              marginLeft: '4px',
              fontFamily: "'JetBrains Mono', monospace",
            }}
          >
            {message.agent}
          </span>
        )}

        {/* Bubble */}
        <div
          className={isUser ? 'bubble-user' : 'bubble-assistant'}
          style={{
            padding: '12px 16px',
            fontSize: '0.9rem',
            lineHeight: 1.6,
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word',
          }}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}
