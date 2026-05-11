import { ConflictError, NotFoundError } from "@api/errors";
import {
	deleteEntry,
	getEntriesByCollection,
	getEntry,
	insertEntry,
	updateEntry,
} from "@repository/collection-entries";
import { deleteCollectionField, getFieldsByCollection, insertCollectionField } from "@repository/collection-fields";
import { deleteCollection, getCollection, getCollections, insertCollection } from "@repository/collections";
import type { FieldType } from "@schema/collection-fields";
import type { AddFieldInput, CreateCollectionInput, UpsertEntryInput } from "./collections.types";

export const listCollections = () => getCollections();

export const createCollection = async (data: CreateCollectionInput) => {
	const [created] = await insertCollection({ name: data.name }).catch(() => {
		throw new ConflictError("Collection with this name already exists");
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
	}).catch(() => {
		throw new ConflictError("Field with this name already exists in the collection");
	});

	return field;
};

export const removeField = async (collectionId: string, fieldId: string) => {
	const existing = await getCollection(collectionId);
	if (!existing) throw new NotFoundError("Collection not found");
	await deleteCollectionField(fieldId);
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
