import { NodeRenderer } from "../TipTapRenderer";
import type { TipTapNode } from "../types";

export function ListItemNode({ node }: { node: TipTapNode }) {
	return (
		<li class="mb-1">
			{node.content?.map((child, index) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: TipTap nodes have no stable id
				<NodeRenderer key={index} node={child} />
			))}
		</li>
	);
}
