import { jsonb, pgTable, text } from "drizzle-orm/pg-core";

export const settings = pgTable("settings", {
	id: text("id").primaryKey(),
	key: text("key").notNull().unique(),
	value: jsonb("value").notNull().default(null),
});

export type Setting = typeof settings.$inferSelect;
export type NewSetting = typeof settings.$inferInsert;
