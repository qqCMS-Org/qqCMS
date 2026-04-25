import { integer, jsonb, pgTable, text } from "drizzle-orm/pg-core";

export const navigationItems = pgTable("navigation_items", {
	id: text("id").primaryKey(),
	label: jsonb("label").notNull().default({}),
	href: text("href").notNull(),
	order: integer("order").notNull().default(0),
	parentId: text("parent_id"),
});

export type NavigationItem = typeof navigationItems.$inferSelect;
export type NewNavigationItem = typeof navigationItems.$inferInsert;
