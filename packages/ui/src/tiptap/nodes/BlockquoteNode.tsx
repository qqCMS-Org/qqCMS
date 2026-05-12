import { NodeRenderer } from "../TipTapRenderer";
import type { TipTapNode } from "../types";

export function BlockquoteNode({ node }: { node: TipTapNode }) {
	return (
		<blockquote class="border-l-4 border-base-300 pl-4 italic text-base-content/70">
			{node.content?.map((child, index) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: TipTap nodes have no stable id
				<NodeRenderer key={index} node={child} />
			))}
		</blockquote>
	);
}
