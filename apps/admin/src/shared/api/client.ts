import { createApiClient } from "@repo/server/client";

const API_URL = import.meta.env.PUBLIC_API_URL ?? "http://localhost:3000";

export const api = createApiClient(API_URL);
