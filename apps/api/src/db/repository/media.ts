import { desc, eq } from "drizzle-orm"
import { db } from "@core/Database"
import { media } from "@schema/media"

export type NewMedia = typeof media.$inferInsert
export type MediaFile = typeof media.$inferSelect

export const getMediaFiles = () =>
  db.select().from(media).orderBy(desc(media.createdAt))

export const getMediaFile = (id: string) =>
  db.select().from(media).where(eq(media.id, id)).get()

export const insertMedia = (data: NewMedia) =>
  db.insert(media).values(data).returning().get()

export const deleteMedia = (id: string) =>
  db.delete(media).where(eq(media.id, id))
