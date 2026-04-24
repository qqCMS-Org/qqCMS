import { config } from "@shared/config";
import Database from "better-sqlite3";
import { drizzle as drizzleSqlite } from "drizzle-orm/better-sqlite3";
import { drizzle as drizzlePg } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export const db = config.databaseUrl
	? drizzlePg(postgres(config.databaseUrl), { schema })
	: drizzleSqlite(new Database("./data.db"), { schema });

export type Db = typeof db;
