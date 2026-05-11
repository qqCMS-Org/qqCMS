import { NodeRenderer } from "../TipTapRenderer";
import type { TipTapNode } from "../types";

export function DocNode({ node }: { node: TipTapNode }) {
	return (
		<>
			{node.content?.map((child, index) => (
				// biome-ignore lint/suspicious/noArrayIndexKey: TipTap nodes have no stable id
				<NodeRenderer key={index} node={child} />
			))}
		</>
	);
}
