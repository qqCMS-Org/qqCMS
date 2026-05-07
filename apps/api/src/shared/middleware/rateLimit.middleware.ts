import { Elysia } from "elysia";

const RATE_LIMIT_MAX = 100;
const RATE_LIMIT_WINDOW_MS = 60_000;
const CLEANUP_INTERVAL_MS = 5 * 60_000;

interface RateLimitRecord {
	count: number;
	resetTime: number;
}

const requestCounts = new Map<string, RateLimitRecord>();

setInterval(() => {
	const now = Date.now();
	for (const [ip, record] of requestCounts) {
		if (record.resetTime < now) {
			requestCounts.delete(ip);
		}
	}
}, CLEANUP_INTERVAL_MS).unref();

export const rateLimitMiddleware = new Elysia({ name: "rate-limit-middleware" }).onBeforeHandle(
	{ as: "global" },
	({ request, set }) => {
		const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "unknown";
		const now = Date.now();
		const record = requestCounts.get(ip);

		if (!record || record.resetTime < now) {
			requestCounts.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
			return undefined;
		}

		record.count++;

		if (record.count > RATE_LIMIT_MAX) {
			set.status = 429;
			return { error: "Too many requests", code: "RATE_LIMITED" };
		}

		return undefined;
	},
);
