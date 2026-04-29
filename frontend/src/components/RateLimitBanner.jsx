export default function RateLimitBanner({
	tier,
	remaining,
	limit,
	variant = "full",
}) {
	const percentage = (remaining / limit) * 100;
	const isWarning = remaining <= 2 && remaining > 0;
	const isExhausted = remaining === 0;

	const getStatusColor = () => {
		if (isExhausted) return "#ef4444";
		if (isWarning) return "#f59e0b";
		return "var(--color-accent)";
	};

	if (variant === "compact") {
		return (
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: "12px",
					padding: "4px 12px",
					background: "var(--color-bg-secondary)",
					borderRadius: "8px",
					border: "1px solid var(--color-border)",
					height: "36px",
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
					<span
						style={{
							fontSize: "0.65rem",
							color: "var(--color-text-muted)",
							fontWeight: 600,
							textTransform: "uppercase",
						}}
					>
						{tier}
					</span>
					<span
						style={{
							fontSize: "0.85rem",
							fontWeight: 700,
							color: getStatusColor(),
						}}
					>
						{remaining}
					</span>
					<span
						style={{ fontSize: "0.7rem", color: "var(--color-text-muted)" }}
					>
						/ {limit}
					</span>
				</div>
				<div
					style={{
						width: "40px",
						height: "4px",
						background: "rgba(255,255,255,0.05)",
						borderRadius: "2px",
						overflow: "hidden",
					}}
				>
					<div
						style={{
							width: `${percentage}%`,
							height: "100%",
							background: getStatusColor(),
						}}
					/>
				</div>
			</div>
		);
	}

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				gap: "8px",
				width: "100%",
			}}
		>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "flex-end",
				}}
			>
				<div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
					<span
						style={{
							fontSize: "0.65rem",
							textTransform: "uppercase",
							letterSpacing: "0.05em",
							color: "var(--color-text-muted)",
							fontWeight: 600,
						}}
					>
						Current Tier
					</span>
					<span
						style={{
							fontSize: "0.9rem",
							fontWeight: 600,
							color: "var(--color-text-primary)",
						}}
					>
						{tier.charAt(0).toUpperCase() + tier.slice(1)}
					</span>
				</div>
				<div style={{ textAlign: "right" }}>
					<span
						style={{
							fontSize: "1rem",
							fontWeight: 700,
							color: getStatusColor(),
						}}
					>
						{remaining}
					</span>
					<span
						style={{
							fontSize: "0.75rem",
							color: "var(--color-text-muted)",
							marginLeft: "2px",
						}}
					>
						/ {limit}
					</span>
					<div
						style={{
							fontSize: "0.6rem",
							color: "var(--color-text-muted)",
							marginTop: "-2px",
						}}
					>
						requests left
					</div>
				</div>
			</div>

			<div
				style={{
					height: "6px",
					width: "100%",
					background: "var(--color-bg-secondary)",
					borderRadius: "3px",
					overflow: "hidden",
					border: "1px solid var(--color-border)",
				}}
			>
				<div
					style={{
						height: "100%",
						width: `${percentage}%`,
						background: getStatusColor(),
						borderRadius: "3px",
						transition: "width 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
					}}
				/>
			</div>

			{isExhausted && (
				<div
					style={{
						fontSize: "0.7rem",
						color: "#ef4444",
						marginTop: "4px",
						display: "flex",
						alignItems: "center",
						gap: "4px",
					}}
				>
					<span>⚠️</span> Limit reached. Use code <b>DEMO</b> to upgrade.
				</div>
			)}
		</div>
	);
}
