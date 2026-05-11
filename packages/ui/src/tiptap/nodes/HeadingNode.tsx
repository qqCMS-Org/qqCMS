import { NodeRenderer } from "../TipTapRenderer";
import type { TipTapNode } from "../types";

const HEADING_CLASSES: Record<number, string> = {
	1: "text-3xl font-bold mb-4",
	2: "text-2xl font-bold mb-3",
	3: "text-xl font-semibold mb-3",
	4: "text-lg font-semibold mb-2",
	5: "text-base font-semibold mb-2",
	6: "text-sm font-semibold mb-2",
};

export function HeadingNode({ node }: { node: TipTapNode }) {
	const level = (node.attrs?.level as number) ?? 1;
	const className = HEADING_CLASSES[level] ?? HEADING_CLASSES[1];

	const children = node.content?.map((child, index) => (
		// biome-ignore lint/suspicious/noArrayIndexKey: TipTap nodes have no stable id
		<NodeRenderer key={index} node={child} />
	));

	switch (level) {
		case 1:
			return <h1 class={className}>{children}</h1>;
		case 2:
			return <h2 class={className}>{children}</h2>;
		case 3:
			return <h3 class={className}>{children}</h3>;
		case 4:
			return <h4 class={className}>{children}</h4>;
		case 5:
			return <h5 class={className}>{children}</h5>;
		case 6:
			return <h6 class={className}>{children}</h6>;
		default:
			return <h1 class={className}>{children}</h1>;
	}
}
