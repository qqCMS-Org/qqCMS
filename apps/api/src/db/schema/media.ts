import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

export const media = pgTable("media", {
	id: text("id").primaryKey(),
	filename: text("filename").notNull(),
	originalName: text("original_name").notNull(),
	mimeType: text("mime_type").notNull(),
	size: integer("size").notNull(),
	url: text("url").notNull(),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type Media = typeof media.$inferSelect;
export type NewMedia = typeof media.$inferInsert;
