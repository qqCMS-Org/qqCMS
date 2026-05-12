import { ConflictError, NotFoundError } from "@api/errors";
import { db } from "@core/Database";
import {
	deleteEntry,
	getEntriesByCollection,
	getEntry,
	insertEntry,
	nullifyEntryFieldKey,
	updateEntry,
} from "@repository/collection-entries";
import {
	deleteCollectionField,
	getCollectionField,
	getFieldsByCollection,
	insertCollectionField,
} from "@repository/collection-fields";
import { deleteCollection, getCollection, getCollections, insertCollection } from "@repository/collections";
import { collectionEntries } from "@schema/collection-entries";
import type { FieldType } from "@schema/collection-fields";
import { collectionFields } from "@schema/collection-fields";
import { eq, sql } from "drizzle-orm";
import type { AddFieldInput, CreateCollectionInput, UpdateFieldInput, UpsertEntryInput } from "./collections.types";

export const listCollections = () => getCollections();

export const createCollection = async (data: CreateCollectionInput) => {
	const [created] = await insertCollection({ name: data.name }).catch((error: unknown) => {
		const isUniqueViolation =
			typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "23505";
		if (isUniqueViolation) throw new ConflictError("Collection with this name already exists");
		throw error;
	});
	return created;
};

export const removeCollection = async (id: string) => {
	const existing = await getCollection(id);
	if (!existing) throw new NotFoundError("Collection not found");
	await deleteCollection(id);
};

export const listFields = async (collectionId: string) => {
	const existing = await getCollection(collectionId);
	if (!existing) throw new NotFoundError("Collection not found");
	return getFieldsByCollection(collectionId);
};

export const addField = async (collectionId: string, data: AddFieldInput) => {
	const existing = await getCollection(collectionId);
	if (!existing) throw new NotFoundError("Collection not found");

	const fields = await getFieldsByCollection(collectionId);
	const sortOrder = fields.length;

	const [field] = await insertCollectionField({
		collectionId,
		name: data.name,
		type: data.type as FieldType,
		required: data.required ?? false,
		isUnique: data.isUnique ?? false,
		localised: data.localised ?? false,
		sortOrder,
	}).catch((error: unknown) => {
		const isUniqueViolation =
			typeof error === "object" && error !== null && "code" in error && (error as { code: string }).code === "23505";
		if (isUniqueViolation) throw new ConflictError("Field with this name already exists in the collection");
		throw error;
	});

	return field;
};

export const removeField = async (collectionId: string, fieldId: string) => {
	const existing = await getCollection(collectionId);
	if (!existing) throw new NotFoundError("Collection not found");

	const field = await getCollectionField(fieldId);
	if (!field || field.collectionId !== collectionId) throw new NotFoundError("Field not found");

	await nullifyEntryFieldKey(collectionId, field.name);
	await deleteCollectionField(fieldId);
};

export const updateField = async (collectionId: string, fieldId: string, data: UpdateFieldInput) => {
	const existing = await getCollection(collectionId);
	if (!existing) throw new NotFoundError("Collection not found");

	const field = await getCollectionField(fieldId);
	if (!field || field.collectionId !== collectionId) throw new NotFoundError("Field not found");

	const nameChanging = data.name !== undefined && data.name !== field.name;
	const typeChanging = data.type !== undefined && data.type !== field.type;

	return db.transaction(async (tx) => {
		const [updated] = await tx
			.update(collectionFields)
			.set({
				name: data.name,
				type: data.type as FieldType | undefined,
				required: data.required,
				isUnique: data.isUnique,
				localised: data.localised,
			})
			.where(eq(collectionFields.id, fieldId))
			.returning()
			.catch((error: unknown) => {
				const isUniqueViolation =
					typeof error === "object" &&
					error !== null &&
					"code" in error &&
					(error as { code: string }).code === "23505";
				if (isUniqueViolation) throw new ConflictError("A field with this name already exists in the collection");
				throw error;
			});

		if (typeChanging) {
			await tx
				.update(collectionEntries)
				.set({
					data: sql`jsonb_set(${collectionEntries.data}, ARRAY[${field.name}]::text[], 'null'::jsonb)`,
					updatedAt: new Date(),
				})
				.where(eq(collectionEntries.collectionId, collectionId));
		}

		if (nameChanging) {
			await tx
				.update(collectionEntries)
				.set({
					data: sql`(${collectionEntries.data} - ${field.name}) || jsonb_build_object(${data.name}, ${collectionEntries.data}->${field.name})`,
					updatedAt: new Date(),
				})
				.where(eq(collectionEntries.collectionId, collectionId));
		}

		return updated;
	});
};

export const listEntries = async (collectionId: string) => {
	const existing = await getCollection(collectionId);
	if (!existing) throw new NotFoundError("Collection not found");
	return getEntriesByCollection(collectionId);
};

export const createEntry = async (collectionId: string, data: UpsertEntryInput) => {
	const existing = await getCollection(collectionId);
	if (!existing) throw new NotFoundError("Collection not found");
	const [entry] = await insertEntry({ collectionId, data: data.data });
	return entry;
};

export const updateEntryData = async (collectionId: string, entryId: string, data: UpsertEntryInput) => {
	const entry = await getEntry(entryId);
	if (!entry || entry.collectionId !== collectionId) throw new NotFoundError("Entry not found");
	const [updated] = await updateEntry(entryId, { data: data.data });
	return updated;
};

export const removeEntry = async (collectionId: string, entryId: string) => {
	const entry = await getEntry(entryId);
	if (!entry || entry.collectionId !== collectionId) throw new NotFoundError("Entry not found");
	await deleteEntry(entryId);
};
