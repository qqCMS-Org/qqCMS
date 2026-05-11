import type { TipTapNode } from "../types";

export function ImageNode({ node }: { node: TipTapNode }) {
	const src = typeof node.attrs?.src === "string" ? node.attrs.src : "";
	const alt = typeof node.attrs?.alt === "string" ? node.attrs.alt : "";

	return <img class="rounded-box max-w-full" src={src} alt={alt} />;
}
