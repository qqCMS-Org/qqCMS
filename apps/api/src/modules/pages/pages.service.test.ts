import { beforeEach, describe, expect, it, mock } from "bun:test";
import { NotFoundError } from "@api/errors";
import type { PageTranslation } from "@schema/page-translations";
import type { Page } from "@schema/pages";

const basePage = (overrides: Partial<Page> = {}): Page => ({
	id: "page-1",
	slug: "home",
	status: "draft",
	hasDraft: true,
	isHomepage: false,
	hideTitle: false,
	createdAt: new Date(),
	updatedAt: new Date(),
	...overrides,
});

const baseTranslation = (overrides: Partial<PageTranslation> = {}): PageTranslation => ({
	id: "trans-1",
	pageId: "page-1",
	languageCode: "en",
	title: "Home",
	content: {},
	publishedTitle: null,
	publishedContent: null,
	...overrides,
});

const mockGetPages = mock((): Promise<Page[]> => Promise.resolve([]));
const mockGetPage = mock((): Promise<Page | undefined> => Promise.resolve(undefined));
const mockInsertPage = mock((): Promise<Page[]> => Promise.resolve([basePage({ isHomepage: true })]));
const mockUpdatePage = mock((): Promise<Page[]> => Promise.resolve([basePage({ slug: "updated" })]));
const mockDeletePage = mock(() => Promise.resolve());
const mockClearHomepageFlag = mock(() => Promise.resolve());
const mockGetTranslationsByPage = mock((): Promise<PageTranslation[]> => Promise.resolve([]));
const mockUpsertTranslation = mock((): Promise<PageTranslation[]> => Promise.resolve([baseTranslation()]));
const mockPromoteTranslationsToPublished = mock((): Promise<PageTranslation[]> => Promise.resolve([]));
const mockRevertTranslationsToDraft = mock((): Promise<PageTranslation[]> => Promise.resolve([]));
const mockDeleteTranslation = mock(() => Promise.resolve());

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
	promoteTranslationsToPublished: mockPromoteTranslationsToPublished,
	revertTranslationsToDraft: mockRevertTranslationsToDraft,
	deleteTranslation: mockDeleteTranslation,
}));

mock.module("@modules/rebuild", () => ({
	triggerRebuild: mock(() => Promise.resolve()),
}));

const { createPage, getPage, updatePage, deletePage, publishPage, unpublishPage, discardDraft, upsertTranslation } =
	await import("./pages.service");

describe("createPage", () => {
	beforeEach(() => {
		mockClearHomepageFlag.mockReset();
		mockInsertPage.mockReset();
		mockInsertPage.mockResolvedValue([basePage({ isHomepage: true })] as Page[]);
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
		const pageData = basePage({ isHomepage: true });
		const translationData = [baseTranslation()];
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
		mockGetPage.mockResolvedValueOnce(basePage());
		mockUpdatePage.mockResolvedValueOnce([basePage({ isHomepage: true })]);

		await updatePage("page-1", { isHomepage: true });

		expect(mockClearHomepageFlag).toHaveBeenCalledWith("page-1");
	});

	it("does not clear homepage flag when isHomepage is not set", async () => {
		mockGetPage.mockResolvedValueOnce(basePage());
		mockUpdatePage.mockResolvedValueOnce([basePage({ slug: "new-slug" })]);

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
		mockGetPage.mockResolvedValueOnce(basePage());
		mockDeletePage.mockResolvedValueOnce(undefined);

		await deletePage("page-1");

		expect(mockDeletePage).toHaveBeenCalledWith("page-1");
	});
});

describe("publishPage", () => {
	beforeEach(() => {
		mockGetPage.mockReset();
		mockPromoteTranslationsToPublished.mockReset();
		mockUpdatePage.mockReset();
	});

	it("throws NotFoundError when page does not exist", async () => {
		mockGetPage.mockResolvedValueOnce(undefined);

		expect(publishPage("nonexistent")).rejects.toThrow(NotFoundError);
	});

	it("promotes translations and sets status to published with hasDraft false", async () => {
		mockGetPage.mockResolvedValueOnce(basePage({ status: "draft", hasDraft: true }));
		mockPromoteTranslationsToPublished.mockResolvedValueOnce([]);
		mockUpdatePage.mockResolvedValueOnce([basePage({ status: "published", hasDraft: false })]);

		await publishPage("page-1");

		expect(mockPromoteTranslationsToPublished).toHaveBeenCalledWith("page-1");
		expect(mockUpdatePage).toHaveBeenCalledWith("page-1", { status: "published", hasDraft: false });
	});
});

describe("unpublishPage", () => {
	beforeEach(() => {
		mockGetPage.mockReset();
		mockUpdatePage.mockReset();
	});

	it("throws NotFoundError when page does not exist", async () => {
		mockGetPage.mockResolvedValueOnce(undefined);

		expect(unpublishPage("nonexistent")).rejects.toThrow(NotFoundError);
	});

	it("sets status to unpublished", async () => {
		mockGetPage.mockResolvedValueOnce(basePage({ status: "published" }));
		mockUpdatePage.mockResolvedValueOnce([basePage({ status: "unpublished" })]);

		await unpublishPage("page-1");

		expect(mockUpdatePage).toHaveBeenCalledWith("page-1", { status: "unpublished" });
	});
});

describe("discardDraft", () => {
	beforeEach(() => {
		mockGetPage.mockReset();
		mockRevertTranslationsToDraft.mockReset();
		mockUpdatePage.mockReset();
	});

	it("throws NotFoundError when page does not exist", async () => {
		mockGetPage.mockResolvedValueOnce(undefined);

		expect(discardDraft("nonexistent")).rejects.toThrow(NotFoundError);
	});

	it("reverts translations and sets hasDraft to false", async () => {
		mockGetPage.mockResolvedValueOnce(basePage({ status: "published", hasDraft: true }));
		mockRevertTranslationsToDraft.mockResolvedValueOnce([]);
		mockUpdatePage.mockResolvedValueOnce([basePage({ status: "published", hasDraft: false })]);

		await discardDraft("page-1");

		expect(mockRevertTranslationsToDraft).toHaveBeenCalledWith("page-1");
		expect(mockUpdatePage).toHaveBeenCalledWith("page-1", { hasDraft: false });
	});
});

describe("upsertTranslation", () => {
	beforeEach(() => {
		mockGetPage.mockReset();
		mockUpsertTranslation.mockReset();
		mockUpdatePage.mockReset();
	});

	it("throws NotFoundError when page does not exist", async () => {
		mockGetPage.mockResolvedValueOnce(undefined);

		expect(upsertTranslation("nonexistent", "en", { title: "Home" })).rejects.toThrow(NotFoundError);
	});

	it("upserts translation and returns it", async () => {
		mockGetPage.mockResolvedValueOnce(basePage({ status: "draft", hasDraft: true }));
		mockUpsertTranslation.mockResolvedValueOnce([baseTranslation()]);

		const result = await upsertTranslation("page-1", "en", { title: "Home" });

		expect(result).toMatchObject({ pageId: "page-1", languageCode: "en", title: "Home" });
	});

	it("sets hasDraft to true when saving translation on a published page with no draft", async () => {
		mockGetPage.mockResolvedValueOnce(basePage({ status: "published", hasDraft: false }));
		mockUpsertTranslation.mockResolvedValueOnce([baseTranslation()]);
		mockUpdatePage.mockResolvedValueOnce([basePage({ status: "published", hasDraft: true })]);

		await upsertTranslation("page-1", "en", { title: "Home" });

		expect(mockUpdatePage).toHaveBeenCalledWith("page-1", { hasDraft: true });
	});
});
