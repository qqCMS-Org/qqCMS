import { db } from "@core/Database";
import type { NewLanguage } from "@schema/languages";
import { languages } from "@schema/languages";
import { eq, ne } from "drizzle-orm";

export const getLanguages = () => db.select().from(languages);

export const getLanguage = (id: string) =>
	db.query.languages.findFirst({
		where: eq(languages.id, id),
	});

export const getLanguageByCode = (code: string) =>
	db.query.languages.findFirst({
		where: eq(languages.code, code),
	});

export const insertLanguage = (data: Omit<NewLanguage, "id">) =>
	db
		.insert(languages)
		.values({ ...data, id: crypto.randomUUID() })
		.returning();

export const updateLanguage = async (id: string, data: Partial<Omit<NewLanguage, "id">>) => {
	if (data.isDefault === true) {
		await db.update(languages).set({ isDefault: false }).where(ne(languages.id, id));
	}
	return db.update(languages).set(data).where(eq(languages.id, id)).returning();
};

export const deleteLanguage = (id: string) => db.delete(languages).where(eq(languages.id, id));
