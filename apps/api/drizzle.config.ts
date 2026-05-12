import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env["DATABASE_URL"];

export default databaseUrl
	? defineConfig({
			dialect: "postgresql",
			schema: "./src/db/schema/index.ts",
			out: "./src/db/migrations",
			dbCredentials: { url: databaseUrl },
		})
	: defineConfig({
			dialect: "postgresql",
			driver: "pglite",
			schema: "./src/db/schema/index.ts",
			out: "./src/db/migrations",
			dbCredentials: { url: "./data/qqcms.db" },
		});
