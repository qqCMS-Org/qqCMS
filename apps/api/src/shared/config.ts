const REQUIRED_ENV_VARS = [
  "ADMIN_LOGIN",
  "ADMIN_PASSWORD_HASH",
  "JWT_SECRET",
] as const

for (const key of REQUIRED_ENV_VARS) {
  if (!process.env[key]) {
    throw new Error(`Missing required env variable: ${key}`)
  }
}

export const config = {
  adminLogin: process.env["ADMIN_LOGIN"] as string,
  adminPasswordHash: process.env["ADMIN_PASSWORD_HASH"] as string,
  jwtSecret: process.env["JWT_SECRET"] as string,
  corsOrigins: (process.env["CORS_ORIGINS"] ?? "http://localhost:4321").split(",").map((origin) => origin.trim()),
  databaseUrl: process.env["DATABASE_URL"] ?? "",
  uploadDir: process.env["UPLOAD_DIR"] ?? "./uploads",
  publicClientUrl: process.env["PUBLIC_CLIENT_URL"] ?? "http://localhost:4321",
  port: Number(process.env["PORT"] ?? 3000),
} as const
