import { jsonb, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { collections } from "./collections";

export const collectionEntries = pgTable("collection_entries", {
	id: text("id").primaryKey(),
	collectionId: text("collection_id")
		.notNull()
		.references(() => collections.id, { onDelete: "cascade" }),
	data: jsonb("data").$type<Record<string, unknown>>().notNull().default({}),
	createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type CollectionEntry = typeof collectionEntries.$inferSelect;
export type NewCollectionEntry = typeof collectionEntries.$inferInsert;
