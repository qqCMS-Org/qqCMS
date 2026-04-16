import { eq } from "drizzle-orm"
import { db } from "@core/Database"
import { pages } from "@schema/pages"

export type NewPage = typeof pages.$inferInsert
export type Page = typeof pages.$inferSelect

export const getPages = () => db.select().from(pages)

export const getPage = (id: string) =>
  db.select().from(pages).where(eq(pages.id, id)).get()

export const getPageBySlug = (slug: string) =>
  db.select().from(pages).where(eq(pages.slug, slug)).get()

export const getHomepage = () =>
  db.select().from(pages).where(eq(pages.isHomepage, true)).get()

export const insertPage = (data: NewPage) =>
  db.insert(pages).values(data).returning().get()

export const updatePage = (id: string, data: Partial<NewPage>) =>
  db.update(pages).set(data).where(eq(pages.id, id)).returning().get()

export const deletePage = (id: string) =>
  db.delete(pages).where(eq(pages.id, id))

export const unsetHomepage = () =>
  db.update(pages).set({ isHomepage: false }).where(eq(pages.isHomepage, true))
