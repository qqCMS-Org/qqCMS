import { NotFoundError } from "@api/errors";
import { authPlugin } from "@api/middleware/auth.middleware";
import { Elysia, t } from "elysia";
import { deleteMedia, getMedia, listMedia, uploadMedia } from "./media.service";

export const mediaController = new Elysia({ prefix: "/media" })
	.use(authPlugin)
	.get("/", () => listMedia(), { requireAuth: true })
	.get("/:id", async ({ params }) => {
		const record = await getMedia(params.id);
		if (!record) throw new NotFoundError("Media file not found");
		return record;
	})
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
