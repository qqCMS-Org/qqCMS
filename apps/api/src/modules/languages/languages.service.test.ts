import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { Language } from "@schema/languages";
import { ConflictError, NotFoundError } from "@shared/errors";

const mockGetLanguages = mock((): Promise<Language[]> => Promise.resolve([]));
const mockGetLanguage = mock((): Promise<Language | undefined> => Promise.resolve(undefined));
const mockGetLanguageByCode = mock((): Promise<Language | undefined> => Promise.resolve(undefined));
const mockInsertLanguage = mock(
	(): Promise<Language[]> => Promise.resolve([{ id: "lang-1", code: "en", label: "English", isActive: true }]),
);
const mockUpdateLanguage = mock(
	(): Promise<Language[]> => Promise.resolve([{ id: "lang-1", code: "en", label: "English (US)", isActive: true }]),
);
const mockDeleteLanguage = mock(() => Promise.resolve());

mock.module("@repository/languages", () => ({
	getLanguages: mockGetLanguages,
	getLanguage: mockGetLanguage,
	getLanguageByCode: mockGetLanguageByCode,
	insertLanguage: mockInsertLanguage,
	updateLanguage: mockUpdateLanguage,
	deleteLanguage: mockDeleteLanguage,
}));

mock.module("@modules/rebuild", () => ({
	triggerRebuild: mock(() => Promise.resolve()),
}));

const { createLanguage, updateLanguage, deleteLanguage } = await import("./languages.service");

describe("createLanguage", () => {
	beforeEach(() => {
		mockGetLanguageByCode.mockReset();
		mockInsertLanguage.mockReset();
		mockInsertLanguage.mockResolvedValue([
			{ id: "lang-1", code: "en", label: "English", isActive: true },
		] as Language[]);
	});

	it("throws ConflictError when language code already exists", async () => {
		mockGetLanguageByCode.mockResolvedValueOnce({ id: "lang-1", code: "en", label: "English", isActive: true });

		expect(createLanguage({ code: "en", label: "English", isActive: true })).rejects.toThrow(ConflictError);
	});

	it("creates language when code is unique", async () => {
		mockGetLanguageByCode.mockResolvedValueOnce(undefined);

		const result = await createLanguage({ code: "en", label: "English", isActive: true });

		expect(result).toMatchObject({ id: "lang-1", code: "en" });
		expect(mockInsertLanguage).toHaveBeenCalledTimes(1);
	});
});

describe("updateLanguage", () => {
	beforeEach(() => {
		mockGetLanguage.mockReset();
		mockUpdateLanguage.mockReset();
	});

	it("throws NotFoundError when language does not exist", async () => {
		mockGetLanguage.mockResolvedValueOnce(undefined);

		expect(updateLanguage("nonexistent", { label: "New Label" })).rejects.toThrow(NotFoundError);
	});

	it("updates existing language and returns it", async () => {
		mockGetLanguage.mockResolvedValueOnce({ id: "lang-1", code: "en", label: "English", isActive: true });
		mockUpdateLanguage.mockResolvedValueOnce([{ id: "lang-1", code: "en", label: "English (US)", isActive: true }]);

		const result = await updateLanguage("lang-1", { label: "English (US)" });

		expect(result).toMatchObject({ id: "lang-1", label: "English (US)" });
	});
});

describe("deleteLanguage", () => {
	beforeEach(() => {
		mockGetLanguage.mockReset();
		mockDeleteLanguage.mockReset();
	});

	it("throws NotFoundError when language does not exist", async () => {
		mockGetLanguage.mockResolvedValueOnce(undefined);

		expect(deleteLanguage("nonexistent")).rejects.toThrow(NotFoundError);
	});

	it("deletes existing language", async () => {
		mockGetLanguage.mockResolvedValueOnce({ id: "lang-1", code: "en", label: "English", isActive: true });
		mockDeleteLanguage.mockResolvedValueOnce(undefined);

		await deleteLanguage("lang-1");

		expect(mockDeleteLanguage).toHaveBeenCalledWith("lang-1");
	});
});
