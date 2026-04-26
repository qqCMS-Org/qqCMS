import { jwt } from "@elysiajs/jwt";
import { config } from "@shared/config";
import { AUTH_COOKIE_NAME } from "@shared/constants";
import { Elysia } from "elysia";

export const jwtPlugin = new Elysia({ name: "jwt-plugin" }).use(
	jwt({ name: "jwt", secret: config.jwtSecret, exp: "7d" }),
);

export const authPlugin = new Elysia({ name: "auth-plugin" }).use(jwtPlugin).macro({
	requireAuth(enabled: boolean) {
		if (!enabled) return;
		return {
			async beforeHandle({ jwt: jwtCtx, cookie, set }) {
				const rawToken: unknown = cookie[AUTH_COOKIE_NAME]?.value;
				if (typeof rawToken !== "string" || !rawToken) {
					set.status = 401;
					return { error: "Unauthorized", code: "UNAUTHORIZED" };
				}
				const payload = await jwtCtx.verify(rawToken);
				if (!payload) {
					set.status = 401;
					return { error: "Unauthorized", code: "UNAUTHORIZED" };
				}
				return;
			},
		};
	},
});
