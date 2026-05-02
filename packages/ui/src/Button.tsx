import type { ButtonHTMLAttributes, ComponentChildren } from "preact";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	children: ComponentChildren;
	loading?: boolean;
	variant?: "primary" | "default" | "danger";
	size?: "sm" | "md" | "lg";
}

export function Button({
	children,
	loading,
	variant = "primary",
	size = "md",
	class: className = "",
	disabled,
	...props
}: ButtonProps) {
	const baseClass =
		"btn flex items-center justify-center gap-2 transition-colors";

	const variants = {
		primary: "bg-accent text-white border-none hover:bg-accent-hover",
		default:
			"bg-bg3 text-text0 border border-ui-border hover:border-ui-border-hover",
		danger: "bg-coral text-white border-none hover:bg-coral/90",
	};

	const sizes = {
		sm: "min-h-0 h-8 px-3 text-[11px] rounded",
		md: "min-h-0 h-10 px-4 text-xs rounded-md",
		lg: "min-h-0 h-12 px-6 text-sm rounded-lg",
	};

	const loadingClass = loading ? "bg-bg4 cursor-not-allowed text-white/70" : "";

	return (
		<button
			class={`${baseClass} ${variants[variant]} ${sizes[size]} ${loadingClass} ${className}`}
			disabled={loading || disabled}
			{...props}
		>
			{loading ? (
				<>
					<span class="inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
					{children}
				</>
			) : (
				children
			)}
		</button>
	);
}
