import { beforeEach, describe, expect, it, mock } from "bun:test";
import { ConflictError, NotFoundError } from "@api/errors";

const nullifyEntryFieldKey = mock(() => Promise.resolve());
const renameEntryFieldKey = mock(() => Promise.resolve());
const deleteCollectionField = mock(() => Promise.resolve());
const updateCollectionField = mock(() => Promise.resolve([{ id: "field-1", name: "new_name" }]));
type FieldRow = {
	id: string;
	collectionId: string;
	name: string;
	type: string;
	required: boolean;
	isUnique: boolean;
	localised: boolean;
	sortOrder: number;
};
type CollectionRow = { id: string; name: string };

const getCollectionField = mock((): Promise<FieldRow | null> => Promise.resolve(null));
const getFieldsByCollection = mock(() => Promise.resolve([]));
const insertCollectionField = mock(() => Promise.resolve([{ id: "field-1", name: "title" }]));
const getCollection = mock((): Promise<CollectionRow | null> => Promise.resolve({ id: "col-1", name: "posts" }));

mock.module("@repository/collection-entries", () => ({
	nullifyEntryFieldKey,
	renameEntryFieldKey,
	getEntriesByCollection: mock(() => Promise.resolve([])),
	getEntry: mock(() => Promise.resolve(null)),
	insertEntry: mock(() => Promise.resolve([{}])),
	updateEntry: mock(() => Promise.resolve([{}])),
	deleteEntry: mock(() => Promise.resolve()),
}));

mock.module("@repository/collection-fields", () => ({
	getCollectionField,
	getFieldsByCollection,
	insertCollectionField,
	updateCollectionField,
	deleteCollectionField,
}));

mock.module("@repository/collections", () => ({
	getCollection,
	getCollections: mock(() => Promise.resolve([])),
	insertCollection: mock(() => Promise.resolve([{ id: "col-1", name: "posts" }])),
	deleteCollection: mock(() => Promise.resolve()),
}));

const { addField, removeField, updateField } = await import("./collections.service");

const COLLECTION_ID = "col-1";
const FIELD_ID = "field-1";

const makeField = (overrides: Record<string, unknown> = {}) => ({
	id: FIELD_ID,
	collectionId: COLLECTION_ID,
	name: "title",
	type: "Text",
	required: false,
	isUnique: false,
	localised: false,
	sortOrder: 0,
	...overrides,
});

beforeEach(() => {
	nullifyEntryFieldKey.mockClear();
	renameEntryFieldKey.mockClear();
	deleteCollectionField.mockClear();
	updateCollectionField.mockClear();
	getCollectionField.mockClear();
	getFieldsByCollection.mockClear();
	insertCollectionField.mockClear();
	getCollection.mockClear();

	getCollection.mockImplementation(() => Promise.resolve({ id: COLLECTION_ID, name: "posts" }));
});

// ─── addField ─────────────────────────────────────────────────────────────────

describe("addField", () => {
	it("throws ConflictError when DB returns unique violation code", async () => {
		getFieldsByCollection.mockImplementation(() => Promise.resolve([]));
		const uniqueError = Object.assign(new Error("duplicate"), { code: "23505" });
		insertCollectionField.mockImplementation(() => Promise.reject(uniqueError));

		await expect(addField(COLLECTION_ID, { name: "title", type: "Text" })).rejects.toThrow(ConflictError);
	});

	it("rethrows unknown DB errors without converting them to ConflictError", async () => {
		getFieldsByCollection.mockImplementation(() => Promise.resolve([]));
		insertCollectionField.mockImplementation(() => Promise.reject(new Error("DB unavailable")));

		await expect(addField(COLLECTION_ID, { name: "title", type: "Text" })).rejects.toThrow("DB unavailable");
	});

	it("throws NotFoundError when collection does not exist", async () => {
		getCollection.mockImplementation(() => Promise.resolve(null));

		await expect(addField(COLLECTION_ID, { name: "title", type: "Text" })).rejects.toThrow(NotFoundError);
	});
});

