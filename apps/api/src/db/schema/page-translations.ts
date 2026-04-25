import { jsonb, pgTable, text, unique } from "drizzle-orm/pg-core";
import { pages } from "./pages";

export const pageTranslations = pgTable(
	"page_translations",
	{
		id: text("id").primaryKey(),
		pageId: text("page_id")
			.notNull()
			.references(() => pages.id, { onDelete: "cascade" }),
		languageCode: text("language_code").notNull(),
		title: text("title").notNull(),
		content: jsonb("content").notNull().default({}),
	},
	(table) => [unique("page_translations_page_lang_unique").on(table.pageId, table.languageCode)],
);

export type PageTranslation = typeof pageTranslations.$inferSelect;
export type NewPageTranslation = typeof pageTranslations.$inferInsert;
