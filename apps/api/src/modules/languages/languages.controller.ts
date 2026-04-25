import { authPlugin } from "@shared/middleware/auth.middleware";
import { Elysia } from "elysia";
import { createLanguage, deleteLanguage, listLanguages, updateLanguage } from "./languages.service";
import { CreateLanguageSchema, UpdateLanguageSchema } from "./languages.types";

export const languagesController = new Elysia({ prefix: "/languages" })
	.use(authPlugin)
	.get("/", () => listLanguages())
	.post("/", ({ body }) => createLanguage(body), {
		body: CreateLanguageSchema,
		requireAuth: true,
	})
	.patch("/:id", ({ params, body }) => updateLanguage(params.id, body), {
		body: UpdateLanguageSchema,
		requireAuth: true,
	})
	.delete(
		"/:id",
		async ({ params, set }) => {
			await deleteLanguage(params.id);
			set.status = 204;
		},
		{ requireAuth: true },
	);
