import { NodeRenderer } from "../TipTapRenderer";
import type { TipTapNode } from "../types";

export function OrderedListNode({ node }: { node: TipTapNode }) {
	return (
		<ol class="list-decimal pl-6 mb-4">
			{node.content?.map((child, index) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: TipTap nodes have no stable id
				<NodeRenderer key={index} node={child} />
			))}
		</ol>
	);
}
