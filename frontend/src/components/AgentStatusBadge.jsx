import { useState } from 'react';

/**
 * AgentStatusBadge — shows current pipeline agent and session status.
 */
export default function AgentStatusBadge({ agent, status }) {
  if (!agent && !status) return null;

  const statusColors = {
    Interviewing: { bg: 'rgba(99, 179, 237, 0.15)', color: '#63b3ed', label: '💬 Interviewing' },
    Researching:  { bg: 'rgba(159, 122, 234, 0.15)', color: '#9f7aea', label: '🔍 Researching' },
    Evaluating:   { bg: 'rgba(237, 137, 54, 0.15)', color: '#ed8936', label: '⚖️ Evaluating' },
    Complete:     { bg: 'rgba(72, 187, 120, 0.15)',  color: '#48bb78', label: '✅ Complete' },
  };

  const cfg = statusColors[status] || statusColors.Interviewing;

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 16px',
        background: 'var(--color-bg-card)',
        border: '1px solid var(--color-border)',
        borderRadius: '12px',
        fontSize: '0.82rem',
      }}
    >
      {/* Status phase */}
      <span
        style={{
          background: cfg.bg,
          color: cfg.color,
          padding: '4px 10px',
          borderRadius: '20px',
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
        }}
      >
        <span
          className="pulse-dot"
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: cfg.color,
            display: status !== 'Complete' ? 'inline-block' : 'none',
          }}
        />
        {cfg.label}
      </span>

      {/* Agent name */}
      {agent && (
        <span style={{ color: 'var(--color-text-muted)', fontFamily: "'JetBrains Mono', monospace" }}>
          {agent}
        </span>
      )}
    </div>
  );
}
