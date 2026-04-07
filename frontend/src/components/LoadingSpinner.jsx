export function LoadingSpinner({ size = 16 }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			style={{ animation: "spin 1s linear infinite" }}
		>
			<title>Loading</title>
			<style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
			<circle
				cx="12"
				cy="12"
				r="10"
				stroke="var(--color-border)"
				strokeWidth="2.5"
			/>
			<path
				d="M12 2 A10 10 0 0 1 22 12"
				stroke="var(--color-text-primary)"
				strokeWidth="2.5"
				strokeLinecap="round"
			/>
		</svg>
	);
}

export function TypingIndicator() {
	return (
		<div
			className="shimmer-box"
			style={{ width: "80px", height: "20px", borderRadius: "4px" }}
		/>
	);
}

export function ErrorBanner({ message, onDismiss }) {
	if (!message) return null;
	return (
		<div
			style={{
				background: "rgba(239, 68, 68, 0.05)",
				border: "1px solid rgba(239, 68, 68, 0.15)",
				borderRadius: "8px",
				padding: "12px 16px",
				display: "flex",
				alignItems: "flex-start",
				gap: "12px",
				fontSize: "0.85rem",
				color: "#fca5a5",
			}}
		>
			<span style={{ marginTop: "2px" }}>!</span>
			<span style={{ flex: 1, lineHeight: 1.5 }}>{message}</span>
			{onDismiss && (
				<button
					type="button"
					onClick={onDismiss}
					style={{
						background: "none",
						border: "none",
						color: "#fca5a5",
						cursor: "pointer",
						opacity: 0.7,
					}}
				>
					✕
				</button>
			)}
		</div>
	);
}
