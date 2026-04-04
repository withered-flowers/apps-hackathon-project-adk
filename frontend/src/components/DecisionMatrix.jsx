import { useMemo } from 'react';

/**
 * DecisionMatrix — renders the comparison table from the Evaluator agent.
 *
 * @param {{ options: Array, criteria: Array }} matrix
 */
export default function DecisionMatrix({ matrix }) {
  const options = matrix?.options ?? [];
  const criteria = matrix?.criteria ?? [];
  const criteriaNames = criteria.map(c => c.name || c);

  // Highest score for highlighting — must be called before any early return
  const maxScore = useMemo(
    () => Math.max(0, ...options.map(o => o.weighted_score ?? 0)),
    [options]
  );

  if (!matrix || !options.length) return null;

  const scoreClass = (score) => {
    if (score >= 8) return 'score-high';
    if (score >= 5) return 'score-mid';
    return 'score-low';
  };

  return (
    <div
      className="glass-card animate-fade-in"
      style={{ padding: '20px', overflow: 'hidden' }}
    >
      {/* Header */}
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '1.2rem' }}>📊</span>
        <h3
          style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
          }}
        >
          Decision Matrix
        </h3>
      </div>

      {/* Scrollable table wrapper */}
      <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid var(--color-border)' }}>
        <table className="matrix-table">
          <thead>
            <tr>
              <th style={{ minWidth: '160px' }}>Option</th>
              {criteriaNames.map(name => (
                <th key={name}>{name}</th>
              ))}
              <th style={{ textAlign: 'center' }}>Total</th>
              <th>Rec.</th>
            </tr>
          </thead>
          <tbody>
            {options.map((opt, idx) => {
              const isTop = opt.weighted_score === maxScore;
              return (
                <tr key={idx}>
                  {/* Option name */}
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {isTop && (
                        <span
                          style={{
                            fontSize: '0.75rem',
                            background: 'rgba(72,187,120,0.15)',
                            color: '#48bb78',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontWeight: 700,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          ⭐ TOP
                        </span>
                      )}
                      <span
                        style={{
                          color: isTop ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                          fontWeight: isTop ? 600 : 400,
                          fontSize: '0.85rem',
                        }}
                      >
                        {opt.title}
                      </span>
                    </div>
                  </td>

                  {/* Per-criterion scores */}
                  {criteriaNames.map(name => {
                    const score = opt.scores?.[name] ?? '—';
                    return (
                      <td key={name} style={{ textAlign: 'center' }}>
                        {typeof score === 'number' ? (
                          <span className={`score-chip ${scoreClass(score)}`}>{score}</span>
                        ) : (
                          <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                        )}
                      </td>
                    );
                  })}

                  {/* Total score */}
                  <td style={{ textAlign: 'center', fontWeight: 700 }}>
                    <span
                      style={{
                        color: isTop ? 'var(--color-green)' : 'var(--color-text-secondary)',
                        fontSize: '0.9rem',
                      }}
                    >
                      {typeof opt.weighted_score === 'number'
                        ? opt.weighted_score.toFixed(1)
                        : '—'}
                    </span>
                  </td>

                  {/* Source link */}
                  <td>
                    {opt.url ? (
                      <a
                        href={opt.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          color: 'var(--color-accent)',
                          fontSize: '0.78rem',
                          textDecoration: 'none',
                        }}
                        onMouseEnter={e => (e.target.style.textDecoration = 'underline')}
                        onMouseLeave={e => (e.target.style.textDecoration = 'none')}
                      >
                        View ↗
                      </a>
                    ) : (
                      <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pros/Cons detail */}
      {options.length > 0 && (
        <div
          style={{
            marginTop: '16px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
            gap: '12px',
          }}
        >
          {options.slice(0, 3).map((opt, idx) => (
            <div
              key={idx}
              style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--color-border)',
                borderRadius: '10px',
                padding: '12px',
              }}
            >
              <p
                style={{
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  color: 'var(--color-text-primary)',
                  marginBottom: '8px',
                }}
              >
                {opt.title}
              </p>
              {opt.pros?.length > 0 && (
                <ul style={{ listStyle: 'none', marginBottom: '6px' }}>
                  {opt.pros.slice(0, 2).map((p, i) => (
                    <li
                      key={i}
                      style={{ fontSize: '0.76rem', color: '#48bb78', marginBottom: '2px' }}
                    >
                      ✓ {p}
                    </li>
                  ))}
                </ul>
              )}
              {opt.cons?.length > 0 && (
                <ul style={{ listStyle: 'none' }}>
                  {opt.cons.slice(0, 1).map((c, i) => (
                    <li
                      key={i}
                      style={{ fontSize: '0.76rem', color: '#fc8181', marginBottom: '2px' }}
                    >
                      ✗ {c}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
