export default function RateLimitBanner({ tier, remaining, limit }) {
  const isWarning = remaining <= 2 && remaining > 0;
  const isExhausted = remaining === 0;
  const isLow = remaining <= 3;

  if (isExhausted) {
    return (
      <div
        id="ratelimit-exhausted"
        style={{
          padding: "10px 16px",
          background: "rgba(239, 68, 68, 0.1)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          borderRadius: "0.5rem",
          fontSize: "0.75rem",
          color: "#ef4444",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <span style={{ fontWeight: 600 }}>Resource Exhausted</span>
        <span style={{ color: "var(--color-text-muted)" }}>
          Upgrade to continue making decisions. Use voucher code{" "}
        </span>
        <code
          style={{
            background: "rgba(239, 68, 68, 0.15)",
            padding: "2px 8px",
            borderRadius: "0.25rem",
            fontWeight: 600,
          }}
        >
          DEMO
        </code>
        <span style={{ color: "var(--color-text-muted)" }}>for free upgrade.</span>
      </div>
    );
  }

  if (isWarning) {
    return (
      <div
        id="ratelimit-warning"
        style={{
          padding: "8px 14px",
          background: "rgba(251, 191, 36, 0.1)",
          border: "1px solid rgba(251, 191, 36, 0.3)",
          borderRadius: "0.5rem",
          fontSize: "0.75rem",
          color: "#fbbf24",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span style={{ fontWeight: 600 }}>
          {remaining} request{remaining !== 1 ? "s" : ""} remaining
        </span>
        <span style={{ color: "var(--color-text-muted)" }}>
          — Running low on your {tier} tier
        </span>
      </div>
    );
  }

  if (isLow) {
    return (
      <div
        id="ratelimit-low"
        style={{
          padding: "6px 12px",
          background: "var(--color-bg-secondary)",
          border: "1px solid var(--color-border)",
          borderRadius: "0.5rem",
          fontSize: "0.7rem",
          color: "var(--color-text-muted)",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span>
          {remaining}/{limit} requests left
        </span>
      </div>
    );
  }

  return (
    <div
      id="ratelimit-normal"
      style={{
        padding: "6px 12px",
        background: "var(--color-bg-secondary)",
        border: "1px solid var(--color-border)",
        borderRadius: "0.5rem",
        fontSize: "0.7rem",
        color: "var(--color-text-muted)",
      }}
    >
      {tier}: {remaining}/{limit}
    </div>
  );
}