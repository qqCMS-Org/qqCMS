export interface ToggleProps {
	value: boolean;
	onChange: (value: boolean) => void;
	disabled?: boolean;
	ariaLabel?: string;
}

export function Toggle({
	value,
	onChange,
	disabled = false,
	ariaLabel,
}: ToggleProps) {
	return (
		<button
			type="button"
			role="switch"
			aria-checked={value}
			aria-label={ariaLabel}
			disabled={disabled}
			onClick={() => onChange(!value)}
			class={`w-8.5 h-4.75 rounded-[10px] border relative shrink-0 p-0 outline-none transition-[background,border-color] duration-200 ${
				value ? "bg-accent border-accent" : "bg-bg4 border-ui-border"
			} ${disabled ? "cursor-not-allowed opacity-40" : "cursor-pointer"}`}
		>
			<span
				class={`block w-3.25 h-3.25 rounded-full absolute top-0.5 transition-all duration-200 ${
					value ? "left-4.25 bg-white" : "left-0.5 bg-text2"
				}`}
			/>
		</button>
	);
}
