import { getTranslationsByPage, upsertTranslation as upsertTranslationInDb } from "@repository/page-translations";
import {
	clearHomepageFlag,
	deletePage as deletePageInDb,
	getPage as getPageById,
	getPages,
	insertPage,
	updatePage as updatePageInDb,
} from "@repository/pages";
import { NotFoundError } from "@shared/errors";
import type { CreatePageInput, UpdatePageInput, UpsertTranslationInput } from "./pages.types";

export const listPages = () => getPages();

export const getPage = async (id: string) => {
	const page = await getPageById(id);
	if (!page) throw new NotFoundError("Page not found");

	const translations = await getTranslationsByPage(id);
	return { ...page, translations };
};

export const createPage = async (data: CreatePageInput) => {
	if (data.isHomepage) {
		await clearHomepageFlag();
	}

	const [newPage] = await insertPage(data);
	return newPage;
};

export const updatePage = async (id: string, data: UpdatePageInput) => {
	const existing = await getPageById(id);
	if (!existing) throw new NotFoundError("Page not found");

	if (data.isHomepage) {
		await clearHomepageFlag(id);
	}

	const [updated] = await updatePageInDb(id, data);
	return updated;
};

export const deletePage = async (id: string) => {
	const existing = await getPageById(id);
	if (!existing) throw new NotFoundError("Page not found");

	await deletePageInDb(id);
};

export const upsertTranslation = async (pageId: string, languageCode: string, data: UpsertTranslationInput) => {
	const page = await getPageById(pageId);
	if (!page) throw new NotFoundError("Page not found");

	const [translation] = await upsertTranslationInDb({ pageId, languageCode, ...data });
	return translation;
};