// ─── removeField ──────────────────────────────────────────────────────────────

describe("removeField", () => {
	it("throws NotFoundError when field belongs to a different collection", async () => {
		getCollectionField.mockImplementation(() => Promise.resolve(makeField({ collectionId: "other-col" })));

		await expect(removeField(COLLECTION_ID, FIELD_ID)).rejects.toThrow(NotFoundError);

		expect(nullifyEntryFieldKey).not.toHaveBeenCalled();
		expect(deleteCollectionField).not.toHaveBeenCalled();
	});

	it("throws NotFoundError when field does not exist", async () => {
		getCollectionField.mockImplementation(() => Promise.resolve(null));

		await expect(removeField(COLLECTION_ID, FIELD_ID)).rejects.toThrow(NotFoundError);
	});

	it("nullifies entry data and deletes field when ownership matches", async () => {
		getCollectionField.mockImplementation(() => Promise.resolve(makeField()));

		await removeField(COLLECTION_ID, FIELD_ID);

		expect(nullifyEntryFieldKey).toHaveBeenCalledWith(COLLECTION_ID, "title");
		expect(deleteCollectionField).toHaveBeenCalledWith(FIELD_ID);
	});
});

// ─── updateField ──────────────────────────────────────────────────────────────

describe("updateField", () => {
	it("updates the field row before touching entry data", async () => {
		getCollectionField.mockImplementation(() => Promise.resolve(makeField()));
		const callOrder: string[] = [];
		updateCollectionField.mockImplementation(async () => {
			callOrder.push("updateCollectionField");
			return [makeField({ name: "new_name" })];
		});
		renameEntryFieldKey.mockImplementation(async () => {
			callOrder.push("renameEntryFieldKey");
		});

		await updateField(COLLECTION_ID, FIELD_ID, { name: "new_name" });

		expect(callOrder[0]).toBe("updateCollectionField");
		expect(callOrder[1]).toBe("renameEntryFieldKey");
	});

	it("does not mutate entry data when updateCollectionField fails with conflict", async () => {
		getCollectionField.mockImplementation(() => Promise.resolve(makeField()));
		const uniqueError = Object.assign(new Error("duplicate"), { code: "23505" });
		updateCollectionField.mockImplementation(() => Promise.reject(uniqueError));

		await expect(updateField(COLLECTION_ID, FIELD_ID, { name: "other_name" })).rejects.toThrow(ConflictError);

		expect(nullifyEntryFieldKey).not.toHaveBeenCalled();
		expect(renameEntryFieldKey).not.toHaveBeenCalled();
	});

	it("renames entry field key when name changes", async () => {
		getCollectionField.mockImplementation(() => Promise.resolve(makeField()));
		updateCollectionField.mockImplementation(() => Promise.resolve([makeField({ name: "body" })]));

		await updateField(COLLECTION_ID, FIELD_ID, { name: "body" });

		expect(renameEntryFieldKey).toHaveBeenCalledWith(COLLECTION_ID, "title", "body");
		expect(nullifyEntryFieldKey).not.toHaveBeenCalled();
	});

	it("nullifies entry field key when type changes", async () => {
		getCollectionField.mockImplementation(() => Promise.resolve(makeField({ type: "Text" })));
		updateCollectionField.mockImplementation(() => Promise.resolve([makeField({ type: "Number" })]));

		await updateField(COLLECTION_ID, FIELD_ID, { type: "Number" });

		expect(nullifyEntryFieldKey).toHaveBeenCalledWith(COLLECTION_ID, "title");
		expect(renameEntryFieldKey).not.toHaveBeenCalled();
	});

	it("throws NotFoundError when field belongs to a different collection", async () => {
		getCollectionField.mockImplementation(() => Promise.resolve(makeField({ collectionId: "other-col" })));

		await expect(updateField(COLLECTION_ID, FIELD_ID, { name: "body" })).rejects.toThrow(NotFoundError);
	});
});
