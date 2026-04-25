import { db } from "@core/Database";
import type { NewSetting } from "@schema/settings";
import { settings } from "@schema/settings";
import { eq } from "drizzle-orm";

export const getSettings = () => db.select().from(settings);

export const getSetting = (key: string) =>
	db.query.settings.findFirst({
		where: eq(settings.key, key),
	});

export const upsertSetting = (key: string, value: NewSetting["value"]) =>
	db
		.insert(settings)
		.values({ id: crypto.randomUUID(), key, value })
		.onConflictDoUpdate({
			target: settings.key,
			set: { value },
		})
		.returning();
