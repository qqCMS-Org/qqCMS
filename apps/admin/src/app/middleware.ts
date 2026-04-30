import { defineMiddleware } from "astro:middleware";

export const onRequest = defineMiddleware((context, next) => {
	const { url, cookies, redirect } = context;

	const token = cookies.get("qq_auth");
	const isLoginPage = url.pathname === "/login";

	if (!token && !isLoginPage) {
		return redirect("/login");
	}

	return next();
});
