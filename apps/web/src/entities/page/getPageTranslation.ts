import type { TipTapNode } from "@repo/ui";
import { api } from "@shared/api/client";

export interface PageTranslation {
	title: string;
	publishedContent: TipTapNode | null;
	languageCode: string;
}

const isContentEmpty = (content: TipTapNode | null | undefined): boolean => {
	if (!content) return true;
	if (typeof content !== "object") return true;
	if (content.type === "doc") {
		if (!content.content || (content.content as any[]).length === 0) return true;
		// Check if it's just empty paragraphs
		return (content.content as any[]).every(
			(node) => node.type === "paragraph" && (!node.content || node.content.length === 0),
		);
	}
	return Object.keys(content).length === 0;
};

export const getPageTranslation = async (
	pageId: string,
	lang: string,
	fallbackLang?: string,
): Promise<PageTranslation | null> => {
	const res = await api.pages({ id: pageId }).get();

	if (res.error) return null;

	const page = res.data as {
		translations: Array<{
			languageCode: string;
			title: string;
			publishedTitle: string | null;
			publishedContent: TipTapNode | null;
		}>;
	};

	let translation = page.translations.find((t) => t.languageCode === lang);

	// If no translation or it has no published content, try fallback
	const translationIsEmpty = !translation || isContentEmpty(translation.publishedContent);

	if (translationIsEmpty && fallbackLang && fallbackLang !== lang) {
		const fallback = page.translations.find(
			(t) => t.languageCode === fallbackLang && !isContentEmpty(t.publishedContent),
		);
		if (fallback) {
			translation = fallback;
		}
	}

	if (!translation || isContentEmpty(translation.publishedContent)) return null;

	return {
		title: translation.publishedTitle || translation.title,
		publishedContent: translation.publishedContent || null,
		languageCode: translation.languageCode,
	};
};
