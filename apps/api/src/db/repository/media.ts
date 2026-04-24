import { db } from "@core/Database";
import type { NewMedia } from "@schema/media";
import { media } from "@schema/media";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export const getMediaFiles = () => db.select().from(media);

export const getMediaFile = (id: string) =>
	db
		.select()
		.from(media)
		.where(eq(media.id, id))
		.then((rows) => rows[0] ?? null);

export const insertMedia = (data: Omit<NewMedia, "id" | "createdAt">) =>
	db
		.insert(media)
		.values({ ...data, id: uuidv4() })
		.returning();

export const deleteMedia = (id: string) => db.delete(media).where(eq(media.id, id));
