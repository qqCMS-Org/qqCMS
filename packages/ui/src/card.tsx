import type { ComponentProps } from "preact";

type CardProps = ComponentProps<"a"> & {
	title: string;
};

export const Card = ({
	className,
	title,
	children,
	href,
	...props
}: CardProps) => {
	return (
		<a className={className} href={href} {...props}>
			<h2>{title}</h2>
			<p>{children}</p>
		</a>
	);
};
