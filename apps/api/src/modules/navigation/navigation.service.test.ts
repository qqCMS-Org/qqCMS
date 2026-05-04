import { beforeEach, describe, expect, it, mock } from "bun:test";
import { NotFoundError } from "@api/errors";
import type { NavigationItem } from "@schema/navigation-items";

const mockGetNavigationItems = mock((): Promise<NavigationItem[]> => Promise.resolve([]));
const mockGetNavigationItem = mock((): Promise<NavigationItem | undefined> => Promise.resolve(undefined));
const mockInsertNavigationItem = mock(
	(): Promise<NavigationItem[]> =>
		Promise.resolve([{ id: "nav-1", label: { en: "Home" }, href: "/", order: 0, parentId: null }]),
);
const mockUpdateNavigationItem = mock(
	(): Promise<NavigationItem[]> =>
		Promise.resolve([{ id: "nav-1", label: { en: "Updated" }, href: "/", order: 0, parentId: null }]),
);
const mockDeleteNavigationItem = mock(() => Promise.resolve());
const mockReorderNavigationItems = mock((): Promise<NavigationItem[]> => Promise.resolve([]));

mock.module("@repository/navigation-items", () => ({
	getNavigationItems: mockGetNavigationItems,
	getNavigationItem: mockGetNavigationItem,
	insertNavigationItem: mockInsertNavigationItem,
	updateNavigationItem: mockUpdateNavigationItem,
	deleteNavigationItem: mockDeleteNavigationItem,
	reorderNavigationItems: mockReorderNavigationItems,
}));

mock.module("@modules/rebuild", () => ({
	triggerRebuild: mock(() => Promise.resolve()),
}));

const { createNavigationItem, updateNavigationItem, deleteNavigationItem, reorderItems } = await import(
	"./navigation.service"
);

describe("createNavigationItem", () => {
	beforeEach(() => {
		mockInsertNavigationItem.mockReset();
		mockInsertNavigationItem.mockResolvedValue([
			{ id: "nav-1", label: { en: "Home" }, href: "/", order: 0, parentId: null },
		] as NavigationItem[]);
	});

	it("creates a navigation item and returns it", async () => {
		const result = await createNavigationItem({ label: { en: "Home" }, href: "/" });

		expect(result).toMatchObject({ id: "nav-1", href: "/" });
		expect(mockInsertNavigationItem).toHaveBeenCalledWith({ label: { en: "Home" }, href: "/" });
	});
});

describe("updateNavigationItem", () => {
	beforeEach(() => {
		mockGetNavigationItem.mockReset();
		mockUpdateNavigationItem.mockReset();
	});

	it("throws NotFoundError when item does not exist", async () => {
		mockGetNavigationItem.mockResolvedValueOnce(undefined);

		expect(updateNavigationItem("nonexistent", { href: "/new" })).rejects.toThrow(NotFoundError);
	});

	it("updates existing item and returns it", async () => {
		mockGetNavigationItem.mockResolvedValueOnce({
			id: "nav-1",
			label: { en: "Home" },
			href: "/",
			order: 0,
			parentId: null,
		});
		mockUpdateNavigationItem.mockResolvedValueOnce([
			{ id: "nav-1", label: { en: "Updated" }, href: "/new", order: 0, parentId: null },
		]);

		const result = await updateNavigationItem("nav-1", { href: "/new" });

		expect(result).toMatchObject({ id: "nav-1", href: "/new" });
	});
});

describe("deleteNavigationItem", () => {
	beforeEach(() => {
		mockGetNavigationItem.mockReset();
		mockDeleteNavigationItem.mockReset();
	});

	it("throws NotFoundError when item does not exist", async () => {
		mockGetNavigationItem.mockResolvedValueOnce(undefined);

		expect(deleteNavigationItem("nonexistent")).rejects.toThrow(NotFoundError);
	});

	it("deletes existing item", async () => {
		mockGetNavigationItem.mockResolvedValueOnce({
			id: "nav-1",
			label: { en: "Home" },
			href: "/",
			order: 0,
			parentId: null,
		});
		mockDeleteNavigationItem.mockResolvedValueOnce(undefined);

		await deleteNavigationItem("nav-1");

		expect(mockDeleteNavigationItem).toHaveBeenCalledWith("nav-1");
	});
});

describe("reorderItems", () => {
	beforeEach(() => {
		mockReorderNavigationItems.mockReset();
	});

	it("passes ordered ids to repository and returns result", async () => {
		const orderedIds = ["nav-3", "nav-1", "nav-2"];
		const reordered: NavigationItem[] = [
			{ id: "nav-3", label: { en: "C" }, href: "/c", order: 0, parentId: null },
			{ id: "nav-1", label: { en: "A" }, href: "/a", order: 1, parentId: null },
			{ id: "nav-2", label: { en: "B" }, href: "/b", order: 2, parentId: null },
		];
		mockReorderNavigationItems.mockResolvedValueOnce(reordered);

		const result = await reorderItems({ orderedIds });

		expect(mockReorderNavigationItems).toHaveBeenCalledWith(orderedIds);
		expect(result).toEqual(reordered);
	});
});
