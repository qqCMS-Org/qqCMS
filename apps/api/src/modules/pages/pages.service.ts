import { randomUUID } from "crypto"
import {
  deletePage as deletePageInDb,
  getPage as getPageFromDb,
  getPages as getPagesFromDb,
  insertPage,
  unsetHomepage,
  updatePage as updatePageInDb,
} from "@repository/pages"
import {
  deleteTranslation as deleteTranslationInDb,
  getTranslationsByPage,
  upsertTranslation as upsertTranslationInDb,
} from "@repository/page-translations"
import { db } from "@core/Database"
import type { CreatePageInput, UpdatePageInput, UpsertTranslationInput } from "./pages.types"

export const listPages = () => getPagesFromDb()

export const getPage = async (id: string) => {
  const page = getPageFromDb(id)
  if (!page) return null

  const translations = getTranslationsByPage(id)
  return { ...page, translations }
}

export const createPage = async (data: CreatePageInput) => {
  const now = new Date().toISOString()

  if (data.isHomepage) {
    unsetHomepage()
  }

  return insertPage({
    id: randomUUID(),
    slug: data.slug,
    isHomepage: data.isHomepage ?? false,
    createdAt: now,
    updatedAt: now,
  })
}

export const updatePage = async (id: string, data: UpdatePageInput) => {
  const existing = getPageFromDb(id)
  if (!existing) return null

  if (data.isHomepage) {
    unsetHomepage()
  }

  return updatePageInDb(id, { ...data, updatedAt: new Date().toISOString() })
}

export const deletePage = async (id: string) => {
  const existing = getPageFromDb(id)
  if (!existing) return false

  deletePageInDb(id)
  return true
}

export const upsertTranslation = async (
  pageId: string,
  langCode: string,
  data: UpsertTranslationInput,
) => {
  const page = getPageFromDb(pageId)
  if (!page) return null

  return upsertTranslationInDb({
    id: randomUUID(),
    pageId,
    languageCode: langCode,
    title: data.title,
    content: data.content,
  })
}

export const deleteTranslation = async (pageId: string, langCode: string) => {
  const page = getPageFromDb(pageId)
  if (!page) return false

  deleteTranslationInDb(pageId, langCode)
  return true
}
