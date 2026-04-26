import { type Static, t } from "elysia";

export const CreateLanguageSchema = t.Object({
	code: t.String({ minLength: 2, maxLength: 10 }),
	label: t.String({ minLength: 1 }),
	isActive: t.Optional(t.Boolean()),
});

export const UpdateLanguageSchema = t.Object({
	label: t.Optional(t.String({ minLength: 1 })),
	isActive: t.Optional(t.Boolean()),
});

export type CreateLanguageInput = Static<typeof CreateLanguageSchema>;
export type UpdateLanguageInput = Static<typeof UpdateLanguageSchema>;
