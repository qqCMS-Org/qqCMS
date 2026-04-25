import { authPlugin } from "@shared/middleware/auth.middleware";
import { Elysia, t } from "elysia";
import { deleteMedia, listMedia, uploadMedia } from "./media.service";

export const mediaController = new Elysia({ prefix: "/media" })
	.use(authPlugin)
	.get("/", () => listMedia(), { requireAuth: true })
	.post(
		"/",
		async ({ body }) => {
			return uploadMedia(body.file);
		},
		{
			body: t.Object({ file: t.File() }),
			requireAuth: true,
		},
	)
	.delete(
		"/:id",
		async ({ params, set }) => {
			await deleteMedia(params.id);
			set.status = 204;
		},
		{ requireAuth: true },
	);
