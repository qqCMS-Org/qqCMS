import { Elysia, t } from "elysia"
import { jwtPlugin } from "@shared/middleware/auth.middleware"
import { login as loginService } from "./auth.service"
import { ERROR_CODES } from "@shared/constants"

const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 7 // 7 days in seconds

export const authController = new Elysia({ prefix: "/auth" })
  .use(jwtPlugin)
  .post(
    "/login",
    async ({ jwt, body, cookie: { session }, set }) => {
      const admin = await loginService(body.login, body.password)

      if (!admin) {
        set.status = 401
        return { error: "Invalid credentials", code: ERROR_CODES.UNAUTHORIZED }
      }

      const token = await jwt.sign({ login: admin.login })

      session.set({
        value: token,
        httpOnly: true,
        maxAge: SESSION_COOKIE_MAX_AGE,
        path: "/",
        sameSite: "lax",
      })

      return { ok: true }
    },
    {
      body: t.Object({
        login: t.String({ minLength: 1 }),
        password: t.String({ minLength: 1 }),
      }),
    },
  )
  .post("/logout", ({ cookie: { session } }) => {
    session.remove()
    return { ok: true }
  })
