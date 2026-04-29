import { AnimatePresence, motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import { useEffect, useState } from "react";

const navLinks = [
	{ id: "hero", label: "Make Better Decision", href: "#hero-section" },
	{ id: "how-it-works", label: "How It Works", href: "#how-it-works-section" },
	{ id: "pricing", label: "Pricing", href: "#pricing-section" },
	{ id: "get-started", label: "Get Started", href: "#get-started-section" },
];

export default function Navbar({ onStartClick }) {
	const [activeSection, setActiveSection] = useState("hero");
	const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
	const [isMenuOpen, setIsMenuOpen] = useState(false);

	useEffect(() => {
		const handleResize = () => {
			const mobile = window.innerWidth < 768;
			setIsMobile(mobile);
			if (!mobile) setIsMenuOpen(false);
		};

		window.addEventListener("resize", handleResize);
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

		return () => {
			window.removeEventListener("resize", handleResize);
			observer.disconnect();
		};
	}, []);

	const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

	return (
		<>
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
					padding: isMobile ? "12px 20px" : "12px 32px",
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

				{!isMobile && (
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
				)}

				<div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
					<button
						type="button"
						className="btn-primary"
						onClick={onStartClick}
						style={{
							padding: "8px 16px",
							fontSize: "0.85rem",
							display: isMobile && isMenuOpen ? "none" : "block",
						}}
					>
						Start Decision
					</button>

					{isMobile && (
						<button
							type="button"
							onClick={toggleMenu}
							style={{
								background: "transparent",
								border: "none",
								color: "var(--color-text-primary)",
								cursor: "pointer",
								padding: "8px",
								display: "flex",
								flexDirection: "column",
								gap: "4px",
								zIndex: 110,
							}}
						>
							<div
								style={{
									width: "20px",
									height: "2px",
									background: "currentColor",
									transition: "0.3s",
									transform: isMenuOpen
										? "rotate(45deg) translate(4px, 4px)"
										: "",
								}}
							/>
							<div
								style={{
									width: "20px",
									height: "2px",
									background: "currentColor",
									opacity: isMenuOpen ? 0 : 1,
									transition: "0.3s",
								}}
							/>
							<div
								style={{
									width: "20px",
									height: "2px",
									background: "currentColor",
									transition: "0.3s",
									transform: isMenuOpen
										? "rotate(-45deg) translate(4px, -4px)"
										: "",
								}}
							/>
						</button>
					)}
				</div>
			</motion.nav>

			<AnimatePresence>
				{isMobile && isMenuOpen && (
					<motion.div
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -20 }}
						style={{
							position: "fixed",
							top: 0,
							left: 0,
							right: 0,
							bottom: 0,
							background: "var(--color-bg-primary)",
							zIndex: 90,
							padding: "80px 32px 32px",
							display: "flex",
							flexDirection: "column",
							gap: "16px",
						}}
					>
						{navLinks.map((link) => (
							<a
								key={link.id}
								href={link.href}
								onClick={() => setIsMenuOpen(false)}
								style={{
									fontSize: "1.2rem",
									fontWeight: activeSection === link.id ? 600 : 500,
									color:
										activeSection === link.id
											? "var(--color-text-primary)"
											: "var(--color-text-muted)",
									textDecoration: "none",
									padding: "12px 0",
									borderBottom: "1px solid var(--color-border)",
								}}
							>
								{link.label}
							</a>
						))}
						<button
							type="button"
							className="btn-primary"
							onClick={() => {
								setIsMenuOpen(false);
								onStartClick();
							}}
							style={{ marginTop: "24px", padding: "16px", fontSize: "1rem" }}
						>
							Start Decision
						</button>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
