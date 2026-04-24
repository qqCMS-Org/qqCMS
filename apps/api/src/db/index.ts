import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

// All schemas use sqliteTable. PostgreSQL support requires separate pgTable schemas.
// See docs/database.md for the migration plan.
export const db = drizzle(new Database("./data.db"), { schema });

export type Db = typeof db;
