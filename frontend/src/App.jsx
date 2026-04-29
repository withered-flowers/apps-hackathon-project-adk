import { useCallback, useEffect, useState } from "react";
import "./index.css";
import { GitHubLogoIcon } from "@radix-ui/react-icons";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";

import AgentStatusBadge from "./components/AgentStatusBadge";
import ChatInterface from "./components/ChatInterface";
import DecisionMatrix from "./components/DecisionMatrix";
import ExportButton from "./components/ExportButton";
import LandingPage from "./components/LandingPage";
import { ErrorBanner } from "./components/LoadingSpinner";
import RateLimitBanner from "./components/RateLimitBanner";
import SessionList from "./components/SessionList";
import ThemeToggle from "./components/ThemeToggle";
import VoucherRedeem from "./components/VoucherRedeem";
import { useAuth } from "./context/AuthContext";
import { getUserStatus, newSession, sendMessage } from "./services/api";

export default function App() {
  const { user, loading: authLoading, logout } = useAuth();

  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [sessionId, setSessionId] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("Interviewing");
  const [agent, setAgent] = useState("");
  const [matrix, setMatrix] = useState(null);
  const [error, setError] = useState("");
  const [showSessions, setShowSessions] = useState(false);
  const [rateLimit, setRateLimit] = useState({
    tier: "registered",
    remaining: 3,
    limit: 3,
  });
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 1024;
      setIsMobile(mobile);
      if (!mobile) setIsMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
      document.documentElement.classList.remove("light");
    } else {
      document.documentElement.classList.add("light");
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    if (!user) return;

    async function fetchUserStatus() {
      setRateLimit({ tier: "registered", remaining: 3, limit: 3 });
      try {
        const status = await getUserStatus();
        if (status.rate_limit_tier === "guest") {
          setRateLimit({ tier: "guest", remaining: 30, limit: 30 });
        } else if (status.rate_limit_tier === "upgraded") {
          setRateLimit({ tier: "upgraded", remaining: 20, limit: 20 });
        }
      } catch {
        // Keep default registered tier on error
      }
    }

    fetchUserStatus();
  }, [user]);

  const ensureSession = useCallback(async () => {
    if (sessionId) return sessionId;
    const id = await newSession();
    setSessionId(id);
    return id;
  }, [sessionId]);

  const handleSend = useCallback(
    async (text) => {
      setError("");
      setLoading(true);

      setMessages((prev) => [...prev, { role: "user", content: text }]);

      try {
        const sid = await ensureSession();
        const data = await sendMessage(
          sid,
          text,
          (statusUpdate) => {
            setStatus(statusUpdate.status);
            setAgent(statusUpdate.agent);
          },
          (progress) => {
            setStatus(progress.status);
            setAgent(progress.agent);
            setMessages((prev) => [
              ...prev,
              {
                role: "assistant",
                content: progress.message,
                agent: progress.agent,
                isProgress: true,
              },
            ]);
          },
          (rateLimitInfo) => {
            setRateLimit((prev) => ({
              ...prev,
              remaining: rateLimitInfo.remaining,
            }));
          },
        );

        setStatus(data.status);
        setAgent(data.agent);

        if (data.matrix?.options?.length) {
          setMatrix(data.matrix);
        }

        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.response, agent: data.agent },
        ]);
      } catch (err) {
        const msg =
          err.response?.data?.error ||
          err.message ||
          "Processing error. Our systems could not complete the request.";
        setError(msg);
        setMessages((prev) => prev.slice(0, -1));
      } finally {
        setLoading(false);
      }
    },
    [ensureSession],
  );

  const handleNewDecision = () => {
    setSessionId("");
    setMessages([]);
    setStatus("Interviewing");
    setAgent("");
    setMatrix(null);
    setError("");
    setShowSessions(false);
  };

  const handleSelectSession = useCallback((data) => {
    setSessionId(data.sessionId);
    setMessages(data.messages);
    setMatrix(data.matrix);
    setStatus(data.status);
    setAgent("");
    setError("");
    setShowSessions(false);
  }, []);

  const toggleTheme = () => setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  const hasMatrix = matrix?.options?.length > 0;

  // ── Auth Loading ──
  if (authLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100dvh",
          background: "var(--color-bg-primary)",
          color: "var(--color-text-muted)",
          fontSize: "0.85rem",
        }}
      >
        Loading...
      </div>
    );
  }

  // ── Not Authenticated → Show Landing Page ──
  if (!user) {
    return <LandingPage />;
  }

  // ── Derive display name ──
  const displayName = user.isAnonymous ? "Guest" : user.email || "User";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100dvh",
        overflow: "hidden",
        background: "var(--color-bg-primary)",
        color: "var(--color-text-primary)",
      }}
    >
      <header
        className="glass-refraction"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          padding: isMobile ? "12px 20px" : "16px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "var(--header-bg)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid var(--color-border)",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: isMobile ? "8px" : "16px",
          }}
        >
          <div
            style={{
              width: "12px",
              height: "12px",
              background: "var(--color-text-primary)",
            }}
          />
          <h1
            style={{
              fontSize: "1.1rem",
              fontWeight: 600,
              letterSpacing: "-0.03em",
            }}
          >
            Decidely
          </h1>
          {isMobile && <AgentStatusBadge agent={agent} status={status} />}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {!isMobile && (
            <>
              <span
                id="header-user-display"
                style={{
                  fontSize: "0.75rem",
                  color: "var(--color-text-muted)",
                  maxWidth: "140px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {displayName}
              </span>

              <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
              <RateLimitBanner
                tier={rateLimit.tier}
                remaining={rateLimit.remaining}
                limit={rateLimit.limit}
                variant="compact"
              />
              {!user.isAnonymous && (
                <VoucherRedeem
                  isUpgraded={rateLimit.tier === "upgraded"}
                  onUpgrade={() =>
                    setRateLimit((prev) => ({
                      ...prev,
                      tier: "upgraded",
                      remaining: 20,
                      limit: 20,
                    }))
                  }
                  variant="compact"
                />
              )}
              <a
                href="https://github.com/withered-flowers/apps-hackathon-project-adk"
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "var(--color-bg-card)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text-secondary)",
                  cursor: "pointer",
                  textDecoration: "none",
                }}
                aria-label="GitHub"
              >
                <div>
                  <GitHubLogoIcon width={16} height={16} />
                </div>
              </a>
              <AgentStatusBadge agent={agent} status={status} />
              <button
                type="button"
                className="btn-secondary"
                onClick={handleNewDecision}
                style={{ padding: "8px 16px", fontSize: "0.8rem" }}
              >
                New Session
              </button>

              <button
                id="header-logout"
                type="button"
                className="btn-secondary"
                onClick={logout}
                style={{
                  padding: "8px 16px",
                  fontSize: "0.8rem",
                  color: "var(--color-text-muted)",
                }}
              >
                Sign Out
              </button>
            </>
          )}

          {isMobile && (
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--color-text-primary)",
                cursor: "pointer",
                padding: "8px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
                zIndex: 110,
              }}
            >
              <div
                style={{
                  width: "20px",
                  height: "2px",
                  background: "currentColor",
                  transition: "0.3s",
                  transform: isMenuOpen ? "rotate(45deg) translate(4px, 4px)" : "",
                }}
              />
              <div
                style={{
                  width: "20px",
                  height: "2px",
                  background: "currentColor",
                  opacity: isMenuOpen ? 0 : 1,
                  transition: "0.3s",
                }}
              />
              <div
                style={{
                  width: "20px",
                  height: "2px",
                  background: "currentColor",
                  transition: "0.3s",
                  transform: isMenuOpen ? "rotate(-45deg) translate(4px, -4px)" : "",
                }}
              />
            </button>
          )}
        </div>
      </header>

      <AnimatePresence>
        {isMobile && isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "var(--color-bg-primary)",
              zIndex: 90,
              padding: "80px 24px 24px",
              display: "flex",
              flexDirection: "column",
              gap: "20px",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px",
                background: "var(--color-bg-secondary)",
                borderRadius: "16px",
                border: "1px solid var(--color-border)",
              }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span
                  style={{
                    fontSize: "0.65rem",
                    color: "var(--color-text-muted)",
                    textTransform: "uppercase",
                    fontWeight: 600,
                  }}
                >
                  Active Account
                </span>
                <span style={{ fontSize: "1rem", fontWeight: 600 }}>{displayName}</span>
              </div>
              <ThemeToggle theme={theme} toggleTheme={toggleTheme} />
            </div>

            <div
              className="glass-card"
              style={{
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                gap: "24px",
                background: "var(--color-bg-primary)",
                borderRadius: "20px",
                border: "1px solid var(--color-border)",
              }}
            >
              <RateLimitBanner
                tier={rateLimit.tier}
                remaining={rateLimit.remaining}
                limit={rateLimit.limit}
              />

              {rateLimit.tier !== "upgraded" && !user.isAnonymous && (
                <div
                  style={{
                    paddingTop: "20px",
                    borderTop: "1px solid var(--color-border)",
                  }}
                >
                  <VoucherRedeem
                    isUpgraded={rateLimit.tier === "upgraded"}
                    onUpgrade={() => {
                      setRateLimit((prev) => ({
                        ...prev,
                        tier: "upgraded",
                        remaining: 20,
                        limit: 20,
                      }));
                    }}
                  />
                </div>
              )}
            </div>

            <div
              style={{
                marginTop: "auto",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <button
                type="button"
                className="btn-primary"
                onClick={() => {
                  handleNewDecision();
                  setIsMenuOpen(false);
                }}
                style={{ padding: "16px", fontSize: "1rem" }}
              >
                New Session
              </button>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  logout();
                  setIsMenuOpen(false);
                }}
                style={{ padding: "16px", fontSize: "1rem" }}
              >
                Sign Out
              </button>
              <a
                href="https://github.com/withered-flowers/apps-hackathon-project-adk"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "8px",
                  padding: "12px",
                  color: "var(--color-text-muted)",
                  textDecoration: "none",
                  fontSize: "0.85rem",
                }}
              >
                <GitHubLogoIcon /> GitHub Repository
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className={`app-main ${hasMatrix ? "has-matrix" : ""}`}>
        <div
          style={{
            background: "var(--color-bg-primary)",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
            minHeight: 0,
            flex: 1,
          }}
        >
          {error && (
            <div style={{ padding: "16px 24px 0" }}>
              <ErrorBanner message={error} onDismiss={() => setError("")} />
            </div>
          )}

          {messages.length === 0 && !showSessions && (
            <div
              style={{
                padding: "16px 24px",
                display: "flex",
                gap: "8px",
              }}
            >
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowSessions(true)}
                style={{ fontSize: "0.8rem", padding: "6px 12px" }}
              >
                Recent Sessions
              </button>
            </div>
          )}

          {messages.length === 0 && showSessions && (
            <div
              style={{
                padding: "16px 24px 16px",
                display: "flex",
                flexDirection: "column",
                gap: "8px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowSessions(false)}
                  style={{ fontSize: "0.75rem", padding: "4px 10px" }}
                >
                  ← Back
                </button>
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "var(--color-text-muted)",
                    fontWeight: 500,
                  }}
                >
                  Recent Sessions
                </span>
              </div>
              <SessionList onSelectSession={handleSelectSession} />
            </div>
          )}

          <ChatInterface
            messages={messages}
            loading={loading}
            onSend={handleSend}
            disabled={status === "Complete" && messages.length > 0}
          />
        </div>

        <AnimatePresence mode="popLayout">
          {hasMatrix && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{
                opacity: 1,
                x: 0,
                transition: { type: "spring", stiffness: 100, damping: 20 },
              }}
              exit={{ opacity: 0, x: 20 }}
              style={{
                background: "var(--color-bg-primary)",
                overflowY: "auto",
                padding: "32px",
                display: "flex",
                flexDirection: "column",
                gap: "24px",
                minHeight: 0,
                flex: 1,
              }}
            >
              <DecisionMatrix matrix={matrix} />

              <AnimatePresence>
                {status === "Complete" && sessionId && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card glass-refraction"
                    style={{ padding: "24px", marginTop: "16px" }}
                  >
                    <div
                      style={{
                        marginBottom: "16px",
                        fontWeight: 500,
                        letterSpacing: "-0.01em",
                      }}
                    >
                      Documentation Lifecycle
                    </div>
                    <ExportButton sessionId={sessionId} />
                  </motion.div>
                )}
              </AnimatePresence>

              {sessionId && (
                <div
                  className="font-mono"
                  style={{
                    fontSize: "0.7rem",
                    color: "var(--color-text-muted)",
                    textAlign: "right",
                    opacity: 0.6,
                  }}
                >
                  ID: {sessionId}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
