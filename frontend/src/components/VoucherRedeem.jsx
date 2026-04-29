import { useState } from "react";
import { createPortal } from "react-dom";
import { redeemVoucher } from "../services/api";

export default function VoucherRedeem({ onSuccess, onError, onUpgrade }) {
	const [code, setCode] = useState("");
	const [loading, setLoading] = useState(false);
	const [showSuccess, setShowSuccess] = useState(false);
	const [message, setMessage] = useState("");

	const handleSubmit = async (e) => {
		e.preventDefault();
		if (!code.trim()) return;

		setLoading(true);
		setMessage("");

		try {
			const result = await redeemVoucher(code.trim());
			setShowSuccess(true);
			setCode("");
			if (onSuccess) {
				onSuccess(result);
			}
			if (onUpgrade) {
				onUpgrade();
			}
		} catch (err) {
			const errorMsg =
				err.response?.data?.message ||
				err.message ||
				"Failed to redeem voucher";
			setMessage(errorMsg);
			if (onError) {
				onError(errorMsg);
			}
		} finally {
			setLoading(false);
		}
	};

	const canSubmit = code.trim().length > 0 && !loading;

	return (
		<>
			<div
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
					type="button"
					onClick={handleSubmit}
					disabled={!canSubmit}
					style={{
						padding: "6px 12px",
						borderRadius: "0.5rem",
						border: "none",
						background: canSubmit
							? "var(--color-accent)"
							: "var(--color-bg-secondary)",
						color: canSubmit
							? "var(--color-bg-primary)"
							: "var(--color-text-muted)",
						fontSize: "0.75rem",
						fontWeight: 500,
						cursor: canSubmit ? "pointer" : "not-allowed",
						transition: "all 150ms",
						opacity: canSubmit ? 1 : 0.6,
					}}
				>
					{loading ? "..." : "Redeem"}
				</button>
			</div>

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
							backdropFilter: "blur(4px)",
							zIndex: 9999,
						}}
						onClick={() => setShowSuccess(false)}
					>
						{/** biome-ignore lint/a11y/noStaticElementInteractions: AI Generated */}
						{/** biome-ignore lint/a11y/useKeyWithClickEvents: AI Generated */}
						<div
							className="glass-card glass-refraction"
							style={{
								padding: "40px 48px",
								textAlign: "center",
								maxWidth: "400px",
								margin: "auto",
								position: "relative",
								transform: "none",
								background: "var(--color-bg-primary)",
							}}
							onClick={(e) => e.stopPropagation()}
						>
							<div
								style={{
									width: "64px",
									height: "64px",
									borderRadius: "50%",
									background:
										"linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
									display: "flex",
									alignItems: "center",
									justifyContent: "center",
									margin: "0 auto 24px",
									fontSize: "32px",
								}}
							>
								✨
							</div>
							<h3
								style={{
									fontSize: "1.4rem",
									fontWeight: 600,
									marginBottom: "12px",
									color: "var(--color-text-primary)",
								}}
							>
								Upgrade Successful!
							</h3>
							<p
								style={{
									fontSize: "0.9rem",
									color: "var(--color-text-muted)",
									marginBottom: "16px",
									lineHeight: 1.6,
								}}
							>
								Your rate limit has been upgraded to <br />
								<span style={{ fontWeight: 600, color: "var(--color-accent)" }}>
									20 requests / hour
								</span>
							</p>
							<button
								type="button"
								onClick={() => setShowSuccess(false)}
								className="btn-primary"
								style={{
									padding: "10px 24px",
									fontSize: "0.85rem",
								}}
							>
								Continue
							</button>
						</div>
					</div>,
					document.body,
				)}
		</>
	);
}
