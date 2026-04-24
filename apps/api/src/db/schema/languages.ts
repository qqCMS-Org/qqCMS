import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const languages = sqliteTable("languages", {
	id: text("id").primaryKey(),
	code: text("code").notNull().unique(),
	label: text("label").notNull(),
	isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
});

export type Language = typeof languages.$inferSelect;
export type NewLanguage = typeof languages.$inferInsert;
