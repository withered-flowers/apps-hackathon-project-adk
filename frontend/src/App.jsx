import { useCallback, useState } from "react";
import "./index.css";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";

import AgentStatusBadge from "./components/AgentStatusBadge";
import ChatInterface from "./components/ChatInterface";
import DecisionMatrix from "./components/DecisionMatrix";
import ExportButton from "./components/ExportButton";
import { ErrorBanner } from "./components/LoadingSpinner";
import { newSession, sendMessage } from "./services/api";

export default function App() {
	const [sessionId, setSessionId] = useState("");
	const [messages, setMessages] = useState([]);
	const [loading, setLoading] = useState(false);
	const [status, setStatus] = useState("Interviewing");
	const [agent, setAgent] = useState("");
	const [matrix, setMatrix] = useState(null);
	const [error, setError] = useState("");

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
				const data = await sendMessage(sid, text);

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
	};

	const hasMatrix = matrix?.options?.length > 0;

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				minHeight: "100dvh",
				background: "var(--color-bg-primary)",
				color: "var(--color-text-primary)",
			}}
		>
			<header
				className="glass-refraction"
				style={{
					position: "sticky",
					top: 0,
					zIndex: 50,
					padding: "16px 32px",
					display: "flex",
					alignItems: "center",
					justifyContent: "space-between",
					background: "rgba(9, 9, 11, 0.8)",
					backdropFilter: "blur(20px)",
					borderBottom: "1px solid var(--color-border)",
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
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
				</div>
				<div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
					<AgentStatusBadge agent={agent} status={status} />
					<button
						type="button"
						className="btn-secondary"
						onClick={handleNewDecision}
						style={{ padding: "8px 16px", fontSize: "0.8rem" }}
					>
						New Session
					</button>
				</div>
			</header>

			<main
				style={{
					flex: 1,
					display: "grid",
					gridTemplateColumns: hasMatrix ? "minmax(400px, 1fr) 1fr" : "1fr",
					gap: "1px",
					background: "var(--color-border)",
				}}
			>
				<div
					style={{
						background: "var(--color-bg-primary)",
						display: "flex",
						flexDirection: "column",
						overflow: "hidden",
					}}
				>
					{error && (
						<div style={{ padding: "16px 24px 0" }}>
							<ErrorBanner message={error} onDismiss={() => setError("")} />
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
