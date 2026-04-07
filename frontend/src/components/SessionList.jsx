import { useCallback, useEffect, useState } from "react";
import { getHistory, getRecentSessions } from "../services/api";

export default function SessionList({ onSelectSession }) {
	const [sessions, setSessions] = useState([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		getRecentSessions()
			.then(setSessions)
			.catch(() => setSessions([]))
			.finally(() => setLoading(false));
	}, []);

	const handleSelect = useCallback(
		async (sessionId) => {
			try {
				const history = await getHistory(sessionId);
				onSelectSession({
					sessionId,
					messages: history.messages.map((m) => ({
						role: m.role,
						content: m.content,
						agent: m.agent,
					})),
					matrix:
						history.matrix?.options?.length > 0 ? history.matrix : null,
					status: sessions.find((s) => s.session_id === sessionId)?.status ?? "Complete",
				});
			} catch {
				// ignore
			}
		},
		[onSelectSession, sessions],
	);

	if (loading) {
		return (
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					gap: "8px",
					padding: "16px",
				}}
			>
				{[1, 2, 3].map((i) => (
					<div key={i} className="shimmer-box" style={{ height: "48px", borderRadius: "8px" }} />
				))}
			</div>
		);
	}

	if (sessions.length === 0) {
		return (
			<div
				style={{
					padding: "24px 16px",
					textAlign: "center",
					color: "var(--color-text-muted)",
					fontSize: "0.85rem",
				}}
			>
				No previous sessions found.
			</div>
		);
	}

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "4px", padding: "8px" }}>
			{sessions.map((s) => (
				<button
					key={s.session_id}
					type="button"
					onClick={() => handleSelect(s.session_id)}
					style={{
						background: "transparent",
						border: "1px solid var(--color-border)",
						borderRadius: "8px",
						padding: "12px 16px",
						textAlign: "left",
						cursor: "pointer",
						color: "var(--color-text-primary)",
						transition: "all var(--transition-fast)",
						display: "flex",
						flexDirection: "column",
						gap: "4px",
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.background = "var(--color-bg-card-hover)";
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.background = "transparent";
					}}
				>
					<span
						style={{
							fontSize: "0.85rem",
							fontWeight: 500,
							overflow: "hidden",
							textOverflow: "ellipsis",
							whiteSpace: "nowrap",
						}}
					>
						{s.topic || "Untitled session"}
					</span>
					<div
						style={{
							display: "flex",
							alignItems: "center",
							gap: "8px",
							fontSize: "0.7rem",
							color: "var(--color-text-muted)",
						}}
					>
						<span
							className="font-mono"
							style={{
								color: s.status === "Complete" ? "var(--color-accent)" : "var(--color-text-muted)",
							}}
						>
							{s.status}
						</span>
						<span>·</span>
						<span className="font-mono">
							{s.session_id.slice(0, 8)}
						</span>
					</div>
				</button>
			))}
		</div>
	);
}
