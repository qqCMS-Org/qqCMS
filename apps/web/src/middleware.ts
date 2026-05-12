import { defineMiddleware } from "astro:middleware";
import { getCache, setCache } from "./lib/cache";

export const onRequest = defineMiddleware(async (context, next) => {
	if (context.request.method !== "GET") return next();

	// не кешируем API-роуты самого web-приложения
	if (context.url.pathname.startsWith("/api/")) return next();

	const cached = getCache(context.url.pathname);
	if (cached) {
		return new Response(cached, {
			headers: { "content-type": "text/html; charset=utf-8" },
		});
	}

	const response = await next();

	// Кешируем только успешные HTML-ответы; пропускаем редиректы и ошибки
	if (response.status === 200) {
		const ct = response.headers.get("content-type") ?? "";
		if (ct.includes("text/html")) {
			const html = await response.clone().text();
			setCache(context.url.pathname, html);
		}
	}

	return response;
});
