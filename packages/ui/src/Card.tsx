import type { HTMLAttributes, ComponentChildren } from "preact";

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
	children: ComponentChildren;
}

export function Card({ children, class: className = "", ...props }: CardProps) {
	return (
		<div
			class={`card w-full max-w-[380px] bg-bg2 border border-ui-border rounded-[10px] p-7 pb-6 shadow-[0_20px_60px_rgba(0,0,0,0.4)] ${className}`}
			{...props}
		>
			{children}
		</div>
	);
}
