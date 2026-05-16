import { boolean, pgTable, text } from "drizzle-orm/pg-core";

export const languages = pgTable("languages", {
	id: text("id").primaryKey(),
	code: text("code").notNull().unique(),
	label: text("label").notNull(),
	isActive: boolean("is_active").notNull().default(true),
	isDefault: boolean("is_default").notNull().default(false),
});

export type Language = typeof languages.$inferSelect;
export type NewLanguage = typeof languages.$inferInsert;
