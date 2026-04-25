import {
	deleteLanguage as deleteLanguageInDb,
	getLanguageByCode,
	getLanguage as getLanguageById,
	getLanguages,
	insertLanguage,
	updateLanguage as updateLanguageInDb,
} from "@repository/languages";
import { ConflictError, NotFoundError } from "@shared/errors";
import type { CreateLanguageInput, UpdateLanguageInput } from "./languages.types";

export const listLanguages = () => getLanguages();

export const createLanguage = async (data: CreateLanguageInput) => {
	const existing = await getLanguageByCode(data.code);
	if (existing) throw new ConflictError(`Language with code "${data.code}" already exists`);

	const [language] = await insertLanguage(data);
	return language;
};

export const updateLanguage = async (id: string, data: UpdateLanguageInput) => {
	const existing = await getLanguageById(id);
	if (!existing) throw new NotFoundError("Language not found");

	const [updated] = await updateLanguageInDb(id, data);
	return updated;
};

export const deleteLanguage = async (id: string) => {
	const existing = await getLanguageById(id);
	if (!existing) throw new NotFoundError("Language not found");

	await deleteLanguageInDb(id);
};
