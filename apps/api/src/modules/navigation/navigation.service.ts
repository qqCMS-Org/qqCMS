import {
	deleteNavigationItem as deleteNavigationItemInDb,
	getNavigationItem as getNavigationItemById,
	getNavigationItems,
	insertNavigationItem,
	reorderNavigationItems,
	updateNavigationItem as updateNavigationItemInDb,
} from "@repository/navigation-items";
import { NotFoundError } from "@shared/errors";
import type { CreateNavigationItemInput, ReorderInput, UpdateNavigationItemInput } from "./navigation.types";

export const listNavigationItems = () => getNavigationItems();

export const createNavigationItem = async (data: CreateNavigationItemInput) => {
	const [item] = await insertNavigationItem(data);
	return item;
};

export const updateNavigationItem = async (id: string, data: UpdateNavigationItemInput) => {
	const existing = await getNavigationItemById(id);
	if (!existing) throw new NotFoundError("Navigation item not found");

	const [updated] = await updateNavigationItemInDb(id, data);
	return updated;
};

export const deleteNavigationItem = async (id: string) => {
	const existing = await getNavigationItemById(id);
	if (!existing) throw new NotFoundError("Navigation item not found");

	await deleteNavigationItemInDb(id);
};

export const reorderItems = async (data: ReorderInput) => {
	return reorderNavigationItems(data.orderedIds);
};
