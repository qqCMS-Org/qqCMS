import { Elysia, t } from "elysia"
import { authMiddleware } from "@shared/middleware/auth.middleware"
import { ERROR_CODES } from "@shared/constants"
import { deleteMedia, listMedia, uploadMedia } from "./media.service"

export const mediaController = new Elysia({ prefix: "/media" })
  .use(authMiddleware)
  .get("/", () => listMedia(), { requireAuth: true })
  .post(
    "/",
    async ({ body, set }) => {
      const result = await uploadMedia(body.file)

      if ("error" in result) {
        if (result.error === "unsupported_mime_type") {
          set.status = 415
          return { error: "Unsupported media type", code: ERROR_CODES.UNSUPPORTED_MEDIA_TYPE }
        }
        set.status = 413
        return { error: "File too large", code: ERROR_CODES.PAYLOAD_TOO_LARGE }
      }

      set.status = 201
      return result.data
    },
    {
      requireAuth: true,
      body: t.Object({
        file: t.File(),
      }),
    },
  )
  .delete(
    "/:id",
    async ({ params, set }) => {
      const deleted = await deleteMedia(params.id)
      if (!deleted) {
        set.status = 404
        return { error: "Media not found", code: ERROR_CODES.NOT_FOUND }
      }
      set.status = 204
    },
    { requireAuth: true },
  )
