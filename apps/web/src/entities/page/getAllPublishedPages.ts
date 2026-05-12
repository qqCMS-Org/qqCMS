import { api } from "@shared/api/client";

export interface PublishedPageEntry {
	lang: string;
	slug: string;
	pageId: string;
	isHomepage: boolean;
}

export const getAllPublishedPages = async (): Promise<PublishedPageEntry[]> => {
	let langsRes: Awaited<ReturnType<typeof api.languages.get>>;
	let pagesRes: Awaited<ReturnType<typeof api.pages.get>>;

	try {
		[langsRes, pagesRes] = await Promise.all([api.languages.get(), api.pages.get()]);
	} catch (err) {
		// API is unreachable at build time (e.g. CI without a running server).
		// Return empty array so `astro build` succeeds; pages are emitted on the
		// next rebuild once the API is up.
		console.warn(
			"[getAllPublishedPages] API unreachable — no static pages will be emitted.",
			err instanceof Error ? err.message : err,
		);
		return [];
	}

	if (langsRes.error || pagesRes.error) {
		console.warn(
			"[getAllPublishedPages] API returned an error — no static pages will be emitted.",
			langsRes.error ?? pagesRes.error,
		);
		return [];
	}

	const activeLangs = langsRes.data.filter((l) => l.isActive);

	const publishedPages = pagesRes.data.filter((p) => p.status === "published");

	const entries: PublishedPageEntry[] = [];

	for (const page of publishedPages) {
		for (const lang of activeLangs) {
			entries.push({
				lang: lang.code,
				slug: page.slug,
				pageId: page.id,
				isHomepage: page.isHomepage,
			});
		}
	}

	return entries;
};
