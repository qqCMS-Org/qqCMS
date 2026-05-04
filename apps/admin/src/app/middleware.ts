import { defineMiddleware } from "astro:middleware";

const API_URL = import.meta.env.PUBLIC_API_URL ?? "http://localhost:3000";

export const onRequest = defineMiddleware(async (context, next) => {
	const { url, cookies, redirect } = context;

	const isLoginPage = url.pathname === "/login";
	const token = cookies.get("qq_auth")?.value;

	if (!token) {
		if (!isLoginPage) return redirect("/login");
		return next();
	}

	const isValid = await fetch(`${API_URL}/auth/me`, {
		headers: { Cookie: `qq_auth=${token}` },
	})
		.then((response) => response.ok)
		.catch(() => false);

	if (!isValid) {
		cookies.delete("qq_auth", { path: "/" });
		if (!isLoginPage) return redirect("/login");
		return next();
	}

	if (isLoginPage) return redirect("/");

	return next();
});
