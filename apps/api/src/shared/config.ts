/**
 * Typed, validated configuration loaded from environment variables.
 * The application will throw on startup if any required variable is missing.
 */

function requireEnv(key: string): string {
	const value = process.env[key];
	if (!value) {
		throw new Error(`[config] Missing required environment variable: ${key}`);
	}
	return value;
}

function optionalEnv(key: string, defaultValue: string): string {
	return process.env[key] ?? defaultValue;
}

export const config = {
	/** Enable debug logging */
	debug: process.env["DEBUG"] === "true",

	/** Admin credentials */
	admin: {
		login: requireEnv("ADMIN_LOGIN"),
		passwordHash: requireEnv("ADMIN_PASSWORD_HASH"),
	},

	/** JWT signing secret */
	jwtSecret: requireEnv("JWT_SECRET"),

	/** Comma-separated list of allowed CORS origins */
	corsOrigins: optionalEnv("CORS_ORIGINS", "http://localhost:3001")
		.split(",")
		.map((o) => o.trim())
		.filter(Boolean),

	/** PostgreSQL connection URL. If not set, PGLite is used (local file-based DB). */
	databaseUrl: optionalEnv("DATABASE_URL", ""),

	/** Directory where uploaded files are stored */
	uploadDir: optionalEnv("UPLOAD_DIR", "./uploads"),

	/** Public URL of the Next.js front-end (used for rebuild webhook) */
	publicClientUrl: optionalEnv("PUBLIC_CLIENT_URL", "http://localhost:3001"),

	/** HTTP port to listen on */
	port: parseInt(optionalEnv("PORT", "3000"), 10),
} as const;

export type Config = typeof config;
