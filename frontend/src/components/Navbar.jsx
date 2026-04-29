import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import { useEffect, useState } from "react";

const navLinks = [
	{ id: "hero", label: "Make Better Decision", href: "#hero-section" },
	{ id: "how-it-works", label: "How It Works", href: "#how-it-works-section" },
	{ id: "pricing", label: "Pricing", href: "#pricing-section" },
	{ id: "get-started", label: "Get Started", href: "#get-started-section" },
];

export default function Navbar({ onStartClick }) {
	const [activeSection, setActiveSection] = useState("hero");

	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						setActiveSection(entry.target.id);
					}
				});
			},
			{ threshold: 0.3 },
		);

		document.querySelectorAll("section[id]").forEach((section) => {
			observer.observe(section);
		});

		return () => observer.disconnect();
	}, []);

	return (
		<motion.nav
			initial={{ y: -100 }}
			animate={{ y: 0 }}
			transition={{ duration: 0.5, ease: "easeOut" }}
			style={{
				position: "fixed",
				top: 0,
				left: 0,
				right: 0,
				zIndex: 100,
				padding: "12px 32px",
				display: "flex",
				alignItems: "center",
				justifyContent: "space-between",
				background: "var(--header-bg)",
				backdropFilter: "blur(12px)",
				borderBottom: "1px solid var(--color-border)",
			}}
		>
			<div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
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
						margin: 0,
					}}
				>
					Decidely
				</h1>
			</div>

			<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
				{navLinks.map((link) => (
					<a
						key={link.id}
						href={link.href}
						style={{
							fontSize: "0.85rem",
							fontWeight: activeSection === link.id ? 600 : 500,
							color:
								activeSection === link.id
									? "var(--color-text-primary)"
									: "var(--color-text-muted)",
							textDecoration: "none",
							padding: "6px 12px",
							borderRadius: "8px",
							transition: "all 150ms cubic-bezier(0.16, 1, 0.3, 1)",
							background:
								activeSection === link.id
									? "var(--color-bg-card)"
									: "transparent",
						}}
					>
						{link.label}
					</a>
				))}
			</div>

			<button
				type="button"
				className="btn-primary"
				onClick={onStartClick}
				style={{ padding: "8px 20px", fontSize: "0.85rem" }}
			>
				Start Decision
			</button>
		</motion.nav>
	);
}
