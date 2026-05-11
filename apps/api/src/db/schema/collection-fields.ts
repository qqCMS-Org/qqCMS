import { boolean, integer, pgEnum, pgTable, text, unique } from "drizzle-orm/pg-core";
import { collections } from "./collections";

export const fieldTypeEnum = pgEnum("field_type", ["Text", "Number", "Boolean", "Rich text", "Media", "Date"]);

export const collectionFields = pgTable(
	"collection_fields",
	{
		id: text("id").primaryKey(),
		collectionId: text("collection_id")
			.notNull()
			.references(() => collections.id, { onDelete: "cascade" }),
		name: text("name").notNull(),
		type: fieldTypeEnum("type").notNull().default("Text"),
		required: boolean("required").notNull().default(false),
		isUnique: boolean("is_unique").notNull().default(false),
		localised: boolean("localised").notNull().default(false),
		sortOrder: integer("sort_order").notNull().default(0),
	},
	(table) => [unique("collection_field_name_unique").on(table.collectionId, table.name)],
);

export type CollectionField = typeof collectionFields.$inferSelect;
export type NewCollectionField = typeof collectionFields.$inferInsert;
export type FieldType = (typeof fieldTypeEnum.enumValues)[number];
