import { useId } from "preact/hooks";
import type { InputHTMLAttributes, ComponentChildren } from "preact";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
	label?: string;
	error?: boolean;
	rightElement?: ComponentChildren;
}

export function Input({ label, error, rightElement, class: className = "", id, ...props }: InputProps) {
	const generatedId = useId();
	const inputId = id ?? generatedId;

	const borderClass = error
		? "border-coral focus:border-coral"
		: "border-ui-border focus:border-accent";

	return (
		<div class="form-control w-full">
			{label && (
				<label htmlFor={inputId} class="label p-0 pb-1.5">
					<span class="label-text text-[10px] text-text1">{label}</span>
				</label>
			)}
			<div class="relative flex items-center w-full">
				<input
					id={inputId}
					class={`input w-full min-h-0 h-[34px] px-[11px] py-2 text-xs bg-bg1 text-text0 border outline-none transition-colors rounded-[5px] ${borderClass} ${rightElement ? "pr-9" : ""} ${className}`}
					{...props}
				/>
				{rightElement && (
					<div class="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center">
						{rightElement}
					</div>
				)}
			</div>
		</div>
	);
}
