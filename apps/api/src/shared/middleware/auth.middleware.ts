import { Elysia } from "elysia"
import { jwt } from "@elysiajs/jwt"
import { config } from "@shared/config"
import { ERROR_CODES } from "@shared/constants"

const UNAUTHORIZED_RESPONSE = {
  error: "Unauthorized",
  code: ERROR_CODES.UNAUTHORIZED,
}

export const jwtPlugin = new Elysia({ name: "jwt-plugin" }).use(
  jwt({ name: "jwt", secret: config.jwtSecret }),
)

export const authMiddleware = new Elysia({ name: "auth-middleware" })
  .use(jwtPlugin)
  .derive({ as: "scoped" }, async ({ jwt: jwtInstance, cookie: { session } }) => {
    const token = session?.value
    if (!token) return { admin: null }

    const payload = await jwtInstance.verify(token).catch(() => null)
    return { admin: payload ? { login: String(payload["login"] ?? "") } : null }
  })
  .macro({
    requireAuth: (enabled: boolean) => ({
      beforeHandle({ admin, set }) {
        if (enabled && !admin) {
          set.status = 401
          return UNAUTHORIZED_RESPONSE
        }
      },
    }),
  })
