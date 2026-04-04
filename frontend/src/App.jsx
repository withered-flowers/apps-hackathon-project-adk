import { useCallback, useState } from 'react';
import './index.css';

import AgentStatusBadge from './components/AgentStatusBadge';
import ChatInterface from './components/ChatInterface';
import DecisionMatrix from './components/DecisionMatrix';
import ExportButton from './components/ExportButton';
import { ErrorBanner } from './components/LoadingSpinner';
import { newSession, sendMessage } from './services/api';

export default function App() {
  const [sessionId, setSessionId] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Interviewing');
  const [agent, setAgent] = useState('');
  const [matrix, setMatrix] = useState(null);
  const [error, setError] = useState('');

  // ── Helpers ──────────────────────────────────────────────────────────

  const ensureSession = useCallback(async () => {
    if (sessionId) return sessionId;
    const id = await newSession();
    setSessionId(id);
    return id;
  }, [sessionId]);

  const handleSend = useCallback(async (text) => {
    setError('');
    setLoading(true);

    // Append user message immediately for instant feedback
    setMessages(prev => [...prev, { role: 'user', content: text }]);

    try {
      const sid = await ensureSession();
      const data = await sendMessage(sid, text);

      // Update session state
      setStatus(data.status);
      setAgent(data.agent);

      if (data.matrix?.options?.length) {
        setMatrix(data.matrix);
      }

      // Append assistant response
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: data.response, agent: data.agent },
      ]);
    } catch (err) {
      const msg =
        err.response?.data?.error ||
        err.message ||
        'An unexpected error occurred. Please try again.';
      setError(msg);
      // Remove the optimistic user message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  }, [ensureSession]);

  const handleNewDecision = () => {
    setSessionId('');
    setMessages([]);
    setStatus('Interviewing');
    setAgent('');
    setMatrix(null);
    setError('');
  };

  // ── Layout ────────────────────────────────────────────────────────────

  const hasMatrix = matrix?.options?.length > 0;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        background: 'var(--color-bg-primary)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Ambient background glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'var(--gradient-glow)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* ── Header ───────────────────────────────────────────────────── */}
      <header
        style={{
          position: 'relative',
          zIndex: 10,
          borderBottom: '1px solid var(--color-border)',
          padding: '14px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(17, 24, 39, 0.8)',
          backdropFilter: 'blur(12px)',
        }}
      >
        {/* Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              background: 'var(--gradient-brand)',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.1rem',
            }}
          >
            🎯
          </div>
          <div>
            <h1
              className="glow-text"
              style={{ fontSize: '1.2rem', fontWeight: 700, lineHeight: 1.2 }}
            >
              Decidely.ai
            </h1>
            <p style={{ fontSize: '0.72rem', color: 'var(--color-text-muted)', lineHeight: 1 }}>
              AI Board of Advisors
            </p>
          </div>
        </div>

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <AgentStatusBadge agent={agent} status={status} />
          <button
            id="new-decision-btn"
            className="btn-secondary"
            onClick={handleNewDecision}
            style={{ fontSize: '0.82rem', padding: '8px 14px' }}
          >
            + New Decision
          </button>
        </div>
      </header>

      {/* ── Main content ─────────────────────────────────────────────── */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Chat panel */}
        <div
          style={{
            flex: hasMatrix ? '1 1 55%' : '1 1 100%',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            transition: 'flex 0.4s ease',
            borderRight: hasMatrix ? '1px solid var(--color-border)' : 'none',
          }}
        >
          {error && (
            <div style={{ padding: '12px 16px' }}>
              <ErrorBanner message={error} onDismiss={() => setError('')} />
            </div>
          )}

          <ChatInterface
            messages={messages}
            loading={loading}
            onSend={handleSend}
            disabled={status === 'Complete' && messages.length > 0}
          />
        </div>

        {/* Matrix panel — appears when data is available */}
        {hasMatrix && (
          <div
            className="animate-fade-in"
            style={{
              flex: '1 1 45%',
              overflowY: 'auto',
              padding: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
              minWidth: 0,
            }}
          >
            <DecisionMatrix matrix={matrix} />

            {status === 'Complete' && sessionId && (
              <div className="glass-card" style={{ padding: '16px' }}>
                <p
                  style={{
                    fontSize: '0.85rem',
                    color: 'var(--color-text-secondary)',
                    marginBottom: '12px',
                  }}
                >
                  🎉 Decision complete! Save your report:
                </p>
                <ExportButton sessionId={sessionId} />
              </div>
            )}

            {/* Session info */}
            {sessionId && (
              <p
                style={{
                  fontSize: '0.72rem',
                  color: 'var(--color-text-muted)',
                  fontFamily: "'JetBrains Mono', monospace",
                  textAlign: 'center',
                }}
              >
                Session: {sessionId}
              </p>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
