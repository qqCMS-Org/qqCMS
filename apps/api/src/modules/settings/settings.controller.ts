import { authPlugin } from "@api/middleware/auth.middleware";
import { triggerRebuild } from "@modules/rebuild";
import { Elysia } from "elysia";
import { listSettings, setSetting } from "./settings.service";
import { SetSettingSchema } from "./settings.types";

const REBUILD_FAILED_ERROR = "Failed to trigger rebuild";
const REBUILD_FAILED_CODE = "REBUILD_FAILED";

export const settingsController = new Elysia({ prefix: "/settings" })
	.use(authPlugin)
	.get("/", () => listSettings())
	.post(
		"/rebuilds",
		async ({ set }) => {
			const success = await triggerRebuild();
			if (!success) {
				set.status = 500;
				return { error: REBUILD_FAILED_ERROR, code: REBUILD_FAILED_CODE };
			}
			return { success: true };
		},
		{ requireAuth: true },
	)
	.put("/:key", ({ params, body }) => setSetting(params.key, body.value), {
		body: SetSettingSchema,
		requireAuth: true,
	});
