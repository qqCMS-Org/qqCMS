import { db } from "@core/Database";
import type { NewPage } from "@schema/pages";
import { pages } from "@schema/pages";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export const getPages = () => db.select().from(pages);

export const getPage = (id: string) =>
	db
		.select()
		.from(pages)
		.where(eq(pages.id, id))
		.then((rows) => rows[0] ?? null);

export const insertPage = (data: Omit<NewPage, "id" | "createdAt" | "updatedAt">) =>
	db
		.insert(pages)
		.values({ ...data, id: uuidv4() })
		.returning();

export const updatePage = (id: string, data: Partial<Omit<NewPage, "id" | "createdAt" | "updatedAt">>) =>
	db
		.update(pages)
		.set({ ...data, updatedAt: new Date() })
		.where(eq(pages.id, id))
		.returning();

export const deletePage = (id: string) => db.delete(pages).where(eq(pages.id, id));
