import { db } from "@core/Database";
import type { NewSetting } from "@schema/settings";
import { settings } from "@schema/settings";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

export const getSettings = () => db.select().from(settings);

export const getSetting = (key: string) =>
	db
		.select()
		.from(settings)
		.where(eq(settings.key, key))
		.then((rows) => rows[0] ?? null);

export const upsertSetting = (key: string, value: NewSetting["value"]) =>
	db
		.insert(settings)
		.values({ id: uuidv4(), key, value })
		.onConflictDoUpdate({
			target: settings.key,
			set: { value },
		})
		.returning();
