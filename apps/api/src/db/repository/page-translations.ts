import { db } from "@core/Database";
import type { NewPageTranslation } from "@schema/page-translations";
import { pageTranslations } from "@schema/page-translations";
import { and, eq, sql } from "drizzle-orm";

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

export const promoteTranslationsToPublished = (pageId: string) =>
	db
		.update(pageTranslations)
		.set({
			publishedTitle: sql`${pageTranslations.title}`,
			publishedContent: sql`${pageTranslations.content}`,
		})
		.where(eq(pageTranslations.pageId, pageId))
		.returning();

export const revertTranslationsToDraft = (pageId: string) =>
	db
		.update(pageTranslations)
		.set({
			title: sql`${pageTranslations.publishedTitle}`,
			content: sql`coalesce(${pageTranslations.publishedContent}, ${pageTranslations.content})`,
		})
		.where(and(eq(pageTranslations.pageId, pageId), sql`${pageTranslations.publishedTitle} is not null`))
		.returning();

export const deleteTranslation = (pageId: string, languageCode: string) =>
	db
		.delete(pageTranslations)
		.where(and(eq(pageTranslations.pageId, pageId), eq(pageTranslations.languageCode, languageCode)));
