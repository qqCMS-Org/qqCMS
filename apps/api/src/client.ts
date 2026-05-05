import { treaty } from "@elysiajs/eden";
import type { App } from "./index";

export const createApiClient = (url: string) => treaty<App>(url);
export type ApiClient = ReturnType<typeof createApiClient>;
