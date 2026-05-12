import type { TipTapNode } from "../types";

const YOUTUBE_EMBED_HOSTNAMES = ["www.youtube.com", "youtube.com"];

function toSafeYoutubeEmbedUrl(src: string): string | null {
	try {
		const url = new URL(src);
		if (
			url.protocol === "https:" &&
			YOUTUBE_EMBED_HOSTNAMES.includes(url.hostname) &&
			url.pathname.startsWith("/embed/")
		) {
			return src;
		}
	} catch {
		// invalid URL
	}
	return null;
}

export function YoutubeNode({ node }: { node: TipTapNode }) {
	const rawSrc = typeof node.attrs?.src === "string" ? node.attrs.src : "";
	const safeSrc = toSafeYoutubeEmbedUrl(rawSrc);

	if (!safeSrc) return null;

	return (
		<div class="aspect-video">
			<iframe
				class="w-full h-full"
				src={safeSrc}
				title="YouTube video"
				loading="lazy"
				sandbox="allow-scripts allow-same-origin"
				referrerpolicy="no-referrer"
				allowFullScreen
			/>
		</div>
	);
}
