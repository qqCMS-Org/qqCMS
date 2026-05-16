import type { JSX } from "preact";

interface EditableProps {
	tag?: keyof JSX.IntrinsicElements;
	value: string;
	onChange: (value: string) => void;
	isEditing?: boolean;
	className?: string;
	placeholder?: string;
	multiline?: boolean;
}

export function Editable({
	tag: Tag = "div",
	value,
	onChange,
	isEditing,
	className = "",
	placeholder = "Type here...",
	multiline = false,
}: EditableProps) {
	if (!isEditing) {
		return <Tag className={className}>{value || ""}</Tag>;
	}

	// biome-ignore lint/suspicious/noExplicitAny: Dynamic tag causes complex event union types
	const handleBlur = (e: any) => {
		const newValue = e.currentTarget.innerText;
		if (newValue !== value) {
			onChange(newValue);
		}
	};

	// biome-ignore lint/suspicious/noExplicitAny: Dynamic tag causes complex event union types
	const handleKeyDown = (e: any) => {
		if (!multiline && e.key === "Enter") {
			e.preventDefault();
			e.currentTarget.blur();
		}
	};

	return (
		<Tag
			class={`${className} outline-none focus:ring-2 focus:ring-accent/20 rounded px-1 transition-all empty:before:content-[attr(placeholder)] empty:before:text-text2/40`}
			contentEditable={true}
			onBlur={handleBlur}
			onKeyDown={handleKeyDown}
			placeholder={placeholder}
			// biome-ignore lint/security/noDangerouslySetInnerHtml: This is required for contentEditable sync
			dangerouslySetInnerHTML={{ __html: value }}
		/>
	);
}
