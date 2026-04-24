import { sqliteTable, text, unique } from "drizzle-orm/sqlite-core";
import { pages } from "./pages";

export const pageTranslations = sqliteTable(
	"page_translations",
	{
		id: text("id").primaryKey(),
		pageId: text("page_id")
			.notNull()
			.references(() => pages.id, { onDelete: "cascade" }),
		languageCode: text("language_code").notNull(),
		title: text("title").notNull(),
		content: text("content", { mode: "json" }).notNull().default("{}"),
	},
	(table) => [unique("page_translations_page_lang_unique").on(table.pageId, table.languageCode)],
);

export type PageTranslation = typeof pageTranslations.$inferSelect;
export type NewPageTranslation = typeof pageTranslations.$inferInsert;
