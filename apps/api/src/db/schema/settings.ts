import { sqliteTable, text } from "drizzle-orm/sqlite-core";

export const settings = sqliteTable("settings", {
	id: text("id").primaryKey(),
	key: text("key").notNull().unique(),
	value: text("value", { mode: "json" }).notNull().default("null"),
});

export type Setting = typeof settings.$inferSelect;
export type NewSetting = typeof settings.$inferInsert;
