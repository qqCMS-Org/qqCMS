import { ConflictError, NotFoundError } from "@api/errors";
import { triggerRebuild } from "@modules/rebuild";
import {
	deleteTranslation,
	getTranslationsByPage,
	promoteTranslationsToPublished,
	revertTranslationsToDraft,
	upsertTranslation as upsertTranslationInDb,
} from "@repository/page-translations";
import {
	clearHomepageFlag,
	deletePage as deletePageInDb,
	getPage as getPageById,
	getPageBySlug,
	getPages,
	insertPage,
	updatePage as updatePageInDb,
} from "@repository/pages";
import type { CreatePageInput, UpdatePageInput, UpsertTranslationInput } from "./pages.types";

export const listPages = () => getPages();

export const getPage = async (id: string) => {
	const page = await getPageById(id);
	if (!page) throw new NotFoundError("Page not found");

	const translations = await getTranslationsByPage(id);
	return { ...page, translations };
};

export const createPage = async (data: CreatePageInput) => {
	const existingSlug = await getPageBySlug(data.slug);
	if (existingSlug) {
		throw new ConflictError("Slug already taken");
	}

	if (data.isHomepage) {
		await clearHomepageFlag();
	}

	const [newPage] = await insertPage(data);
	void triggerRebuild();
	return newPage;
};

export const updatePage = async (id: string, data: UpdatePageInput) => {
	const existing = await getPageById(id);
	if (!existing) throw new NotFoundError("Page not found");

	if (data.slug && data.slug !== existing.slug) {
		const existingSlug = await getPageBySlug(data.slug);
		if (existingSlug) {
			throw new ConflictError("Slug already taken");
		}
	}

	if (data.isHomepage) {
		await clearHomepageFlag(id);
	}

	const [updated] = await updatePageInDb(id, data);
	void triggerRebuild();
	return updated;
};

export const deletePage = async (id: string) => {
	const existing = await getPageById(id);
	if (!existing) throw new NotFoundError("Page not found");

	await deletePageInDb(id);
	void triggerRebuild();
};

export const publishPage = async (id: string) => {
	const existing = await getPageById(id);
	if (!existing) throw new NotFoundError("Page not found");

	await promoteTranslationsToPublished(id);
	const [updated] = await updatePageInDb(id, { status: "published", hasDraft: false });
	void triggerRebuild();
	return updated;
};

export const unpublishPage = async (id: string) => {
	const existing = await getPageById(id);
	if (!existing) throw new NotFoundError("Page not found");

	const [updated] = await updatePageInDb(id, { status: "unpublished" });
	void triggerRebuild();
	return updated;
};

export const discardDraft = async (id: string) => {
	const existing = await getPageById(id);
	if (!existing) throw new NotFoundError("Page not found");

	await revertTranslationsToDraft(id);
	const [updated] = await updatePageInDb(id, { hasDraft: false });
	void triggerRebuild();
	return updated;
};

export const upsertTranslation = async (pageId: string, languageCode: string, data: UpsertTranslationInput) => {
	const page = await getPageById(pageId);
	if (!page) throw new NotFoundError("Page not found");

	const isTitleEmpty = !data.title.trim();
	const isContentEmpty =
		!data.content ||
		(data.content.type === "doc" && (!data.content.content || (data.content.content as unknown[]).length === 0));

	if (isTitleEmpty && isContentEmpty) {
		await deleteTranslation(pageId, languageCode);
		void triggerRebuild();
		return { pageId, languageCode, title: "", content: null };
	}

	const [translation] = await upsertTranslationInDb({ pageId, languageCode, ...data });

	if ((page.status === "published" || page.status === "unpublished") && !page.hasDraft) {
		await updatePageInDb(pageId, { hasDraft: true });
	}

	void triggerRebuild();
	return translation;
};
