import { defineMiddleware } from "astro:middleware";
import { COOKIE_NAME, DEFAULT_API_URL } from "@shared/constants";

const API_URL = import.meta.env.PUBLIC_API_URL ?? DEFAULT_API_URL;

export const onRequest = defineMiddleware(async (context, next) => {
	const { url, cookies, redirect } = context;

	const isLoginPage = url.pathname === "/login";
	const token = cookies.get(COOKIE_NAME)?.value;

	if (!token) {
		if (!isLoginPage) return redirect("/login");
		return next();
	}

	const isValid = await fetch(`${API_URL}/auth/me`, {
		headers: { Cookie: `${COOKIE_NAME}=${token}` },
	})
		.then((response) => response.ok)
		.catch(() => false);

	if (!isValid) {
		cookies.delete(COOKIE_NAME, { path: "/" });
		if (!isLoginPage) return redirect("/login");
		return next();
	}

	if (isLoginPage) return redirect("/");

	return next();
});
