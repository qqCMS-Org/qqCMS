import { authPlugin } from "@api/middleware/auth.middleware";
import { triggerRebuild } from "@modules/rebuild";
import { Elysia } from "elysia";
import { listSettings, setSetting } from "./settings.service";
import { SetSettingSchema } from "./settings.types";

export const settingsController = new Elysia({ prefix: "/settings" })
	.use(authPlugin)
	.get("/", () => listSettings(), { requireAuth: true })
	.post(
		"/rebuilds",
		async () => {
			await triggerRebuild();
			return { success: true };
		},
		{ requireAuth: true },
	)
	.put("/:key", ({ params, body }) => setSetting(params.key, body.value), {
		body: SetSettingSchema,
		requireAuth: true,
	});
