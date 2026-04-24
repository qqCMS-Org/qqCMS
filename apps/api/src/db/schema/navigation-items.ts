import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const navigationItems = sqliteTable("navigation_items", {
	id: text("id").primaryKey(),
	label: text("label", { mode: "json" }).notNull().default("{}"),
	href: text("href").notNull(),
	order: integer("order").notNull().default(0),
	parentId: text("parent_id"),
});

export type NavigationItem = typeof navigationItems.$inferSelect;
export type NewNavigationItem = typeof navigationItems.$inferInsert;
