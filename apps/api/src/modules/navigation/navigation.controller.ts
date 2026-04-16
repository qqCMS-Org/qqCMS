import { Elysia, t } from "elysia"
import { authMiddleware } from "@shared/middleware/auth.middleware"
import { ERROR_CODES } from "@shared/constants"
import {
  createNavigationItem,
  deleteNavigationItem,
  listNavigationItems,
  reorderNavigationItems,
  updateNavigationItem,
} from "./navigation.service"

export const navigationController = new Elysia({ prefix: "/navigation" })
  .use(authMiddleware)
  .get("/", () => listNavigationItems())
  .post(
    "/",
    async ({ body, set }) => {
      const item = await createNavigationItem(body)
      set.status = 201
      return item
    },
    {
      requireAuth: true,
      body: t.Object({
        label: t.Record(t.String(), t.String()),
        href: t.String({ minLength: 1 }),
        order: t.Optional(t.Number()),
        parentId: t.Optional(t.Nullable(t.String())),
      }),
    },
  )
  .patch(
    "/reorder",
    async ({ body }) => {
      await reorderNavigationItems(body)
      return { ok: true }
    },
    {
      requireAuth: true,
      body: t.Object({
        orderedIds: t.Array(t.String()),
      }),
    },
  )
  .patch(
    "/:id",
    async ({ params, body, set }) => {
      const item = await updateNavigationItem(params.id, body)
      if (!item) {
        set.status = 404
        return { error: "Navigation item not found", code: ERROR_CODES.NOT_FOUND }
      }
      return item
    },
    {
      requireAuth: true,
      body: t.Object({
        label: t.Optional(t.Record(t.String(), t.String())),
        href: t.Optional(t.String({ minLength: 1 })),
        order: t.Optional(t.Number()),
        parentId: t.Optional(t.Nullable(t.String())),
      }),
    },
  )
  .delete(
    "/:id",
    async ({ params, set }) => {
      const deleted = await deleteNavigationItem(params.id)
      if (!deleted) {
        set.status = 404
        return { error: "Navigation item not found", code: ERROR_CODES.NOT_FOUND }
      }
      set.status = 204
    },
    { requireAuth: true },
  )
