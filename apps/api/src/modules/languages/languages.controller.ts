import { Elysia, t } from "elysia"
import { authMiddleware } from "@shared/middleware/auth.middleware"
import { ERROR_CODES } from "@shared/constants"
import { createLanguage, deleteLanguage, listLanguages, updateLanguage } from "./languages.service"

export const languagesController = new Elysia({ prefix: "/languages" })
  .use(authMiddleware)
  .get("/", () => listLanguages())
  .post(
    "/",
    async ({ body, set }) => {
      const result = await createLanguage(body)

      if ("error" in result) {
        set.status = 409
        return { error: "Language code already exists", code: ERROR_CODES.CONFLICT }
      }

      set.status = 201
      return result.data
    },
    {
      requireAuth: true,
      body: t.Object({
        code: t.String({ minLength: 2, maxLength: 10 }),
        label: t.String({ minLength: 1 }),
        isActive: t.Optional(t.Boolean()),
      }),
    },
  )
  .patch(
    "/:id",
    async ({ params, body, set }) => {
      const language = await updateLanguage(params.id, body)
      if (!language) {
        set.status = 404
        return { error: "Language not found", code: ERROR_CODES.NOT_FOUND }
      }
      return language
    },
    {
      requireAuth: true,
      body: t.Object({
        label: t.Optional(t.String({ minLength: 1 })),
        isActive: t.Optional(t.Boolean()),
      }),
    },
  )
  .delete(
    "/:id",
    async ({ params, set }) => {
      const deleted = await deleteLanguage(params.id)
      if (!deleted) {
        set.status = 404
        return { error: "Language not found", code: ERROR_CODES.NOT_FOUND }
      }
      set.status = 204
    },
    { requireAuth: true },
  )
