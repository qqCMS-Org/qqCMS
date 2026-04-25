import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { Setting } from "@schema/settings";

const mockGetSettings = mock((): Promise<Setting[]> => Promise.resolve([]));
const mockUpsertSetting = mock(
	(): Promise<Setting[]> => Promise.resolve([{ id: "setting-1", key: "site_title", value: "My Site" }]),
);

mock.module("@repository/settings", () => ({
	getSettings: mockGetSettings,
	upsertSetting: mockUpsertSetting,
}));

mock.module("@modules/rebuild", () => ({
	triggerRebuild: mock(() => Promise.resolve()),
}));

const { listSettings, setSetting } = await import("./settings.service");

describe("listSettings", () => {
	beforeEach(() => {
		mockGetSettings.mockReset();
	});

	it("returns all settings", async () => {
		const settings = [
			{ id: "s-1", key: "site_title", value: "My CMS" },
			{ id: "s-2", key: "items_per_page", value: 10 },
		];
		mockGetSettings.mockResolvedValueOnce(settings);

		const result = await listSettings();

		expect(result).toEqual(settings);
	});
});

describe("setSetting", () => {
	beforeEach(() => {
		mockUpsertSetting.mockReset();
		mockUpsertSetting.mockResolvedValue([{ id: "setting-1", key: "site_title", value: "My Site" }]);
	});

	it("upserts a setting and returns it", async () => {
		const result = await setSetting("site_title", "My Site");

		expect(result).toMatchObject({ key: "site_title", value: "My Site" });
		expect(mockUpsertSetting).toHaveBeenCalledWith("site_title", "My Site");
	});

	it("accepts complex JSON values", async () => {
		const complexValue = { theme: "dark", accentColor: "#ff0000" };
		mockUpsertSetting.mockResolvedValueOnce([{ id: "setting-1", key: "theme_config", value: complexValue }]);

		const result = await setSetting("theme_config", complexValue);

		expect(result).toMatchObject({ key: "theme_config", value: complexValue });
		expect(mockUpsertSetting).toHaveBeenCalledWith("theme_config", complexValue);
	});
});
