import { timingSafeEqual } from "node:crypto";
import type { APIRoute } from "astro";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
	const expectedSecret = import.meta.env.REVALIDATE_SECRET as string | undefined;

	// If no secret is configured — refuse all requests (misconfiguration guard)
	if (!expectedSecret) {
		return new Response(JSON.stringify({ error: "REVALIDATE_SECRET is not configured" }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}

	const incomingSecret = request.headers.get("x-revalidate-secret") ?? "";

	const enc = new TextEncoder();
	const expected = enc.encode(expectedSecret);
	const incoming = enc.encode(incomingSecret);

	const isValid = expected.byteLength === incoming.byteLength && timingSafeEqual(expected, incoming);

	if (!isValid) {
		return new Response(JSON.stringify({ error: "Unauthorized" }), {
			status: 401,
			headers: { "Content-Type": "application/json" },
		});
	}

	// Trigger deploy hook if configured
	const deployHookUrl = import.meta.env.DEPLOY_HOOK_URL as string | undefined;

	if (deployHookUrl) {
		try {
			const hookRes = await fetch(deployHookUrl, { method: "POST" });
			if (!hookRes.ok) {
				console.error(`[revalidate] Deploy hook responded with ${hookRes.status}`);
				return new Response(JSON.stringify({ ok: false, error: `Deploy hook failed: ${hookRes.status}` }), {
					status: 502,
					headers: { "Content-Type": "application/json" },
				});
			}
			return new Response(JSON.stringify({ ok: true, triggered: true }), {
				status: 200,
				headers: { "Content-Type": "application/json" },
			});
		} catch (err) {
			console.error("[revalidate] Failed to call deploy hook:", err);
			return new Response(JSON.stringify({ ok: false, error: "Failed to reach deploy hook" }), {
				status: 502,
				headers: { "Content-Type": "application/json" },
			});
		}
	}

	// No deploy hook configured — local/dev mode, just acknowledge
	return new Response(JSON.stringify({ ok: true, triggered: false }), {
		status: 200,
		headers: { "Content-Type": "application/json" },
	});
};
