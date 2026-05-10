import type { APIRoute } from "astro";
import { invalidate, invalidateAll } from "../../lib/cache";

export const POST: APIRoute = async ({ request }) => {
	const secret = request.headers.get("x-revalidate-secret");

	if (secret !== import.meta.env.REVALIDATE_SECRET) {
		return new Response("Unauthorized", { status: 401 });
	}

	const body = await request.json().catch(() => ({}));
	const path: string | undefined = body.path;

	if (path) {
		invalidate(path);
	} else {
		invalidateAll();
	}

	return Response.json({ revalidated: true, path: path ?? "all" });
};
