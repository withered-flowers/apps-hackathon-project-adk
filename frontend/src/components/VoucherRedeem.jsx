import { useState } from "react";
import { redeemVoucher } from "../services/api";

export default function VoucherRedeem({ onSuccess, onError }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setMessage("");

    try {
      const result = await redeemVoucher(code.trim());
      setMessage(result.message || "Voucher redeemed successfully!");
      setCode("");
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to redeem voucher";
      setMessage(errorMsg);
      if (onError) {
        onError(errorMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "6px",
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Voucher code"
          disabled={loading}
          style={{
            padding: "6px 10px",
            borderRadius: "0.5rem",
            border: "1px solid var(--color-border)",
            background: "var(--color-bg-secondary)",
            color: "var(--color-text-primary)",
            fontSize: "0.75rem",
            width: "100px",
            outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={loading || !code.trim()}
          style={{
            padding: "6px 12px",
            borderRadius: "0.5rem",
            border: "none",
            background: loading ? "var(--color-bg-secondary)" : "var(--color-accent)",
            color: loading ? "var(--color-text-muted)" : "var(--color-bg-primary)",
            fontSize: "0.75rem",
            fontWeight: 500,
            cursor: loading ? "not-allowed" : "pointer",
            transition: "opacity 150ms",
          }}
        >
          {loading ? "..." : "Redeem"}
        </button>
      </form>
      {message && (
        <div
          style={{
            fontSize: "0.7rem",
            color: message.includes("error") || message.includes("Failed")
              ? "#ef4444"
              : "#22c55e",
            padding: "4px 0",
          }}
        >
          {message}
        </div>
      )}
    </div>
  );
}