import { db } from "@core/Database";
import type { NewLanguage } from "@schema/languages";
import { languages } from "@schema/languages";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export const getLanguages = () => db.select().from(languages);

export const getLanguage = (id: string) =>
	db
		.select()
		.from(languages)
		.where(eq(languages.id, id))
		.then((rows) => rows[0] ?? null);

export const insertLanguage = (data: Omit<NewLanguage, "id">) =>
	db
		.insert(languages)
		.values({ ...data, id: uuidv4() })
		.returning();

export const updateLanguage = (id: string, data: Partial<Omit<NewLanguage, "id">>) =>
	db.update(languages).set(data).where(eq(languages.id, id)).returning();

export const deleteLanguage = (id: string) => db.delete(languages).where(eq(languages.id, id));
