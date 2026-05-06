import { db } from "@core/Database";
import { pageTranslations } from "@schema/page-translations";
import type { NewPage } from "@schema/pages";
import { pages } from "@schema/pages";
import { and, eq, ne } from "drizzle-orm";

export const getPages = () =>
	db
		.selectDistinctOn([pages.id], {
			id: pages.id,
			slug: pages.slug,
			status: pages.status,
			isHomepage: pages.isHomepage,
			createdAt: pages.createdAt,
			updatedAt: pages.updatedAt,
			title: pageTranslations.title,
		})
		.from(pages)
		.leftJoin(pageTranslations, eq(pageTranslations.pageId, pages.id));

export const getPage = (id: string) =>
	db.query.pages.findFirst({
		where: eq(pages.id, id),
	});

export const insertPage = (data: Omit<NewPage, "id" | "createdAt" | "updatedAt">) =>
	db
		.insert(pages)
		.values({ ...data, id: crypto.randomUUID() })
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
