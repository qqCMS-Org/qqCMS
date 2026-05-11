import type { TipTapNode } from "../types";

export function YoutubeNode({ node }: { node: TipTapNode }) {
	const src = typeof node.attrs?.src === "string" ? node.attrs.src : "";

	return (
		<div class="aspect-video">
			<iframe class="w-full h-full" src={src} allowFullScreen />
		</div>
	);
}
