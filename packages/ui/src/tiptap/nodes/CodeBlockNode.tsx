import type { TipTapNode } from "../types";

export function CodeBlockNode({ node }: { node: TipTapNode }) {
	const text = node.content?.map((child) => child.text ?? "").join("") ?? "";

	return (
		<pre class="bg-base-200 rounded p-4 overflow-x-auto text-sm font-mono">
			<code>{text}</code>
		</pre>
	);
}
