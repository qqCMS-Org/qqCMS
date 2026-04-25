import { db } from "@core/Database";
import type { NewPageTranslation } from "@schema/page-translations";
import { pageTranslations } from "@schema/page-translations";
import { and, eq } from "drizzle-orm";

export const getTranslationsByPage = (pageId: string) =>
	db.select().from(pageTranslations).where(eq(pageTranslations.pageId, pageId));

export const upsertTranslation = (data: Omit<NewPageTranslation, "id">) =>
	db
		.insert(pageTranslations)
		.values({ ...data, id: crypto.randomUUID() })
		.onConflictDoUpdate({
			target: [pageTranslations.pageId, pageTranslations.languageCode],
			set: {
				title: data.title,
				content: data.content,
			},
		})
		.returning();

export const deleteTranslation = (pageId: string, languageCode: string) =>
	db
		.delete(pageTranslations)
		.where(and(eq(pageTranslations.pageId, pageId), eq(pageTranslations.languageCode, languageCode)));
