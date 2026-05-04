import { AUTH_COOKIE_NAME, JWT_EXPIRES_IN } from "@api/constants";
import { authPlugin } from "@api/middleware/auth.middleware";
import { Elysia } from "elysia";
import { login as loginService } from "./auth.service";
import { LoginSchema } from "./auth.types";

export const authController = new Elysia({ prefix: "/auth" })
	.use(authPlugin)
	.post(
		"/login",
		async ({ body, jwt, cookie, set }) => {
			const admin = await loginService(body.login, body.password);
			if (!admin) {
				set.status = 401;
				return { error: "Invalid credentials", code: "INVALID_CREDENTIALS" };
			}

			const token = await jwt.sign({ login: admin.login });

			cookie[AUTH_COOKIE_NAME].set({
				value: token,
				httpOnly: true,
				secure: process.env["NODE_ENV"] === "production",
				sameSite: "strict",
				maxAge: JWT_EXPIRES_IN,
				path: "/",
			});

			return { ok: true };
		},
		{ body: LoginSchema },
	)
	.post("/logout", ({ cookie }) => {
		cookie[AUTH_COOKIE_NAME].remove();
		return { ok: true };
	});
