/** biome-ignore-all lint/suspicious/noArrayIndexKey: Generated code */

// eslint-disable-next-line no-unused-vars
import { motion } from "framer-motion";
import { useMemo } from "react";

export default function DecisionMatrix({ matrix }) {
	const options = useMemo(() => matrix?.options ?? [], [matrix]);
	const criteria = matrix?.criteria ?? [];
	const criteriaNames = criteria.map((c) => c.name || c);

	const maxScore = useMemo(
		() => Math.max(0, ...options.map((o) => o.weighted_score ?? 0)),
		[options],
	);

	if (!matrix || !options.length) return null;

	return (
		<motion.div
			initial={{ opacity: 0, scale: 0.98 }}
			animate={{ opacity: 1, scale: 1 }}
			className="glass-card glass-refraction"
			style={{ padding: "32px", overflow: "hidden" }}
		>
			<div
				style={{
					marginBottom: "24px",
					display: "flex",
					alignItems: "center",
					gap: "12px",
				}}
			>
				<h3
					style={{
						fontSize: "1.25rem",
						fontWeight: 500,
						letterSpacing: "-0.02em",
						color: "var(--color-text-primary)",
					}}
				>
					Matrix Evaluation
				</h3>
			</div>

			<div
				style={{
					overflowX: "auto",
					borderRadius: "12px",
					border: "1px solid var(--color-border)",
					background: "var(--matrix-bg)",
				}}
			>
				<table className="matrix-table">
					<thead style={{ background: "var(--status-bg)" }}>
						<tr>
							<th style={{ minWidth: "180px" }}>Subject Target</th>
							{criteriaNames.map((name) => (
								<th key={name}>{name}</th>
							))}
							<th style={{ textAlign: "center" }}>Total Rank</th>
							<th>Reference</th>
						</tr>
					</thead>
					<tbody>
						{options.map((opt, idx) => {
							const isTop = opt.weighted_score === maxScore;
							return (
								<tr
									key={idx}
									style={{
										background: isTop ? "var(--status-bg)" : "transparent",
									}}
								>
									<td>
										<div
											style={{
												display: "flex",
												alignItems: "center",
												gap: "12px",
											}}
										>
											{isTop && (
												<div
													style={{
														width: "4px",
														height: "16px",
														background: "var(--color-accent)",
														borderRadius: "2px",
													}}
												/>
											)}
											<span
												style={{
													color: isTop
														? "var(--color-text-primary)"
														: "var(--color-text-secondary)",
													fontWeight: isTop ? 500 : 400,
													fontSize: "0.9rem",
												}}
											>
												{opt.title}
											</span>
										</div>
									</td>
									{criteriaNames.map((name) => {
										const score = opt.scores?.[name] ?? "—";
										return (
											<td key={name}>
												{typeof score === "number" ? (
													<span
														className="font-mono"
														style={{
															fontSize: "0.8rem",
															color: isTop
																? "var(--color-text-primary)"
																: "var(--color-text-secondary)",
														}}
													>
														{score.toFixed(1)}
													</span>
												) : (
													<span style={{ color: "var(--color-text-muted)" }}>
														—
													</span>
												)}
											</td>
										);
									})}
									<td style={{ textAlign: "center" }}>
										<span
											className="font-mono"
											style={{
												color: isTop
													? "var(--color-accent)"
													: "var(--color-text-primary)",
												fontSize: "0.9rem",
												fontWeight: 500,
											}}
										>
											{typeof opt.weighted_score === "number"
												? opt.weighted_score.toFixed(2)
												: "—"}
										</span>
									</td>
									<td>
										{opt.url ? (
											<a
												href={opt.url}
												target="_blank"
												rel="noopener noreferrer"
												style={{
													color: "var(--color-text-muted)",
													fontSize: "0.8rem",
													textDecoration: "none",
													borderBottom: "1px solid var(--matrix-border)",
												}}
											>
												[Ext Link]
											</a>
										) : (
											<span style={{ color: "var(--color-text-muted)" }}>
												—
											</span>
										)}
									</td>
								</tr>
							);
						})}
					</tbody>
				</table>
			</div>

			{options.length > 0 && (
				<div
					style={{
						marginTop: "32px",
						display: "grid",
						gridTemplateColumns: "1fr",
						gap: "1px",
						background: "var(--color-border)",
						border: "1px solid var(--color-border)",
					}}
				>
					{options.slice(0, 3).map((opt, idx) => (
						<div
							key={idx}
							style={{
								background: "var(--color-bg-card)",
								padding: "20px",
								display: "grid",
								gridTemplateColumns: "minmax(150px, 1fr) 2fr 2fr",
								gap: "20px",
								alignItems: "start",
							}}
						>
							<div
								style={{
									fontWeight: 500,
									fontSize: "0.85rem",
									color: "var(--color-text-primary)",
								}}
							>
								{opt.title}
							</div>
							{opt.pros?.length > 0 ? (
								<ul
									style={{
										listStyle: "none",
										padding: 0,
										margin: 0,
										display: "flex",
										flexDirection: "column",
										gap: "8px",
									}}
								>
									{opt.pros.slice(0, 2).map((p, i) => (
										<li
											key={i}
											style={{
												fontSize: "0.8rem",
												color: "var(--color-text-secondary)",
												display: "flex",
												gap: "8px",
												lineHeight: 1.4,
											}}
										>
											<span style={{ color: "var(--color-accent)" }}>+</span>{" "}
											{p}
										</li>
									))}
								</ul>
							) : (
								<div />
							)}
							{opt.cons?.length > 0 ? (
								<ul
									style={{
										listStyle: "none",
										padding: 0,
										margin: 0,
										display: "flex",
										flexDirection: "column",
										gap: "8px",
									}}
								>
									{opt.cons.slice(0, 2).map((c, i) => (
										<li
											key={i}
											style={{
												fontSize: "0.8rem",
												color: "var(--color-text-muted)",
												display: "flex",
												gap: "8px",
												lineHeight: 1.4,
											}}
										>
											<span>-</span> {c}
										</li>
									))}
								</ul>
							) : (
								<div />
							)}
						</div>
					))}
				</div>
			)}
		</motion.div>
	);
}
