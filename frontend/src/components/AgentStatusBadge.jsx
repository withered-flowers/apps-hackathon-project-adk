// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';

export default function AgentStatusBadge({ agent, status }) {
  if (!agent && !status) return null;

  const statusMap = {
    Interviewing: { color: 'var(--color-text-secondary)', label: 'Interviewing' },
    Researching:  { color: 'var(--color-text-secondary)', label: 'Researching' },
    Evaluating:   { color: 'var(--color-text-secondary)', label: 'Evaluating' },
    Supporting:   { color: 'var(--color-text-secondary)', label: 'Supporting' },
    Complete:     { color: 'var(--color-accent)', label: 'Complete' },
  };

  const cfg = statusMap[status] || statusMap.Interviewing;

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '12px',
      padding: '6px 12px', background: 'var(--status-bg)',
      border: '1px solid var(--color-border)', borderRadius: '16px',
      fontSize: '0.75rem', fontWeight: 500
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: cfg.color }}>
        {status !== 'Complete' && (
          <motion.div
            animate={{ opacity: [1, 0.4, 1] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'currentColor' }}
          />
        )}
        <span className="font-mono" style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>{cfg.label}</span>
      </div>
      {agent && (
        <>
          <div style={{ width: '1px', height: '12px', background: 'var(--color-border)' }} />
          <span className="font-mono" style={{ color: 'var(--color-text-muted)' }}>
            {agent.replace('Agent', '')}
          </span>
        </>
      )}
    </div>
  );
}
