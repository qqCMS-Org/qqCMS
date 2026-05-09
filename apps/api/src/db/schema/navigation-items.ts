import { type AnyPgColumn, integer, jsonb, pgTable, text } from "drizzle-orm/pg-core";

export const navigationItems = pgTable("navigation_items", {
	id: text("id").primaryKey(),
	label: jsonb("label").$type<Record<string, string>>().notNull().default({}),
	href: text("href").notNull(),
	order: integer("order").notNull().default(0),
	parentId: text("parent_id").references((): AnyPgColumn => navigationItems.id, { onDelete: "set null" }),
});

export type NavigationItem = typeof navigationItems.$inferSelect;
export type NewNavigationItem = typeof navigationItems.$inferInsert;
