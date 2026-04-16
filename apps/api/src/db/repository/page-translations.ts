import { and, eq } from "drizzle-orm"
import { db } from "@core/Database"
import { pageTranslations } from "@schema/page-translations"

export type NewPageTranslation = typeof pageTranslations.$inferInsert
export type PageTranslation = typeof pageTranslations.$inferSelect

export const getTranslationsByPage = (pageId: string) =>
  db.select().from(pageTranslations).where(eq(pageTranslations.pageId, pageId))

export const getTranslation = (pageId: string, languageCode: string) =>
  db
    .select()
    .from(pageTranslations)
    .where(
      and(
        eq(pageTranslations.pageId, pageId),
        eq(pageTranslations.languageCode, languageCode),
      ),
    )
    .get()

export const upsertTranslation = (data: NewPageTranslation) =>
  db
    .insert(pageTranslations)
    .values(data)
    .onConflictDoUpdate({
      target: [pageTranslations.pageId, pageTranslations.languageCode],
      set: { title: data.title, content: data.content },
    })
    .returning()
    .get()

export const deleteTranslation = (pageId: string, languageCode: string) =>
  db
    .delete(pageTranslations)
    .where(
      and(
        eq(pageTranslations.pageId, pageId),
        eq(pageTranslations.languageCode, languageCode),
      ),
    )
