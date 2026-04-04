/**
 * LoadingSpinner — animated indicator while agent is processing.
 */
export function LoadingSpinner({ size = 24 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      style={{ animation: 'spin 0.8s linear infinite' }}
    >
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <circle cx="12" cy="12" r="10" stroke="var(--color-border)" strokeWidth="2.5" />
      <path
        d="M12 2 A10 10 0 0 1 22 12"
        stroke="var(--color-accent)"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

/**
 * TypingIndicator — three bouncing dots while agent is generating.
 */
export function TypingIndicator() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '12px 16px',
      }}
    >
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  );
}

/**
 * ErrorBanner — displays an error message with a dismiss button.
 */
export function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div
      className="animate-fade-in"
      style={{
        background: 'rgba(252, 129, 129, 0.1)',
        border: '1px solid rgba(252, 129, 129, 0.3)',
        borderRadius: '10px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        fontSize: '0.88rem',
        color: 'var(--color-red)',
      }}
    >
      <span style={{ fontSize: '1.1rem' }}>⚠️</span>
      <span style={{ flex: 1 }}>{message}</span>
      {onDismiss && (
        <button
          onClick={onDismiss}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
            fontSize: '1rem',
            padding: '0 4px',
          }}
        >
          ✕
        </button>
      )}
    </div>
  );
}
