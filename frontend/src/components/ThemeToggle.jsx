// eslint-disable-next-line no-unused-vars

import { MoonIcon, SunIcon } from "@radix-ui/react-icons";
import { motion } from "framer-motion";

export default function ThemeToggle({ theme, toggleTheme }) {
	const isDark = theme === "dark";

	return (
		<button
			type="button"
			onClick={toggleTheme}
			style={{
				width: "36px",
				height: "36px",
				borderRadius: "50%",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				background: "var(--color-bg-card)",
				border: "1px solid var(--color-border)",
				color: "var(--color-text-secondary)",
				cursor: "pointer",
				position: "relative",
				overflow: "hidden",
			}}
			className="btn-secondary"
			aria-label="Toggle Theme"
		>
			<motion.div
				initial={false}
				animate={{
					y: isDark ? 20 : 0,
					opacity: isDark ? 0 : 1,
				}}
				transition={{ type: "spring", stiffness: 200, damping: 20 }}
				style={{ position: "absolute" }}
			>
				<SunIcon width={16} height={16} />
			</motion.div>

			<motion.div
				initial={false}
				animate={{
					y: isDark ? 0 : -20,
					opacity: isDark ? 1 : 0,
				}}
				transition={{ type: "spring", stiffness: 200, damping: 20 }}
				style={{ position: "absolute" }}
			>
				<MoonIcon width={16} height={16} />
			</motion.div>
		</button>
	);
}
