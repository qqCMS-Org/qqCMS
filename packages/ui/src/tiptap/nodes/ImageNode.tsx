import type { TipTapNode } from "../types";

function isSafeImageUrl(src: string): boolean {
	try {
		const url = new URL(src);
		return url.protocol === "https:" || url.protocol === "http:";
	} catch {
		return src.startsWith("/");
	}
}

export function ImageNode({ node }: { node: TipTapNode }) {
	const rawSrc = typeof node.attrs?.src === "string" ? node.attrs.src : "";
	const src = isSafeImageUrl(rawSrc) ? rawSrc : "";
	const alt = typeof node.attrs?.alt === "string" ? node.attrs.alt : "";

	return <img class="rounded-box max-w-full" src={src} alt={alt} />;
}
