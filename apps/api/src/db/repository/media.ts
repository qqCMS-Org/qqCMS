import { db } from "@core/Database";
import type { NewMedia } from "@schema/media";
import { media } from "@schema/media";
import { eq } from "drizzle-orm";

export const getMediaFiles = () => db.select().from(media);

export const getMediaFile = (id: string) =>
	db.query.media.findFirst({
		where: eq(media.id, id),
	});

export const insertMedia = (data: Omit<NewMedia, "id" | "createdAt">) =>
	db
		.insert(media)
		.values({ ...data, id: crypto.randomUUID() })
		.returning();

export const deleteMedia = (id: string) => db.delete(media).where(eq(media.id, id));
