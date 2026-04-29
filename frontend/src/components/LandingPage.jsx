import { motion } from "framer-motion"; // eslint-disable-line no-unused-vars
import { useState } from "react";
import Login from "./Login";
import Navbar from "./Navbar";
import PricingCard from "./PricingCard";

const features = [
	{
		title: "Multi-Agent Analysis",
		description:
			"Multiple AI agents analyze your decision from different angles, ensuring comprehensive evaluation.",
	},
	{
		title: "Real-Time Collaboration",
		description:
			"Work with intelligent agents that adapt to your preferences and learn from your choices.",
	},
	{
		title: "Transparent Reasoning",
		description:
			"Every recommendation comes with clear reasoning, so you understand exactly why a path is suggested.",
	},
];

const fadeInUp = {
	hidden: { opacity: 0, y: 20 },
	visible: { opacity: 1, y: 0 },
};

const staggerContainer = {
	hidden: { opacity: 0 },
	visible: {
		opacity: 1,
		transition: {
			staggerChildren: 0.1,
		},
	},
};

const buttonHover = {
	scale: 1.05,
	boxShadow: "0 10px 30px -10px rgba(0,0,0,0.2)",
	transition: { duration: 0.2 },
};

export default function LandingPage() {
	const [showLogin, setShowLogin] = useState(false);

	if (showLogin) {
		return <Login />;
	}

	return (
		<div
			style={{
				minHeight: "100dvh",
				background: "var(--color-bg-primary)",
				color: "var(--color-text-primary)",
			}}
		>
			<Navbar onStartClick={() => setShowLogin(true)} />

			<main style={{ paddingTop: "60px" }}>
				<section
					id="hero-section"
					style={{
						padding: "120px 32px 80px",
						maxWidth: "800px",
						margin: "0 auto",
						textAlign: "center",
					}}
				>
					<motion.div
						variants={staggerContainer}
						initial="hidden"
						animate="visible"
						style={{ width: "100%" }}
					>
						<motion.h2
							variants={fadeInUp}
							style={{
								fontSize: "2.5rem",
								fontWeight: 700,
								letterSpacing: "-0.04em",
								marginBottom: "24px",
								lineHeight: 1.2,
							}}
						>
							Make Better Decisions with AI-Powered Analysis
						</motion.h2>
						<motion.p
							variants={fadeInUp}
							style={{
								fontSize: "1.1rem",
								color: "var(--color-text-muted)",
								lineHeight: 1.7,
								marginBottom: "40px",
							}}
						>
							Decidely uses multiple AI agents to analyze your decisions from
							different perspectives, providing transparent recommendations
							backed by clear reasoning.
						</motion.p>
						<motion.button
							variants={fadeInUp}
							type="button"
							className="btn-primary"
							whileHover={buttonHover}
							onClick={() => setShowLogin(true)}
							style={{
								padding: "14px 32px",
								fontSize: "1rem",
								fontWeight: 500,
							}}
						>
							Start Your First Decision
						</motion.button>
					</motion.div>
				</section>

				<section
					id="how-it-works-section"
					style={{
						padding: "60px 32px",
						background: "var(--color-bg-secondary)",
					}}
				>
					<div style={{ maxWidth: "1000px", margin: "0 auto" }}>
						<motion.h3
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: "-100px" }}
							transition={{ duration: 0.5 }}
							style={{
								fontSize: "1.5rem",
								fontWeight: 600,
								letterSpacing: "-0.02em",
								marginBottom: "40px",
								textAlign: "center",
							}}
						>
							How It Works
						</motion.h3>
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
								gap: "24px",
							}}
						>
							{features.map((feature, index) => (
								<motion.div
									// biome-ignore lint/suspicious/noArrayIndexKey: AI Generated
									key={index}
									variants={fadeInUp}
									initial="hidden"
									whileInView="visible"
									viewport={{ once: true, margin: "-50px" }}
									className="glass-card"
									style={{
										padding: "28px",
										textAlign: "left",
									}}
								>
									<h4
										style={{
											fontSize: "1rem",
											fontWeight: 600,
											marginBottom: "12px",
										}}
									>
										{feature.title}
									</h4>
									<p
										style={{
											fontSize: "0.85rem",
											color: "var(--color-text-muted)",
											lineHeight: 1.6,
										}}
									>
										{feature.description}
									</p>
								</motion.div>
							))}
						</div>
					</div>
				</section>

				<section
					id="pricing-section"
					style={{
						padding: "60px 32px",
					}}
				>
					<div style={{ maxWidth: "1000px", margin: "0 auto" }}>
						<motion.h3
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: "-100px" }}
							transition={{ duration: 0.5 }}
							style={{
								fontSize: "1.5rem",
								fontWeight: 600,
								letterSpacing: "-0.02em",
								marginBottom: "16px",
								textAlign: "center",
							}}
						>
							Pricing
						</motion.h3>
						<motion.p
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true, margin: "-100px" }}
							transition={{ duration: 0.5, delay: 0.1 }}
							style={{
								fontSize: "0.9rem",
								color: "var(--color-text-muted)",
								textAlign: "center",
								marginBottom: "40px",
							}}
						>
							Choose the plan that fits your decision-making needs
						</motion.p>
						<div
							style={{
								display: "grid",
								gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
								gap: "24px",
							}}
						>
							<PricingCard
								tier="Guest"
								requests={30}
								window="5 hours"
								price="Free"
								description="Perfect for trying out the platform"
								isHighlighted={false}
							/>
							<PricingCard
								tier="Registered"
								requests={3}
								window="2 hours"
								price="Free"
								description="For registered users with basic needs"
								isHighlighted={false}
							/>
							<PricingCard
								tier="Upgraded"
								requests={20}
								window="1 hour"
								price="Demo"
								description="Use voucher code DEMO for free upgrade"
								isHighlighted={true}
							/>
						</div>
					</div>
				</section>

				<section
					id="get-started-section"
					style={{
						padding: "60px 32px",
						textAlign: "center",
						borderTop: "1px solid var(--color-border)",
					}}
				>
					<motion.h3
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: "-100px" }}
						transition={{ duration: 0.5 }}
						style={{
							fontSize: "1.3rem",
							fontWeight: 600,
							marginBottom: "16px",
						}}
					>
						Ready to make better decisions?
					</motion.h3>
					<motion.p
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						viewport={{ once: true, margin: "-100px" }}
						transition={{ duration: 0.5, delay: 0.1 }}
						style={{
							fontSize: "0.9rem",
							color: "var(--color-text-muted)",
							marginBottom: "32px",
						}}
					>
						Join now and get started with AI-powered decision analysis
					</motion.p>
					<motion.button
						type="button"
						className="btn-primary"
						whileHover={buttonHover}
						onClick={() => setShowLogin(true)}
						style={{
							padding: "14px 32px",
							fontSize: "1rem",
							fontWeight: 500,
						}}
					>
						Get Started
					</motion.button>
				</section>
			</main>

			<footer
				style={{
					padding: "24px 32px",
					textAlign: "center",
					borderTop: "1px solid var(--color-border)",
					fontSize: "0.75rem",
					color: "var(--color-text-muted)",
				}}
			>
				Decidely.ai — AI-Powered Decision Support
			</footer>
		</div>
	);
}
