import { randomUUID } from "crypto"
import {
  deleteLanguage as deleteLanguageInDb,
  getLanguage as getLanguageFromDb,
  getLanguageByCode,
  getLanguages as getLanguagesFromDb,
  insertLanguage,
  updateLanguage as updateLanguageInDb,
} from "@repository/languages"
import type { CreateLanguageInput, UpdateLanguageInput } from "./languages.types"

export const listLanguages = () => getLanguagesFromDb()

export const createLanguage = async (data: CreateLanguageInput) => {
  const existing = getLanguageByCode(data.code)
  if (existing) return { error: "conflict" as const }

  const language = insertLanguage({
    id: randomUUID(),
    code: data.code,
    label: data.label,
    isActive: data.isActive ?? true,
  })

  return { data: language }
}

export const updateLanguage = async (id: string, data: UpdateLanguageInput) => {
  const existing = getLanguageFromDb(id)
  if (!existing) return null

  return updateLanguageInDb(id, data)
}

export const deleteLanguage = async (id: string) => {
  const existing = getLanguageFromDb(id)
  if (!existing) return false

  deleteLanguageInDb(id)
  return true
}
