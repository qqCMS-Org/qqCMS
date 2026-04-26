import { PGlite } from "@electric-sql/pglite";
import { config } from "@shared/config";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

function createDb() {
	if (config.databaseUrl) {
		const client = postgres(config.databaseUrl);
		return drizzlePostgres(client, { schema });
	}

	const pglite = new PGlite("./data/qqcms.db");
	return drizzlePglite(pglite, { schema });
}

export const db = createDb();

export type Db = typeof db;
