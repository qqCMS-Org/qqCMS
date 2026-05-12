import { api } from "@shared/api/client";

export interface PageTranslation {
	title: string;
	publishedContent: Record<string, unknown> | null;
	languageCode: string;
}

export const getPageTranslation = async (pageId: string, lang: string): Promise<PageTranslation | null> => {
	const res = await api.pages({ id: pageId }).get();

	if (res.error) return null;

	const page = res.data as {
		translations: Array<{
			languageCode: string;
			title: string;
			publishedContent: Record<string, unknown> | null;
		}>;
	};

	const translation = page.translations.find((t) => t.languageCode === lang);
	if (!translation) return null;

	return {
		title: translation.title,
		publishedContent: translation.publishedContent ?? null,
		languageCode: translation.languageCode,
	};
};
