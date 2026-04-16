import { Elysia, t } from "elysia"
import { authMiddleware } from "@shared/middleware/auth.middleware"
import { listSettings, setSetting } from "./settings.service"

export const settingsController = new Elysia({ prefix: "/settings" })
  .use(authMiddleware)
  .get("/", () => listSettings())
  .put(
    "/:key",
    ({ params, body }) => setSetting(params.key, body.value),
    {
      requireAuth: true,
      body: t.Object({
        value: t.Any(),
      }),
    },
  )
