import { authPlugin } from "@api/middleware/auth.middleware";
import { Elysia } from "elysia";
import {
	createPage,
	deletePage,
	discardDraft,
	getPage,
	listPages,
	publishPage,
	unpublishPage,
	updatePage,
	upsertTranslation,
} from "./pages.service";
import { CreatePageSchema, UpdatePageSchema, UpsertTranslationSchema } from "./pages.types";

export const pagesController = new Elysia({ prefix: "/pages" })
	.use(authPlugin)
	.get("/", () => listPages())
	.get("/:id", ({ params }) => getPage(params.id))
	.post("/", ({ body }) => createPage(body), {
		body: CreatePageSchema,
		requireAuth: true,
	})
	.patch("/:id", ({ params, body }) => updatePage(params.id, body), {
		body: UpdatePageSchema,
		requireAuth: true,
	})
	.delete(
		"/:id",
		async ({ params, set }) => {
			await deletePage(params.id);
			set.status = 204;
		},
		{ requireAuth: true },
	)
	.post("/:id/publish", ({ params }) => publishPage(params.id), { requireAuth: true })
	.post("/:id/unpublish", ({ params }) => unpublishPage(params.id), { requireAuth: true })
	.delete(
		"/:id/draft",
		async ({ params, set }) => {
			await discardDraft(params.id);
			set.status = 204;
		},
		{ requireAuth: true },
	)
	.put("/:id/translations/:lang", ({ params, body }) => upsertTranslation(params.id, params.lang, body), {
		body: UpsertTranslationSchema,
		requireAuth: true,
	});
