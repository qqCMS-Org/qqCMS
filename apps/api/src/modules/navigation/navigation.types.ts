import { type Static, t } from "elysia";

export const CreateNavigationItemSchema = t.Object({
	label: t.Record(t.String(), t.String()),
	href: t.String({ minLength: 1 }),
	order: t.Optional(t.Number({ minimum: 0 })),
	parentId: t.Optional(t.Nullable(t.String())),
});

export const UpdateNavigationItemSchema = t.Object({
	label: t.Optional(t.Record(t.String(), t.String())),
	href: t.Optional(t.String({ minLength: 1 })),
	order: t.Optional(t.Number({ minimum: 0 })),
	parentId: t.Optional(t.Nullable(t.String())),
});

export const ReorderSchema = t.Object({
	orderedIds: t.Array(t.String(), { minItems: 1 }),
});

export type CreateNavigationItemInput = Static<typeof CreateNavigationItemSchema>;
export type UpdateNavigationItemInput = Static<typeof UpdateNavigationItemSchema>;
export type ReorderInput = Static<typeof ReorderSchema>;
