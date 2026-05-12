import { type Static, t } from "elysia";

export const FIELD_TYPES = ["Text", "Number", "Boolean", "Rich text", "Media", "Date"] as const;

export const CreateCollectionSchema = t.Object({
	name: t.String({ minLength: 1, maxLength: 100, pattern: "^[a-z0-9_]+$" }),
});

export const AddFieldSchema = t.Object({
	name: t.String({ minLength: 1, maxLength: 64, pattern: "^[a-z0-9_]+$" }),
	type: t.Union(
		FIELD_TYPES.map((ft) => t.Literal(ft)) as [ReturnType<typeof t.Literal>, ...ReturnType<typeof t.Literal>[]],
	),
	required: t.Optional(t.Boolean()),
	isUnique: t.Optional(t.Boolean()),
	localised: t.Optional(t.Boolean()),
});

export const UpdateFieldSchema = t.Object({
	name: t.Optional(t.String({ minLength: 1, maxLength: 64, pattern: "^[a-z0-9_]+$" })),
	type: t.Optional(
		t.Union(
			FIELD_TYPES.map((ft) => t.Literal(ft)) as [ReturnType<typeof t.Literal>, ...ReturnType<typeof t.Literal>[]],
		),
	),
	required: t.Optional(t.Boolean()),
	isUnique: t.Optional(t.Boolean()),
	localised: t.Optional(t.Boolean()),
});

export const UpsertEntrySchema = t.Object({
	data: t.Record(t.String(), t.Unknown()),
});

export type CreateCollectionInput = Static<typeof CreateCollectionSchema>;
export type AddFieldInput = Static<typeof AddFieldSchema>;
export type UpdateFieldInput = Static<typeof UpdateFieldSchema>;
export type UpsertEntryInput = Static<typeof UpsertEntrySchema>;
