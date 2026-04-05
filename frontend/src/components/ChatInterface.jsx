/** biome-ignore-all lint/suspicious/noArrayIndexKey: Generated code */
import {
	ActivityLogIcon,
	ComponentBooleanIcon,
	MagicWandIcon,
	MagnifyingGlassIcon,
	PersonIcon,
} from "@radix-ui/react-icons";
// eslint-disable-next-line no-unused-vars
import { AnimatePresence, motion } from "framer-motion";
import { memo, useEffect, useRef, useState } from "react";
import { TypingIndicator } from "./LoadingSpinner";

export default function ChatInterface({ messages, loading, onSend, disabled }) {
	const [input, setInput] = useState("");
	const bottomRef = useRef(null);
	const inputRef = useRef(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: Generated code
	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages, loading]);

	useEffect(() => {
		if (!disabled) inputRef.current?.focus();
	}, [disabled]);

	const handleSubmit = (e) => {
		e.preventDefault();
		const trimmed = input.trim();
		if (!trimmed || loading || disabled) return;
		onSend(trimmed);
		setInput("");
	};

	const handleKeyDown = (e) => {
		if (e.key === "Enter" && !e.shiftKey) {
			e.preventDefault();
			handleSubmit(e);
		}
	};

	return (
		<div
			style={{
				display: "flex",
				flexDirection: "column",
				height: "100%",
				minHeight: 0,
			}}
		>
			<div
				style={{
					flex: 1,
					overflowY: "auto",
					padding: "32px 24px",
					display: "flex",
					flexDirection: "column",
					gap: "24px",
				}}
			>
				{messages.length === 0 && (
					<motion.div
						initial={{ opacity: 0, y: 10 }}
						animate={{
							opacity: 1,
							y: 0,
							transition: { type: "spring", damping: 25 },
						}}
						style={{
							display: "flex",
							flexDirection: "column",
							justifyContent: "center",
							height: "100%",
							gap: "24px",
							paddingBottom: "40px",
							maxWidth: "480px",
							margin: "0 auto",
						}}
					>
						<div style={{ fontSize: "1.5rem", opacity: 0.2 }}>
							<ActivityLogIcon width={48} height={48} />
						</div>
						<h2
							style={{
								fontSize: "2rem",
								fontWeight: 500,
								letterSpacing: "-0.04em",
								lineHeight: 1.1,
							}}
						>
							Formulate
							<br />
							Objective.
						</h2>
						<p
							style={{
								color: "var(--color-text-secondary)",
								fontSize: "0.95rem",
								lineHeight: 1.6,
							}}
						>
							Define the parameters of your decision. The advisory network will
							compute options and extract qualitative matrices.
						</p>

						<div
							style={{
								display: "flex",
								flexDirection: "column",
								gap: "8px",
								marginTop: "16px",
							}}
						>
							{[
								"Execute hardware acquisition analysis: Laptop",
								"Compute optimal learning path for Rust",
								"Analyze cloud deployment architectures",
							].map((sugg, i) => (
								<motion.button
									key={sugg}
									initial={{ opacity: 0, scale: 0.98 }}
									animate={{
										opacity: 1,
										scale: 1,
										transition: { delay: i * 0.1 },
									}}
									className="btn-secondary"
									style={{
										textAlign: "left",
										padding: "12px 16px",
										fontSize: "0.82rem",
										borderColor: "rgba(255,255,255,0.05)",
									}}
									onClick={() => {
										setInput(sugg);
										inputRef.current?.focus();
									}}
								>
									{sugg}
								</motion.button>
							))}
						</div>
					</motion.div>
				)}

				<AnimatePresence initial={false}>
					{messages.map((msg, idx) => (
						<MessageBubble key={idx} message={msg} />
					))}
					{loading && (
						<motion.div
							layout
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: -10 }}
							style={{ display: "flex", gap: "16px", maxWidth: "85%" }}
						>
							<AgentAvatar agent="..." />
							<div style={{ display: "flex", alignItems: "center" }}>
								<TypingIndicator />
							</div>
						</motion.div>
					)}
				</AnimatePresence>

				<div ref={bottomRef} />
			</div>

			<div style={{ padding: "24px", background: "var(--color-bg-primary)" }}>
				<form onSubmit={handleSubmit} style={{ position: "relative" }}>
					<textarea
						ref={inputRef}
						value={input}
						onChange={(e) => setInput(e.target.value)}
						onKeyDown={handleKeyDown}
						placeholder={
							disabled ? "Advisory session complete." : "Input parameters..."
						}
						disabled={disabled || loading}
						rows={1}
						style={{
							width: "100%",
							resize: "none",
							background: "var(--color-bg-card)",
							border: "1px solid var(--color-border)",
							borderRadius: "24px",
							padding: "16px 64px 16px 20px",
							color: "var(--color-text-primary)",
							fontSize: "0.9rem",
							fontFamily: "inherit",
							outline: "none",
							transition: "border-color var(--transition-fast)",
							lineHeight: 1.5,
							maxHeight: "160px",
						}}
						onFocus={(e) =>
							(e.target.style.borderColor = "var(--color-text-muted)")
						}
						onBlur={(e) => (e.target.style.borderColor = "var(--color-border)")}
					/>
					<button
						type="submit"
						disabled={!input.trim() || loading || disabled}
						style={{
							position: "absolute",
							right: "12px",
							top: "50%",
							transform: "translateY(-50%)",
							background: "var(--color-text-primary)",
							color: "var(--color-bg-primary)",
							width: "32px",
							height: "32px",
							borderRadius: "50%",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							border: "none",
							cursor:
								!input.trim() || loading || disabled
									? "not-allowed"
									: "pointer",
							opacity: !input.trim() || loading || disabled ? 0.3 : 1,
							transition: "all var(--transition-fast)",
						}}
					>
						<svg
							width="12"
							height="12"
							viewBox="0 0 15 15"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<title>Send</title>
							<path
								d="M8.14645 3.14645C8.34171 2.95118 8.65829 2.95118 8.85355 3.14645L12.8536 7.14645C13.0488 7.34171 13.0488 7.65829 12.8536 7.85355L8.85355 11.8536C8.65829 12.0488 8.34171 12.0488 8.14645 11.8536C7.95118 11.6583 7.95118 11.3417 8.14645 11.1464L11.2929 8H2.5C2.22386 8 2 7.77614 2 7.5C2 7.22386 2.22386 7 2.5 7H11.2929L8.14645 3.85355C7.95118 3.65829 7.95118 3.34171 8.14645 3.14645Z"
								fill="currentColor"
								fillRule="evenodd"
								clipRule="evenodd"
							></path>
						</svg>
					</button>
				</form>
			</div>
		</div>
	);
}

