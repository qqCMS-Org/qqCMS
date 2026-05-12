import type { JSX } from "preact";
import type { TipTapMark, TipTapNode } from "../types";

const ALLOWED_URL_SCHEMES = ["http:", "https:", "mailto:", "tel:"];

function isSafeUrl(url: string): boolean {
	try {
		const parsed = new URL(url);
		return ALLOWED_URL_SCHEMES.includes(parsed.protocol);
	} catch {
		return url.startsWith("/") || url.startsWith("#");
	}
}

function applyMark(content: JSX.Element, mark: TipTapMark): JSX.Element {
	switch (mark.type) {
		case "bold":
			return <strong class="font-bold">{content}</strong>;
		case "italic":
			return <em class="italic">{content}</em>;
		case "underline":
			return <u>{content}</u>;
		case "strike":
			return <s>{content}</s>;
		case "code":
			return (
				<code class="bg-base-200 px-1 rounded text-sm font-mono">
					{content}
				</code>
			);
		case "link": {
			const rawHref =
				typeof mark.attrs?.href === "string" ? mark.attrs.href : "#";
			const href = isSafeUrl(rawHref) ? rawHref : "#";
			const isExternal =
				href.startsWith("http://") || href.startsWith("https://");
			return (
				<a
					class="link link-primary"
					href={href}
					rel={isExternal ? "noopener noreferrer" : undefined}
				>
					{content}
				</a>
			);
		}
		default:
			return <>{content}</>;
	}
}

export function TextNode({ node }: { node: TipTapNode }) {
	const text = node.text ?? "";
	const marks = node.marks ?? [];

	let result: JSX.Element = <>{text}</>;

	for (const mark of marks) {
		result = applyMark(result, mark);
	}

	return result;
}
