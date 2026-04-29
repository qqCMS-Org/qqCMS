import type { ComponentProps } from "preact";

type CodeProps = ComponentProps<"code">;

export const Code = ({ children, className, ...props }: CodeProps) => {
	return (
		<code className={className} {...props}>
			{children}
		</code>
	);
};
