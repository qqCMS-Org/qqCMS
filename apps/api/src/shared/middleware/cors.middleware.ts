import cors from "@elysiajs/cors";
import { config } from "@shared/config";
import { Elysia } from "elysia";

export const corsMiddleware = new Elysia({ name: "cors-middleware" }).use(
	cors({
		origin: config.corsOrigins,
		credentials: true,
		allowedHeaders: ["Content-Type", "Authorization"],
		methods: ["GET", "POST", "PATCH", "DELETE", "PUT", "OPTIONS"],
	}),
);
