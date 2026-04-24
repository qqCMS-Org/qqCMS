import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const pages = sqliteTable("pages", {
	id: text("id").primaryKey(),
	slug: text("slug").notNull().unique(),
	isHomepage: integer("is_homepage", { mode: "boolean" }).notNull().default(false),
	createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
	updatedAt: text("updated_at").notNull().default("CURRENT_TIMESTAMP"),
});

export type Page = typeof pages.$inferSelect;
export type NewPage = typeof pages.$inferInsert;
