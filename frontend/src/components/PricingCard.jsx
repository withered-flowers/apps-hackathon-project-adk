export default function PricingCard({
  tier,
  requests,
  window,
  price,
  description,
  isHighlighted = false,
}) {
  return (
    <div
      className="glass-card glass-refraction"
      style={{
        padding: "28px 24px",
        textAlign: "center",
        border: isHighlighted
          ? "1px solid var(--color-accent)"
          : "1px solid var(--color-border)",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {isHighlighted && (
        <div
          style={{
            position: "absolute",
            top: "12px",
            right: "-28px",
            background: "var(--color-accent)",
            color: "var(--color-bg-primary)",
            fontSize: "0.65rem",
            fontWeight: 600,
            padding: "4px 32px",
            transform: "rotate(45deg)",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          Recommended
        </div>
      )}

      <h4
        style={{
          fontSize: "1.1rem",
          fontWeight: 600,
          marginBottom: "16px",
          color: isHighlighted
            ? "var(--color-accent)"
            : "var(--color-text-primary)",
        }}
      >
        {tier}
      </h4>

      <div
        style={{
          marginBottom: "16px",
        }}
      >
        <span
          style={{
            fontSize: "2rem",
            fontWeight: 700,
            letterSpacing: "-0.03em",
          }}
        >
          {price}
        </span>
      </div>

      <div
        style={{
          fontSize: "0.85rem",
          color: "var(--color-text-muted)",
          marginBottom: "20px",
          lineHeight: 1.5,
        }}
      >
        <span style={{ fontWeight: 600, color: "var(--color-text-primary)" }}>
          {requests}
        </span>{" "}
        requests / {window}
      </div>

      <p
        style={{
          fontSize: "0.8rem",
          color: "var(--color-text-muted)",
          lineHeight: 1.5,
        }}
      >
        {description}
      </p>

      {isHighlighted && tier === "Upgraded" && (
        <div
          style={{
            marginTop: "16px",
            padding: "10px",
            background: "rgba(var(--color-accent-rgb, 99, 102, 241), 0.1)",
            borderRadius: "0.5rem",
            fontSize: "0.75rem",
            color: "var(--color-accent)",
          }}
        >
          Use voucher code{" "}
          <span style={{ fontWeight: 600 }}>DEMO</span> for free upgrade
        </div>
      )}
    </div>
  );
}