/**
 * Login — Firebase Authentication login component.
 *
 * Supports Email/Password, Google OAuth, and Guest (anonymous) logins.
 * Matches the existing Decidely glassmorphism design language.
 */

import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Login() {
  const { loginWithEmail, signupWithEmail, loginWithGoogle, loginAsGuest } =
    useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignup, setIsSignup] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isSignup) {
        await signupWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err) {
      const code = err.code || "";
      const messages = {
        "auth/user-not-found": "No account found with this email.",
        "auth/wrong-password": "Incorrect password.",
        "auth/invalid-credential": "Invalid email or password.",
        "auth/email-already-in-use": "An account with this email already exists.",
        "auth/weak-password": "Password must be at least 6 characters.",
        "auth/invalid-email": "Please enter a valid email address.",
      };
      setError(messages[code] || err.message || "Authentication failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setLoading(true);
    try {
      await loginWithGoogle();
    } catch (err) {
      if (err.code !== "auth/popup-closed-by-user") {
        setError(err.message || "Google sign-in failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = async () => {
    setError("");
    setLoading(true);
    try {
      await loginAsGuest();
    } catch (err) {
      setError(err.message || "Guest login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      id="login-container"
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "100dvh",
        background: "var(--color-bg-primary)",
        padding: "24px",
      }}
    >
      <div
        className="glass-card glass-refraction"
        style={{
          width: "100%",
          maxWidth: "420px",
          padding: "40px 32px",
          display: "flex",
          flexDirection: "column",
          gap: "24px",
        }}
      >
        {/* ── Brand ── */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "8px",
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
                fontSize: "1.4rem",
                fontWeight: 600,
                letterSpacing: "-0.03em",
              }}
            >
              Decidely
            </h1>
          </div>
          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--color-text-muted)",
              lineHeight: 1.5,
            }}
          >
            Multi-agent decision support system
          </p>
        </div>

        {/* ── Error Banner ── */}
        {error && (
          <div
            id="login-error"
            style={{
              padding: "10px 14px",
              borderRadius: "0.75rem",
              background: "rgba(239, 68, 68, 0.08)",
              border: "1px solid rgba(239, 68, 68, 0.2)",
              color: "#ef4444",
              fontSize: "0.8rem",
              lineHeight: 1.4,
            }}
          >
            {error}
          </div>
        )}

        {/* ── Email/Password Form ── */}
        <form
          onSubmit={handleEmailAuth}
          style={{ display: "flex", flexDirection: "column", gap: "12px" }}
        >
          <input
            id="login-email"
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            style={{
              padding: "12px 16px",
              borderRadius: "0.75rem",
              border: "1px solid var(--color-border)",
              background: "var(--color-bg-secondary)",
              color: "var(--color-text-primary)",
              fontSize: "0.85rem",
              outline: "none",
              transition: "border-color 150ms",
            }}
          />
          <input
            id="login-password"
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            autoComplete={isSignup ? "new-password" : "current-password"}
            style={{
              padding: "12px 16px",
              borderRadius: "0.75rem",
              border: "1px solid var(--color-border)",
              background: "var(--color-bg-secondary)",
              color: "var(--color-text-primary)",
              fontSize: "0.85rem",
              outline: "none",
              transition: "border-color 150ms",
            }}
          />
          <button
            id="login-submit"
            type="submit"
            className="btn-primary"
            disabled={loading}
            style={{ width: "100%", marginTop: "4px" }}
          >
            {loading ? "..." : isSignup ? "Create Account" : "Sign In"}
          </button>
        </form>

        {/* ── Toggle sign-in/sign-up ── */}
        <div style={{ textAlign: "center" }}>
          <button
            id="login-toggle-mode"
            type="button"
            onClick={() => {
              setIsSignup(!isSignup);
              setError("");
            }}
            style={{
              background: "none",
              border: "none",
              color: "var(--color-accent)",
              fontSize: "0.8rem",
              cursor: "pointer",
              padding: "4px",
            }}
          >
            {isSignup
              ? "Already have an account? Sign in"
              : "Don't have an account? Create one"}
          </button>
        </div>

        {/* ── Divider ── */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              flex: 1,
              height: "1px",
              background: "var(--color-border)",
            }}
          />
          <span
            style={{
              fontSize: "0.75rem",
              color: "var(--color-text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            or
          </span>
          <div
            style={{
              flex: 1,
              height: "1px",
              background: "var(--color-border)",
            }}
          />
        </div>

        {/* ── Social / Guest ── */}
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          <button
            id="login-google"
            type="button"
            className="btn-secondary"
            onClick={handleGoogle}
            disabled={loading}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              padding: "12px 16px",
            }}
          >
            <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
              <path
                fill="#EA4335"
                d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
              />
              <path
                fill="#4285F4"
                d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
              />
              <path
                fill="#FBBC05"
                d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
              />
              <path
                fill="#34A853"
                d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
              />
            </svg>
            Continue with Google
          </button>

          <button
            id="login-guest"
            type="button"
            className="btn-secondary"
            onClick={handleGuest}
            disabled={loading}
            style={{
              width: "100%",
              padding: "12px 16px",
              fontSize: "0.8rem",
              color: "var(--color-text-muted)",
            }}
          >
            Continue as Guest
          </button>
        </div>

        {/* ── Footer note ── */}
        <p
          style={{
            textAlign: "center",
            fontSize: "0.7rem",
            color: "var(--color-text-muted)",
            lineHeight: 1.5,
          }}
        >
          Guest sessions share a common decision pool.
          <br />
          Sign in for private, isolated decisions.
        </p>
      </div>
    </div>
  );
}
