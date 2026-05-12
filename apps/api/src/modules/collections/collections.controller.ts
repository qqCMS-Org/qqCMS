import { authPlugin } from "@api/middleware/auth.middleware";
import { Elysia } from "elysia";
import {
	addField,
	createCollection,
	createEntry,
	listCollections,
	listEntries,
	listFields,
	removeCollection,
	removeEntry,
	removeField,
	updateEntryData,
	updateField,
} from "./collections.service";
import { AddFieldSchema, CreateCollectionSchema, UpdateFieldSchema, UpsertEntrySchema } from "./collections.types";

export const collectionsController = new Elysia({ prefix: "/collections" })
	.use(authPlugin)
	// Collections
	.get("/", () => listCollections())
	.post("/", ({ body }) => createCollection(body), {
		body: CreateCollectionSchema,
		requireAuth: true,
	})
	.delete(
		"/:id",
		async ({ params, set }) => {
			await removeCollection(params.id);
			set.status = 204;
		},
		{ requireAuth: true },
	)
	// Fields
	.get("/:id/fields", ({ params }) => listFields(params.id))
	.post("/:id/fields", ({ params, body }) => addField(params.id, body), {
		body: AddFieldSchema,
		requireAuth: true,
	})
	.patch("/:id/fields/:fieldId", ({ params, body }) => updateField(params.id, params.fieldId, body), {
		body: UpdateFieldSchema,
		requireAuth: true,
	})
	.delete(
		"/:id/fields/:fieldId",
		async ({ params, set }) => {
			await removeField(params.id, params.fieldId);
			set.status = 204;
		},
		{ requireAuth: true },
	)
	// Entries
	.get("/:id/entries", ({ params }) => listEntries(params.id))
	.post("/:id/entries", ({ params, body }) => createEntry(params.id, body), {
		body: UpsertEntrySchema,
		requireAuth: true,
	})
	.patch("/:id/entries/:entryId", ({ params, body }) => updateEntryData(params.id, params.entryId, body), {
		body: UpsertEntrySchema,
		requireAuth: true,
	})
	.delete(
		"/:id/entries/:entryId",
		async ({ params, set }) => {
			await removeEntry(params.id, params.entryId);
			set.status = 204;
		},
		{ requireAuth: true },
	);
