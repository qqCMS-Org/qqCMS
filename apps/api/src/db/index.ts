import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { config } from "@api/config";
import { PGlite } from "@electric-sql/pglite";
import { drizzle as drizzlePglite } from "drizzle-orm/pglite";
import { migrate as migratePglite } from "drizzle-orm/pglite/migrator";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import { migrate as migratePostgres } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";
import * as schema from "./schema";

const MIGRATIONS_FOLDER = join(import.meta.dir, "migrations");

function createDb() {
	if (config.databaseUrl) {
		const client = postgres(config.databaseUrl);
		const database = drizzlePostgres(client, { schema });
		return {
			db: database,
			// For Postgres (multi-instance), migrations are opt-in via RUN_MIGRATIONS_ON_STARTUP
			autoMigrate: false,
			runMigrations: () => migratePostgres(database, { migrationsFolder: MIGRATIONS_FOLDER }),
		};
	}

	// PGlite is always a single local instance — safe to always auto-migrate
	mkdirSync("./data", { recursive: true });
	const pglite = new PGlite("./data/qqcms.db");
	const database = drizzlePglite(pglite, { schema });
	return {
		db: database,
		autoMigrate: true,
		runMigrations: () => migratePglite(database, { migrationsFolder: MIGRATIONS_FOLDER }),
	};
}

const { db, runMigrations, autoMigrate } = createDb();

export { db, runMigrations, autoMigrate };

export type Db = typeof db;
