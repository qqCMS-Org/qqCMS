import { boolean, pgEnum, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const pageStatusEnum = pgEnum("page_status", ["draft", "published"]);

export const pages = pgTable("pages", {
	id: text("id").primaryKey(),
	slug: text("slug").notNull().unique(),
	status: pageStatusEnum("status").notNull().default("draft"),
	isHomepage: boolean("is_homepage").notNull().default(false),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Page = typeof pages.$inferSelect;
export type NewPage = typeof pages.$inferInsert;
export type PageStatus = "draft" | "published";
