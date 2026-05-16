import { db } from "@core/Database";
import { languages } from "@schema/languages";
import { pageTranslations } from "@schema/page-translations";
import type { NewPage } from "@schema/pages";
import { pages } from "@schema/pages";
import { and, asc, eq, ne } from "drizzle-orm";

export const getPages = () =>
	db
		.select({
			id: pages.id,
			slug: pages.slug,
			status: pages.status,
			hasDraft: pages.hasDraft,
			isHomepage: pages.isHomepage,
			hideTitle: pages.hideTitle,
			createdAt: pages.createdAt,
			updatedAt: pages.updatedAt,
			title: pageTranslations.title,
		})
		.from(pages)
		.leftJoin(languages, eq(languages.isDefault, true))
		.leftJoin(
			pageTranslations,
			and(eq(pageTranslations.pageId, pages.id), eq(pageTranslations.languageCode, languages.code)),
		)
		.orderBy(asc(pages.id));

export const getPage = (id: string) =>
	db.query.pages.findFirst({
		where: eq(pages.id, id),
	});

export const insertPage = (data: Omit<NewPage, "id" | "createdAt" | "updatedAt">) =>
	db
		.insert(pages)
		.values({ status: "draft", hasDraft: true, isHomepage: false, ...data, id: crypto.randomUUID() })
		.returning();

export const updatePage = (id: string, data: Partial<Omit<NewPage, "id" | "createdAt" | "updatedAt">>) =>
	db
		.update(pages)
		.set({ ...data, updatedAt: new Date() })
		.where(eq(pages.id, id))
		.returning();

export const deletePage = (id: string) => db.delete(pages).where(eq(pages.id, id));

export const clearHomepageFlag = (excludeId?: string) =>
	excludeId
		? db
				.update(pages)
				.set({ isHomepage: false })
				.where(and(eq(pages.isHomepage, true), ne(pages.id, excludeId)))
		: db.update(pages).set({ isHomepage: false }).where(eq(pages.isHomepage, true));
