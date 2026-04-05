import { ExternalLinkIcon, FileTextIcon } from "@radix-ui/react-icons";
import { useState } from "react";
import { exportToDrive } from "../services/api";
import { LoadingSpinner } from "./LoadingSpinner";

export default function ExportButton({ sessionId }) {
	const [loading, setLoading] = useState(false);
	const [driveUrl, setDriveUrl] = useState("");
	const [error, setError] = useState("");

	const handleExport = async () => {
		setLoading(true);
		setError("");
		try {
			const data = await exportToDrive(sessionId);
			setDriveUrl(data.drive_url);
		} catch {
			setError("Export processing failed. Verify Drive configuration.");
		} finally {
			setLoading(false);
		}
	};

	if (driveUrl) {
		return (
			<div
				style={{
					display: "flex",
					alignItems: "center",
					gap: "12px",
					padding: "12px 16px",
					background: "rgba(255,255,255,0.02)",
					border: "1px solid var(--color-border)",
					borderRadius: "8px",
					fontSize: "0.85rem",
				}}
			>
				<FileTextIcon style={{ color: "var(--color-accent)" }} />
				<span style={{ color: "var(--color-text-secondary)" }}>
					Commit successful:
				</span>
				<a
					href={driveUrl}
					target="_blank"
					rel="noopener noreferrer"
					style={{
						color: "var(--color-text-primary)",
						display: "flex",
						alignItems: "center",
						gap: "6px",
						textDecoration: "none",
					}}
				>
					Open Reference <ExternalLinkIcon />
				</a>
			</div>
		);
	}

	return (
		<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
			<button
				className="btn-secondary"
				onClick={handleExport}
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
				{loading ? <LoadingSpinner size={16} /> : <FileTextIcon />}
				{loading ? "Committing..." : "Commit Context to Drive"}
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