const AgentAvatar = memo(({ agent }) => {
	let Icon = ActivityLogIcon;
	if (agent === "InterviewerAgent") Icon = PersonIcon;
	else if (agent === "ResearcherAgent") Icon = MagnifyingGlassIcon;
	else if (agent === "EvaluatorAgent") Icon = ComponentBooleanIcon;
	else if (agent === "SupporterAgent") Icon = MagicWandIcon;

	return (
		<div
			style={{
				width: "24px",
				height: "24px",
				borderRadius: "6px",
				background: "var(--color-bg-card)",
				border: "1px solid var(--color-border)",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				flexShrink: 0,
				color: "var(--color-text-secondary)",
			}}
		>
			<Icon width={14} height={14} />
		</div>
	);
});

function MessageBubble({ message }) {
	const isUser = message.role === "user";
	return (
		<motion.div
			layout
			initial={{ opacity: 0, y: 10, scale: 0.98 }}
			animate={{ opacity: 1, y: 0, scale: 1 }}
			style={{
				display: "flex",
				flexDirection: isUser ? "row-reverse" : "row",
				gap: "16px",
				maxWidth: "85%",
				alignSelf: isUser ? "flex-end" : "flex-start",
			}}
		>
			{!isUser && <AgentAvatar agent={message.agent} />}
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					gap: "6px",
					width: "100%",
				}}
			>
				{!isUser && message.agent && (
					<span
						className="font-mono"
						style={{
							fontSize: "0.65rem",
							color: "var(--color-text-muted)",
							textTransform: "uppercase",
							letterSpacing: "0.05em",
						}}
					>
						{message.agent.replace("Agent", "")}
					</span>
				)}
				<div
					className={isUser ? "bubble-user" : "bubble-assistant"}
					style={{
						padding: isUser ? "12px 16px" : "0",
						fontSize: "0.9rem",
						lineHeight: 1.6,
						whiteSpace: "pre-wrap",
						wordBreak: "break-word",
					}}
				>
					{message.content}
				</div>
			</div>
		</motion.div>
	);
}
