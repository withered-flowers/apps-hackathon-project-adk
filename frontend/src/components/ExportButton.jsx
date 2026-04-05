import { DownloadIcon, FileTextIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { downloadMarkdownReport } from "../services/api";
import { LoadingSpinner } from "./LoadingSpinner";

export default function ExportButton({ sessionId }) {
	const [loading, setLoading] = useState(false);
	const [success, setSuccess] = useState(false);
	const [error, setError] = useState("");

	const handleDownload = async () => {
		setLoading(true);
		setError("");
		try {
			await downloadMarkdownReport(sessionId);
			setSuccess(true);
		} catch {
			setError("Download failed. Please try again.");
		} finally {
			setLoading(false);
		}
	};

	if (success) {
		return (
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: "12px",
					padding: "12px 16px",
					background: "var(--status-bg)",
					border: "1px solid var(--color-border)",
					borderRadius: "8px",
					fontSize: "0.85rem",
				}}
			>
				<FileTextIcon style={{ color: "var(--color-accent)" }} />
				<span style={{ color: "var(--color-text-secondary)" }}>
					Report downloaded successfully
				</span>
			</div>
		);
	}

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
			<button
				className="btn-secondary"
				onClick={handleDownload}
				disabled={loading}
				type="button"
				style={{
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					gap: "8px",
					width: "100%",
				}}
			>
				{loading ? <LoadingSpinner size={16} /> : <DownloadIcon />}
				{loading ? "Generating..." : "Download Report as Markdown"}
			</button>
			{error && (
				<div
					style={{ fontSize: "0.75rem", color: "#fca5a5", textAlign: "center" }}
				>
					{error}
				</div>
			)}
		</div>
	);
}
