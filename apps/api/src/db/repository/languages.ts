import { eq } from "drizzle-orm"
import { db } from "@core/Database"
import { languages } from "@schema/languages"

export type NewLanguage = typeof languages.$inferInsert
export type Language = typeof languages.$inferSelect

export const getLanguages = () => db.select().from(languages)

export const getLanguage = (id: string) =>
  db.select().from(languages).where(eq(languages.id, id)).get()

export const getLanguageByCode = (code: string) =>
  db.select().from(languages).where(eq(languages.code, code)).get()

export const insertLanguage = (data: NewLanguage) =>
  db.insert(languages).values(data).returning().get()

export const updateLanguage = (id: string, data: Partial<NewLanguage>) =>
  db.update(languages).set(data).where(eq(languages.id, id)).returning().get()

export const deleteLanguage = (id: string) =>
  db.delete(languages).where(eq(languages.id, id))
