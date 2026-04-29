import type { ComponentProps } from "preact";

type ButtonProps = ComponentProps<"button">;

export const Button = ({ children, className, ...props }: ButtonProps) => {
	return (
		<button className={className} {...props}>
			{children}
		</button>
	);
};
