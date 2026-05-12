import { NodeRenderer } from "../TipTapRenderer";
import type { TipTapNode } from "../types";

export function BulletListNode({ node }: { node: TipTapNode }) {
	return (
		<ul class="list-disc pl-6 mb-4">
			{node.content?.map((child, index) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: TipTap nodes have no stable id
				<NodeRenderer key={index} node={child} />
			))}
		</ul>
	);
}
