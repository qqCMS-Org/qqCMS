import { boolean, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const pages = pgTable("pages", {
	id: text("id").primaryKey(),
	slug: text("slug").notNull().unique(),
	isHomepage: boolean("is_homepage").notNull().default(false),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Page = typeof pages.$inferSelect;
export type NewPage = typeof pages.$inferInsert;
