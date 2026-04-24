import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const media = sqliteTable("media", {
	id: text("id").primaryKey(),
	filename: text("filename").notNull(),
	originalName: text("original_name").notNull(),
	mimeType: text("mime_type").notNull(),
	size: integer("size").notNull(),
	url: text("url").notNull(),
	createdAt: text("created_at").notNull().default("CURRENT_TIMESTAMP"),
});

export type Media = typeof media.$inferSelect;
export type NewMedia = typeof media.$inferInsert;
