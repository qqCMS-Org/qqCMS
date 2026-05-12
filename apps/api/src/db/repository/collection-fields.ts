import { db } from "@core/Database";
import type { NewCollectionField } from "@schema/collection-fields";
import { collectionFields } from "@schema/collection-fields";
import { asc, eq } from "drizzle-orm";

export const getFieldsByCollection = (collectionId: string) =>
	db
		.select()
		.from(collectionFields)
		.where(eq(collectionFields.collectionId, collectionId))
		.orderBy(asc(collectionFields.sortOrder));

export const getCollectionField = (id: string) =>
	db.query.collectionFields.findFirst({ where: eq(collectionFields.id, id) });

export const insertCollectionField = (data: Omit<NewCollectionField, "id">) =>
	db
		.insert(collectionFields)
		.values({ ...data, id: crypto.randomUUID() })
		.returning();

export const updateCollectionField = (
	id: string,
	data: Partial<Pick<NewCollectionField, "name" | "type" | "required" | "isUnique" | "localised">>,
) => db.update(collectionFields).set(data).where(eq(collectionFields.id, id)).returning();

export const deleteCollectionField = (id: string) => db.delete(collectionFields).where(eq(collectionFields.id, id));
