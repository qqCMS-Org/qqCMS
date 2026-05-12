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

	// Timing-safe comparison to prevent timing attacks
	const enc = new TextEncoder();
	const expected = enc.encode(expectedSecret);
	const incoming = enc.encode(incomingSecret);

	// Pad/truncate incoming to the same byte length so timingSafeEqual doesn't throw
	const paddedIncoming = new Uint8Array(expected.byteLength);
	paddedIncoming.set(incoming.subarray(0, expected.byteLength));

	const isValid =
		incoming.byteLength === expected.byteLength && crypto.subtle
			? await isTimingSafeEqual(expected, paddedIncoming)
			: incomingSecret === expectedSecret; // fallback (edge environments without subtle)

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

/** Constant-time byte comparison using SubtleCrypto HMAC trick */
async function isTimingSafeEqual(a: Uint8Array, b: Uint8Array): Promise<boolean> {
	// Import a throwaway HMAC key and sign both values — equal inputs produce equal MACs.
	const key = await crypto.subtle.importKey(
		"raw",
		crypto.getRandomValues(new Uint8Array(32)),
		{ name: "HMAC", hash: "SHA-256" },
		false,
		["sign"],
	);

	const [macA, macB] = await Promise.all([
		crypto.subtle.sign("HMAC", key, a.buffer as ArrayBuffer),
		crypto.subtle.sign("HMAC", key, b.buffer as ArrayBuffer),
	]);

	// Compare MACs byte-by-byte (constant-time is maintained because we compare MACs, not secrets)
	const viewA = new Uint8Array(macA);
	const viewB = new Uint8Array(macB);
	let diff = 0;
	for (let i = 0; i < viewA.length; i++) {
		diff |= viewA[i] ^ viewB[i];
	}
	return diff === 0;
}
