import { useState } from "react";
import PricingCard from "./PricingCard";
import Login from "./Login";

const features = [
  {
    title: "Multi-Agent Analysis",
    description:
      "Multiple AI agents analyze your decision from different angles, ensuring comprehensive evaluation.",
  },
  {
    title: "Real-Time Collaboration",
    description:
      "Work with intelligent agents that adapt to your preferences and learn from your choices.",
  },
  {
    title: "Transparent Reasoning",
    description:
      "Every recommendation comes with clear reasoning, so you understand exactly why a path is suggested.",
  },
];

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false);

  if (showLogin) {
    return <Login />;
  }

  return (
    <div
      style={{
        minHeight: "100dvh",
        background: "var(--color-bg-primary)",
        color: "var(--color-text-primary)",
      }}
    >
      <header
        style={{
          padding: "24px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div
            style={{
              width: "12px",
              height: "12px",
              background: "var(--color-text-primary)",
            }}
          />
          <h1
            style={{
              fontSize: "1.2rem",
              fontWeight: 600,
              letterSpacing: "-0.03em",
            }}
          >
            Decidely
          </h1>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={() => setShowLogin(true)}
          style={{ padding: "8px 20px", fontSize: "0.85rem" }}
        >
          Start Decision
        </button>
      </header>

      <main>
        <section
          style={{
            padding: "80px 32px",
            maxWidth: "800px",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontSize: "2.5rem",
              fontWeight: 700,
              letterSpacing: "-0.04em",
              marginBottom: "24px",
              lineHeight: 1.2,
            }}
          >
            Make Better Decisions with AI-Powered Analysis
          </h2>
          <p
            style={{
              fontSize: "1.1rem",
              color: "var(--color-text-muted)",
              lineHeight: 1.7,
              marginBottom: "40px",
            }}
          >
            Decidely uses multiple AI agents to analyze your decisions from
            different perspectives, providing transparent recommendations backed
            by clear reasoning.
          </p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setShowLogin(true)}
            style={{
              padding: "14px 32px",
              fontSize: "1rem",
              fontWeight: 500,
            }}
          >
            Start Your First Decision
          </button>
        </section>

        <section
          style={{
            padding: "60px 32px",
            background: "var(--color-bg-secondary)",
          }}
        >
          <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <h3
              style={{
                fontSize: "1.5rem",
                fontWeight: 600,
                letterSpacing: "-0.02em",
                marginBottom: "40px",
                textAlign: "center",
              }}
            >
              How It Works
            </h3>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "24px",
              }}
            >
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="glass-card"
                  style={{
                    padding: "28px",
                    textAlign: "left",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "1rem",
                      fontWeight: 600,
                      marginBottom: "12px",
                    }}
                  >
                    {feature.title}
                  </h4>
                  <p
                    style={{
                      fontSize: "0.85rem",
                      color: "var(--color-text-muted)",
                      lineHeight: 1.6,
                    }}
                  >
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section
          id="pricing-section"
          style={{
            padding: "60px 32px",
          }}
        >
          <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
            <h3
              style={{
                fontSize: "1.5rem",
                fontWeight: 600,
                letterSpacing: "-0.02em",
                marginBottom: "16px",
                textAlign: "center",
              }}
            >
              Pricing
            </h3>
            <p
              style={{
                fontSize: "0.9rem",
                color: "var(--color-text-muted)",
                textAlign: "center",
                marginBottom: "40px",
              }}
            >
              Choose the plan that fits your decision-making needs
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "24px",
              }}
            >
              <PricingCard
                tier="Guest"
                requests={30}
                window="5 hours"
                price="Free"
                description="Perfect for trying out the platform"
                isHighlighted={false}
              />
              <PricingCard
                tier="Registered"
                requests={3}
                window="2 hours"
                price="Free"
                description="For registered users with basic needs"
                isHighlighted={false}
              />
              <PricingCard
                tier="Upgraded"
                requests={20}
                window="1 hour"
                price="Demo"
                description="Use voucher code DEMO for free upgrade"
                isHighlighted={true}
              />
            </div>
          </div>
        </section>

        <section
          style={{
            padding: "60px 32px",
            textAlign: "center",
            borderTop: "1px solid var(--color-border)",
          }}
        >
          <h3
            style={{
              fontSize: "1.3rem",
              fontWeight: 600,
              marginBottom: "16px",
            }}
          >
            Ready to make better decisions?
          </h3>
          <p
            style={{
              fontSize: "0.9rem",
              color: "var(--color-text-muted)",
              marginBottom: "32px",
            }}
          >
            Join now and get started with AI-powered decision analysis
          </p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => setShowLogin(true)}
            style={{
              padding: "14px 32px",
              fontSize: "1rem",
              fontWeight: 500,
            }}
          >
            Get Started
          </button>
        </section>
      </main>

      <footer
        style={{
          padding: "24px 32px",
          textAlign: "center",
          borderTop: "1px solid var(--color-border)",
          fontSize: "0.75rem",
          color: "var(--color-text-muted)",
        }}
      >
        Decidely.ai — AI-Powered Decision Support
      </footer>
    </div>
  );
}