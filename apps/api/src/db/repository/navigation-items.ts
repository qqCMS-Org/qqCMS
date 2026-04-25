import { db } from "@core/Database";
import type { NewNavigationItem } from "@schema/navigation-items";
import { navigationItems } from "@schema/navigation-items";
import { asc, eq, inArray } from "drizzle-orm";

export const getNavigationItems = () => db.select().from(navigationItems).orderBy(asc(navigationItems.order));

export const getNavigationItem = (id: string) =>
	db.query.navigationItems.findFirst({
		where: eq(navigationItems.id, id),
	});

export const insertNavigationItem = (data: Omit<NewNavigationItem, "id">) =>
	db
		.insert(navigationItems)
		.values({ ...data, id: crypto.randomUUID() })
		.returning();

export const updateNavigationItem = (id: string, data: Partial<Omit<NewNavigationItem, "id">>) =>
	db.update(navigationItems).set(data).where(eq(navigationItems.id, id)).returning();

export const deleteNavigationItem = (id: string) => db.delete(navigationItems).where(eq(navigationItems.id, id));

export const reorderNavigationItems = (orderedIds: string[]) =>
	db.transaction(async (tx) => {
		await Promise.all(
			orderedIds.map((id, index) => tx.update(navigationItems).set({ order: index }).where(eq(navigationItems.id, id))),
		);
		return tx
			.select()
			.from(navigationItems)
			.where(inArray(navigationItems.id, orderedIds))
			.orderBy(asc(navigationItems.order));
	});
