import { defineConfig } from "drizzle-kit";

const databaseUrl = Bun.env["DATABASE_URL"];

export default defineConfig(
	databaseUrl
		? {
				dialect: "postgresql",
				schema: "./src/db/schema/index.ts",
				out: "./src/db/migrations",
				dbCredentials: {
					url: databaseUrl,
				},
			}
		: {
				dialect: "sqlite",
				schema: "./src/db/schema/index.ts",
				out: "./src/db/migrations",
				dbCredentials: {
					url: "./data.db",
				},
			},
);
