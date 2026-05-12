import { createApiClient } from "@repo/server/client";

const API_URL = import.meta.env.PUBLIC_API_URL ?? "http://localhost:3000";

export const api = createApiClient(API_URL);

export const extractApiError = (error: { value: unknown }): string | null => {
	const val = error.value;
	if (typeof val === "object" && val !== null && "error" in val && typeof val.error === "string") {
		return val.error;
	}
	return null;
};
