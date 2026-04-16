import { eq } from "drizzle-orm"
import { db } from "@core/Database"
import { settings } from "@schema/settings"

export type NewSetting = typeof settings.$inferInsert
export type Setting = typeof settings.$inferSelect

export const getSettings = () => db.select().from(settings)

export const getSetting = (key: string) =>
  db.select().from(settings).where(eq(settings.key, key)).get()

export const upsertSetting = (data: NewSetting) =>
  db
    .insert(settings)
    .values(data)
    .onConflictDoUpdate({
      target: settings.key,
      set: { value: data.value },
    })
    .returning()
    .get()
