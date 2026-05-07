export interface ToggleProps {
	value: boolean;
	onChange: (value: boolean) => void;
	disabled?: boolean;
}

export function Toggle({ value, onChange, disabled = false }: ToggleProps) {
	return (
		<button
			type="button"
			role="switch"
			aria-checked={value}
			disabled={disabled}
			onClick={() => onChange(!value)}
			style={{
				width: 34,
				height: 19,
				borderRadius: 10,
				background: value ? "var(--accent)" : "var(--bg4)",
				border: `1px solid ${value ? "var(--accent)" : "var(--ui-border)"}`,
				cursor: disabled ? "not-allowed" : "pointer",
				position: "relative",
				transition: "background 0.2s, border-color 0.2s",
				flexShrink: 0,
				padding: 0,
				outline: "none",
				opacity: disabled ? 0.4 : 1,
			}}
		>
			<span
				style={{
					display: "block",
					width: 13,
					height: 13,
					borderRadius: "50%",
					background: value ? "#fff" : "var(--text2)",
					position: "absolute",
					top: 2,
					left: value ? 17 : 2,
					transition: "left 0.18s, background 0.2s",
				}}
			/>
		</button>
	);
}
