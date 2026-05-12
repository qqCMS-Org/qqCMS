import { NodeRenderer } from "../TipTapRenderer";
import type { TipTapNode } from "../types";

export function ParagraphNode({ node }: { node: TipTapNode }) {
	return (
		<p class="mb-4">
			{node.content?.map((child, index) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: TipTap nodes have no stable id
				<NodeRenderer key={index} node={child} />
			))}
		</p>
	);
}
