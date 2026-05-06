import { type Static, t } from "elysia";

export const CreatePageSchema = t.Object({
	slug: t.String({ minLength: 1 }),
	status: t.Optional(t.Union([t.Literal("draft"), t.Literal("published")])),
	isHomepage: t.Optional(t.Boolean()),
});

export const UpdatePageSchema = t.Object({
	slug: t.Optional(t.String({ minLength: 1 })),
	status: t.Optional(t.Union([t.Literal("draft"), t.Literal("published")])),
	isHomepage: t.Optional(t.Boolean()),
});

export const UpsertTranslationSchema = t.Object({
	title: t.String({ minLength: 1 }),
	content: t.Optional(t.Record(t.String(), t.Unknown())),
});

export type CreatePageInput = Static<typeof CreatePageSchema>;
export type UpdatePageInput = Static<typeof UpdatePageSchema>;
export type UpsertTranslationInput = Static<typeof UpsertTranslationSchema>;
