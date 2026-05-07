import { config } from "@api/config";
import { BadRequestError, ConflictError, NotFoundError, UnauthorizedError } from "@api/errors";
import { corsMiddleware } from "@api/middleware/cors.middleware";
import { rateLimitMiddleware } from "@api/middleware/rateLimit.middleware";
import { Logger } from "@core/Logger";
import staticPlugin from "@elysiajs/static";
import { authModule } from "@modules/auth";
import { languagesModule } from "@modules/languages";
import { mediaModule } from "@modules/media";
import { ensureUploadDir } from "@modules/media/media.service";
import { navigationModule } from "@modules/navigation";
import { pagesModule } from "@modules/pages";
import { settingsModule } from "@modules/settings";
import { Elysia } from "elysia";

await ensureUploadDir();

const app = new Elysia()
	.use(corsMiddleware)
	.use(rateLimitMiddleware)
	.use(
		staticPlugin({
			assets: config.uploadDir,
			prefix: "/uploads",
		}),
	)
	.onError(({ code, error, set }) => {
		if (
			error instanceof NotFoundError ||
			error instanceof ConflictError ||
			error instanceof UnauthorizedError ||
			error instanceof BadRequestError
		) {
			set.status = error.status;
			return { error: error.message, code: error.code };
		}

		if (code === "VALIDATION") {
			set.status = 400;
			return { error: "Invalid input", code: "VALIDATION_ERROR", details: error.message };
		}

		if (code === "NOT_FOUND") {
			set.status = 404;
			return { error: "Route not found", code: "NOT_FOUND" };
		}

		Logger.error(`Unhandled error: ${error instanceof Error ? error.message : String(error)}`);
		set.status = 500;
		return { error: "Internal server error", code: "INTERNAL_ERROR" };
	})
	.use(authModule)
	.use(pagesModule)
	.use(navigationModule)
	.use(mediaModule)
	.use(languagesModule)
	.use(settingsModule)
	.listen(config.port);

Logger.info(`Elysia is running at ${app.server?.hostname}:${app.server?.port}`);

export type App = typeof app;
