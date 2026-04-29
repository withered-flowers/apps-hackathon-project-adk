import { useState } from "react";
import { createPortal } from "react-dom";
import { redeemVoucher } from "../services/api";

export default function VoucherRedeem({
	isUpgraded,
	onSuccess,
	onError,
	onUpgrade,
	variant = "full",
}) {
	const [code, setCode] = useState("");
	const [loading, setLoading] = useState(false);
	const [showSuccess, setShowSuccess] = useState(false);
	const [message, setMessage] = useState("");

	const handleSubmit = async (e) => {
		if (e) e.preventDefault();
		if (!code.trim()) return;

		setLoading(true);
		setMessage("");

		try {
			await redeemVoucher(code.trim());
			setShowSuccess(true);
			setCode("");
			if (onSuccess) onSuccess();
			if (onUpgrade) onUpgrade();
		} catch (err) {
			const errorMsg =
				err.response?.data?.message ||
				err.message ||
				"Failed to redeem voucher";
			setMessage(errorMsg);
			if (onError) onError(errorMsg);
		} finally {
			setLoading(false);
		}
	};

	const canSubmit = code.trim().length > 0 && !loading;

	if (variant === "compact" && !isUpgraded) {
		return (
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: "6px",
					height: "36px",
					padding: "2px",
					background: "var(--color-bg-secondary)",
					borderRadius: "8px",
					border: "1px solid var(--color-border)",
				}}
			>
				<input
					type="text"
					value={code}
					onChange={(e) => setCode(e.target.value.toUpperCase())}
					placeholder="Voucher"
					disabled={loading}
					style={{
						width: "80px",
						padding: "4px 8px",
						background: "transparent",
						border: "none",
						color: "var(--color-text-primary)",
						fontSize: "0.75rem",
						outline: "none",
					}}
				/>
				<button
					type="button"
					onClick={handleSubmit}
					disabled={!canSubmit}
					style={{
						height: "28px",
						padding: "0 10px",
						borderRadius: "6px",
						border: "none",
						background: canSubmit ? "var(--color-accent)" : "transparent",
						color: canSubmit
							? "var(--color-bg-primary)"
							: "var(--color-text-muted)",
						fontSize: "0.7rem",
						fontWeight: 600,
						cursor: canSubmit ? "pointer" : "default",
						transition: "all 0.2s",
					}}
				>
					{loading ? "..." : "Redeem"}
				</button>
			</div>
		);
	}

	return (
		<>
			{!isUpgraded && (
				<div style={{ width: "100%" }}>
					<form
						onSubmit={handleSubmit}
						style={{
							display: "flex",
							flexDirection: "column",
							gap: "8px",
						}}
					>
						<div
							style={{
								fontSize: "0.65rem",
								textTransform: "uppercase",
								letterSpacing: "0.05em",
								color: "var(--color-text-muted)",
								fontWeight: 600,
							}}
						>
							Redeem Upgrade
						</div>
						<div
							style={{
								display: "flex",
								alignItems: "center",
								gap: "8px",
								position: "relative",
							}}
						>
							<input
								type="text"
								value={code}
								onChange={(e) => setCode(e.target.value.toUpperCase())}
								placeholder="Enter code (e.g. DEMO)"
								disabled={loading}
								style={{
									flex: 1,
									padding: "10px 14px",
									borderRadius: "10px",
									border: "1px solid var(--color-border)",
									background: "var(--color-bg-secondary)",
									color: "var(--color-text-primary)",
									fontSize: "0.85rem",
									outline: "none",
									transition: "border-color 0.2s",
								}}
								onFocus={(e) =>
									(e.target.style.borderColor = "var(--color-accent)")
								}
								onBlur={(e) =>
									(e.target.style.borderColor = "var(--color-border)")
								}
							/>
							<button
								type="submit"
								disabled={!canSubmit}
								style={{
									padding: "10px 20px",
									borderRadius: "10px",
									border: "none",
									background: canSubmit
										? "var(--color-accent)"
										: "var(--color-bg-secondary)",
									color: canSubmit
										? "var(--color-bg-primary)"
										: "var(--color-text-muted)",
									fontSize: "0.85rem",
									fontWeight: 600,
									cursor: canSubmit ? "pointer" : "not-allowed",
									transition: "all 0.2s",
									boxShadow: canSubmit
										? "0 4px 12px -4px var(--color-accent)"
										: "none",
								}}
							>
								{loading ? "..." : "Redeem"}
							</button>
						</div>
						{message && (
							<div
								style={{
									fontSize: "0.7rem",
									color: "#ef4444",
									padding: "4px 8px",
								}}
							>
								{message}
							</div>
						)}
					</form>
				</div>
			)}

			{showSuccess &&
				createPortal(
					// biome-ignore lint/a11y/noStaticElementInteractions: AI Generated
					// biome-ignore lint/a11y/useKeyWithClickEvents: AI Generated
					<div
						style={{
							position: "fixed",
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							background: "rgba(0, 0, 0, 0.5)",
							backdropFilter: "blur(8px)",
							zIndex: 9999,
						}}
						onClick={() => setShowSuccess(false)}
					>
						{/** biome-ignore lint/a11y/noStaticElementInteractions: AI Generated */}
						{/** biome-ignore lint/a11y/useKeyWithClickEvents: AI Generated */}
						<div
							className="glass-card glass-refraction"
							style={{
								padding: "40px",
								textAlign: "center",
								maxWidth: "360px",
								width: "90%",
								background: "var(--color-bg-primary)",
								borderRadius: "24px",
								boxShadow: "0 24px 48px -12px rgba(0,0,0,0.5)",
							}}
							onClick={(e) => e.stopPropagation()}
						>
							<div
								style={{
									width: "72px",
									height: "72px",
									borderRadius: "24px",
									background:
										"linear-gradient(135deg, #10b981 0%, #059669 100%)",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									margin: "0 auto 24px",
									fontSize: "32px",
									boxShadow: "0 12px 24px -6px rgba(16, 185, 129, 0.4)",
								}}
							>
								🚀
							</div>
							<h3
								style={{
									fontSize: "1.5rem",
									fontWeight: 700,
									marginBottom: "12px",
									color: "var(--color-text-primary)",
									letterSpacing: "-0.02em",
								}}
							>
								Power Up!
							</h3>
							<p
								style={{
									fontSize: "0.95rem",
									color: "var(--color-text-muted)",
									marginBottom: "24px",
									lineHeight: 1.6,
								}}
							>
								Your limit is now{" "}
								<span
									style={{
										fontWeight: 700,
										color: "var(--color-text-primary)",
									}}
								>
									20 requests
								</span>{" "}
								per hour.
							</p>
							<button
								type="button"
								onClick={() => setShowSuccess(false)}
								className="btn-primary"
								style={{
									width: "100%",
									padding: "14px",
									fontSize: "1rem",
									fontWeight: 600,
									borderRadius: "14px",
								}}
							>
								Start Deciding
							</button>
						</div>
					</div>,
					document.body,
				)}
		</>
	);
}
