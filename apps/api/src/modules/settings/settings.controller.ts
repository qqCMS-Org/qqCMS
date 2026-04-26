import { authPlugin } from "@shared/middleware/auth.middleware";
import { Elysia } from "elysia";
import { listSettings, setSetting } from "./settings.service";
import { SetSettingSchema } from "./settings.types";

export const settingsController = new Elysia({ prefix: "/settings" })
	.use(authPlugin)
	.get("/", () => listSettings())
	.put("/:key", ({ params, body }) => setSetting(params.key, body.value), {
		body: SetSettingSchema,
		requireAuth: true,
	});
