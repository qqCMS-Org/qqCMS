import { asc, eq } from "drizzle-orm"
import { db } from "@core/Database"
import { navigationItems } from "@schema/navigation-items"

export type NewNavigationItem = typeof navigationItems.$inferInsert
export type NavigationItem = typeof navigationItems.$inferSelect

export const getNavigationItems = () =>
  db.select().from(navigationItems).orderBy(asc(navigationItems.order))

export const getNavigationItem = (id: string) =>
  db.select().from(navigationItems).where(eq(navigationItems.id, id)).get()

export const insertNavigationItem = (data: NewNavigationItem) =>
  db.insert(navigationItems).values(data).returning().get()

export const updateNavigationItem = (id: string, data: Partial<NewNavigationItem>) =>
  db.update(navigationItems).set(data).where(eq(navigationItems.id, id)).returning().get()

export const deleteNavigationItem = (id: string) =>
  db.delete(navigationItems).where(eq(navigationItems.id, id))

export const reorderNavigationItems = (orderedIds: string[]) =>
  db.transaction((tx) => {
    return Promise.all(
      orderedIds.map((id, index) =>
        tx
          .update(navigationItems)
          .set({ order: index })
          .where(eq(navigationItems.id, id)),
      ),
    )
  })
