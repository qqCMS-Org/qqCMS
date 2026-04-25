import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { PageTranslation } from "@schema/page-translations";
import type { Page } from "@schema/pages";
import { NotFoundError } from "@shared/errors";

const mockGetPages = mock((): Promise<Page[]> => Promise.resolve([]));
const mockGetPage = mock((): Promise<Page | undefined> => Promise.resolve(undefined));
const mockInsertPage = mock(
	(): Promise<Page[]> =>
		Promise.resolve([{ id: "page-1", slug: "home", isHomepage: true, createdAt: new Date(), updatedAt: new Date() }]),
);
const mockUpdatePage = mock(
	(): Promise<Page[]> =>
		Promise.resolve([
			{ id: "page-1", slug: "updated", isHomepage: false, createdAt: new Date(), updatedAt: new Date() },
		]),
);
const mockDeletePage = mock(() => Promise.resolve());
const mockClearHomepageFlag = mock(() => Promise.resolve());
const mockGetTranslationsByPage = mock((): Promise<PageTranslation[]> => Promise.resolve([]));
const mockUpsertTranslation = mock(
	(): Promise<PageTranslation[]> =>
		Promise.resolve([{ id: "trans-1", pageId: "page-1", languageCode: "en", title: "Home", content: {} }]),
);

mock.module("@repository/pages", () => ({
	getPages: mockGetPages,
	getPage: mockGetPage,
	insertPage: mockInsertPage,
	updatePage: mockUpdatePage,
	deletePage: mockDeletePage,
	clearHomepageFlag: mockClearHomepageFlag,
}));

mock.module("@repository/page-translations", () => ({
	getTranslationsByPage: mockGetTranslationsByPage,
	upsertTranslation: mockUpsertTranslation,
}));

mock.module("@modules/rebuild", () => ({
	triggerRebuild: mock(() => Promise.resolve()),
}));

const { createPage, getPage, updatePage, deletePage, upsertTranslation } = await import("./pages.service");

describe("createPage", () => {
	beforeEach(() => {
		mockClearHomepageFlag.mockReset();
		mockInsertPage.mockReset();
		mockInsertPage.mockResolvedValue([
			{ id: "page-1", slug: "home", isHomepage: true, createdAt: new Date(), updatedAt: new Date() },
		] as Page[]);
	});

	it("creates a page without clearing homepage flag when isHomepage is false", async () => {
		await createPage({ slug: "about", isHomepage: false });

		expect(mockClearHomepageFlag).not.toHaveBeenCalled();
		expect(mockInsertPage).toHaveBeenCalledWith({ slug: "about", isHomepage: false });
	});

	it("clears homepage flag before creating when isHomepage is true", async () => {
		await createPage({ slug: "home", isHomepage: true });

		expect(mockClearHomepageFlag).toHaveBeenCalledTimes(1);
		expect(mockInsertPage).toHaveBeenCalledWith({ slug: "home", isHomepage: true });
	});

	it("returns the created page", async () => {
		const page = await createPage({ slug: "home", isHomepage: true });

		expect(page).toMatchObject({ id: "page-1", slug: "home" });
	});
});

describe("getPage", () => {
	beforeEach(() => {
		mockGetPage.mockReset();
		mockGetTranslationsByPage.mockReset();
	});

	it("throws NotFoundError when page does not exist", async () => {
		mockGetPage.mockResolvedValueOnce(undefined);

		expect(getPage("nonexistent")).rejects.toThrow(NotFoundError);
	});

	it("returns page with translations", async () => {
		const pageData: Page = {
			id: "page-1",
			slug: "home",
			isHomepage: true,
			createdAt: new Date(),
			updatedAt: new Date(),
		};
		const translationData: PageTranslation[] = [
			{ id: "trans-1", pageId: "page-1", languageCode: "en", title: "Home", content: {} },
		];
		mockGetPage.mockResolvedValueOnce(pageData);
		mockGetTranslationsByPage.mockResolvedValueOnce(translationData);

		const result = await getPage("page-1");

		expect(result).toMatchObject({ ...pageData, translations: translationData });
	});
});

describe("updatePage", () => {
	beforeEach(() => {
		mockGetPage.mockReset();
		mockUpdatePage.mockReset();
		mockClearHomepageFlag.mockReset();
	});

	it("throws NotFoundError when page does not exist", async () => {
		mockGetPage.mockResolvedValueOnce(undefined);

		expect(updatePage("nonexistent", { slug: "new-slug" })).rejects.toThrow(NotFoundError);
	});

	it("clears homepage flag for other pages when setting isHomepage to true", async () => {
		mockGetPage.mockResolvedValueOnce({
			id: "page-1",
			slug: "about",
			isHomepage: false,
			createdAt: new Date(),
			updatedAt: new Date(),
		});
		mockUpdatePage.mockResolvedValueOnce([
			{ id: "page-1", slug: "about", isHomepage: true, createdAt: new Date(), updatedAt: new Date() },
		]);

		await updatePage("page-1", { isHomepage: true });

		expect(mockClearHomepageFlag).toHaveBeenCalledWith("page-1");
	});

	it("does not clear homepage flag when isHomepage is not set", async () => {
		mockGetPage.mockResolvedValueOnce({
			id: "page-1",
			slug: "about",
			isHomepage: false,
			createdAt: new Date(),
			updatedAt: new Date(),
		});
		mockUpdatePage.mockResolvedValueOnce([
			{ id: "page-1", slug: "new-slug", isHomepage: false, createdAt: new Date(), updatedAt: new Date() },
		]);

		await updatePage("page-1", { slug: "new-slug" });

		expect(mockClearHomepageFlag).not.toHaveBeenCalled();
	});
});

describe("deletePage", () => {
	beforeEach(() => {
		mockGetPage.mockReset();
		mockDeletePage.mockReset();
	});

	it("throws NotFoundError when page does not exist", async () => {
		mockGetPage.mockResolvedValueOnce(undefined);

		expect(deletePage("nonexistent")).rejects.toThrow(NotFoundError);
	});

	it("deletes existing page", async () => {
		mockGetPage.mockResolvedValueOnce({
			id: "page-1",
			slug: "home",
			isHomepage: false,
			createdAt: new Date(),
			updatedAt: new Date(),
		});
		mockDeletePage.mockResolvedValueOnce(undefined);

		await deletePage("page-1");

		expect(mockDeletePage).toHaveBeenCalledWith("page-1");
	});
});

describe("upsertTranslation", () => {
	beforeEach(() => {
		mockGetPage.mockReset();
		mockUpsertTranslation.mockReset();
	});

	it("throws NotFoundError when page does not exist", async () => {
		mockGetPage.mockResolvedValueOnce(undefined);

		expect(upsertTranslation("nonexistent", "en", { title: "Home" })).rejects.toThrow(NotFoundError);
	});

	it("upserts translation and returns it", async () => {
		mockGetPage.mockResolvedValueOnce({
			id: "page-1",
			slug: "home",
			isHomepage: true,
			createdAt: new Date(),
			updatedAt: new Date(),
		});
		mockUpsertTranslation.mockResolvedValueOnce([
			{ id: "trans-1", pageId: "page-1", languageCode: "en", title: "Home", content: {} },
		]);

		const result = await upsertTranslation("page-1", "en", { title: "Home" });

		expect(result).toMatchObject({ pageId: "page-1", languageCode: "en", title: "Home" });
	});
});
