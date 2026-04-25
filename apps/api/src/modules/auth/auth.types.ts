import { type Static, t } from "elysia";

export const LoginSchema = t.Object({
	login: t.String({ minLength: 1 }),
	password: t.String({ minLength: 1 }),
});

export type LoginInput = Static<typeof LoginSchema>;
