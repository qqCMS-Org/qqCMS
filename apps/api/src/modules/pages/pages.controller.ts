import { Elysia, t } from "elysia"
import { authMiddleware } from "@shared/middleware/auth.middleware"
import { ERROR_CODES } from "@shared/constants"
import {
  createPage,
  deletePage,
  deleteTranslation,
  getPage,
  listPages,
  updatePage,
  upsertTranslation,
} from "./pages.service"

export const pagesController = new Elysia({ prefix: "/pages" })
  .use(authMiddleware)
  .get("/", () => listPages())
  .get("/:id", async ({ params, set }) => {
    const page = await getPage(params.id)
    if (!page) {
      set.status = 404
      return { error: "Page not found", code: ERROR_CODES.NOT_FOUND }
    }
    return page
  })
  .post(
    "/",
    async ({ body, set }) => {
      const page = await createPage(body)
      set.status = 201
      return page
    },
    {
      requireAuth: true,
      body: t.Object({
        slug: t.String({ minLength: 1 }),
        isHomepage: t.Optional(t.Boolean()),
      }),
    },
  )
  .patch(
    "/:id",
    async ({ params, body, set }) => {
      const page = await updatePage(params.id, body)
      if (!page) {
        set.status = 404
        return { error: "Page not found", code: ERROR_CODES.NOT_FOUND }
      }
      return page
    },
    {
      requireAuth: true,
      body: t.Object({
        slug: t.Optional(t.String({ minLength: 1 })),
        isHomepage: t.Optional(t.Boolean()),
      }),
    },
  )
  .delete(
    "/:id",
    async ({ params, set }) => {
      const deleted = await deletePage(params.id)
      if (!deleted) {
        set.status = 404
        return { error: "Page not found", code: ERROR_CODES.NOT_FOUND }
      }
      set.status = 204
    },
    { requireAuth: true },
  )
  .put(
    "/:id/translations/:lang",
    async ({ params, body, set }) => {
      const translation = await upsertTranslation(params.id, params.lang, body)
      if (!translation) {
        set.status = 404
        return { error: "Page not found", code: ERROR_CODES.NOT_FOUND }
      }
      return translation
    },
    {
      requireAuth: true,
      body: t.Object({
        title: t.String({ minLength: 1 }),
        content: t.Any(),
      }),
    },
  )
  .delete(
    "/:id/translations/:lang",
    async ({ params, set }) => {
      const deleted = await deleteTranslation(params.id, params.lang)
      if (!deleted) {
        set.status = 404
        return { error: "Page not found", code: ERROR_CODES.NOT_FOUND }
      }
      set.status = 204
    },
    { requireAuth: true },
  )
