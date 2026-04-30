import { treaty } from "@elysiajs/eden";
import type { App } from "@repo/server";

const API_URL = import.meta.env.API_URL ?? "http://localhost:3000";

export const api = treaty<App>(API_URL);
