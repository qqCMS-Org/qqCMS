import { sqliteTable, text, unique } from "drizzle-orm/sqlite-core"
import { pages } from "./pages"

export const pageTranslations = sqliteTable(
  "page_translations",
  {
    id: text("id").primaryKey(),
    pageId: text("page_id")
      .notNull()
      .references(() => pages.id, { onDelete: "cascade" }),
    languageCode: text("language_code").notNull(),
    title: text("title").notNull(),
    content: text("content", { mode: "json" }).notNull(),
  },
  (table) => [unique().on(table.pageId, table.languageCode)],
)
