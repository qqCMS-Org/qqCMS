import { db } from "@core/Database";
import type { NewCollectionEntry } from "@schema/collection-entries";
import { collectionEntries } from "@schema/collection-entries";
import { asc, eq } from "drizzle-orm";

export const getEntriesByCollection = (collectionId: string) =>
	db
		.select()
		.from(collectionEntries)
		.where(eq(collectionEntries.collectionId, collectionId))
		.orderBy(asc(collectionEntries.createdAt));

export const getEntry = (id: string) =>
	db.query.collectionEntries.findFirst({
		where: eq(collectionEntries.id, id),
	});

export const insertEntry = (data: Omit<NewCollectionEntry, "id" | "createdAt" | "updatedAt">) =>
	db
		.insert(collectionEntries)
		.values({ ...data, id: crypto.randomUUID() })
		.returning();

export const updateEntry = (
	id: string,
	data: Partial<Omit<NewCollectionEntry, "id" | "collectionId" | "createdAt" | "updatedAt">>,
) =>
	db
		.update(collectionEntries)
		.set({ ...data, updatedAt: new Date() })
		.where(eq(collectionEntries.id, id))
		.returning();

export const deleteEntry = (id: string) => db.delete(collectionEntries).where(eq(collectionEntries.id, id));
