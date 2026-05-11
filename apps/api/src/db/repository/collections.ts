import { db } from "@core/Database";
import { collectionFields } from "@schema/collection-fields";
import type { NewCollection } from "@schema/collections";
import { collections } from "@schema/collections";
import { asc, count, eq, sql } from "drizzle-orm";

export const getCollections = () =>
	db
		.select({
			id: collections.id,
			name: collections.name,
			createdAt: collections.createdAt,
			updatedAt: collections.updatedAt,
			fieldCount: count(collectionFields.id),
			entryCount: sql<number>`(select count(*) from collection_entries where collection_id = ${collections.id})::int`,
		})
		.from(collections)
		.leftJoin(collectionFields, eq(collectionFields.collectionId, collections.id))
		.groupBy(collections.id)
		.orderBy(asc(collections.name));

export const getCollection = (id: string) =>
	db.query.collections.findFirst({
		where: eq(collections.id, id),
	});

export const insertCollection = (data: Omit<NewCollection, "id" | "createdAt" | "updatedAt">) =>
	db
		.insert(collections)
		.values({ ...data, id: crypto.randomUUID() })
		.returning();

export const deleteCollection = (id: string) => db.delete(collections).where(eq(collections.id, id));
