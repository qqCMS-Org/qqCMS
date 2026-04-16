import { randomUUID } from "crypto"
import {
  deleteNavigationItem as deleteNavigationItemInDb,
  getNavigationItem as getNavigationItemFromDb,
  getNavigationItems as getNavigationItemsFromDb,
  insertNavigationItem,
  reorderNavigationItems as reorderInDb,
  updateNavigationItem as updateNavigationItemInDb,
} from "@repository/navigation-items"
import type {
  CreateNavigationItemInput,
  ReorderInput,
  UpdateNavigationItemInput,
} from "./navigation.types"

export const listNavigationItems = () => getNavigationItemsFromDb()

export const createNavigationItem = (data: CreateNavigationItemInput) =>
  insertNavigationItem({
    id: randomUUID(),
    label: data.label,
    href: data.href,
    order: data.order ?? 0,
    parentId: data.parentId ?? null,
  })

export const updateNavigationItem = async (
  id: string,
  data: UpdateNavigationItemInput,
) => {
  const existing = getNavigationItemFromDb(id)
  if (!existing) return null

  return updateNavigationItemInDb(id, data)
}

export const deleteNavigationItem = async (id: string) => {
  const existing = getNavigationItemFromDb(id)
  if (!existing) return false

  deleteNavigationItemInDb(id)
  return true
}

export const reorderNavigationItems = (data: ReorderInput) =>
  reorderInDb(data.orderedIds)
