import "./shared/config"
import { Elysia } from "elysia"
import { cors } from "@elysiajs/cors"
import { staticPlugin } from "@elysiajs/static"
import { config } from "@shared/config"
import { logger } from "@core/Logger"
import { ERROR_CODES } from "@shared/constants"
import { ensureUploadDir } from "@modules/media/media.service"
import { authController } from "@modules/auth"
import { pagesController } from "@modules/pages"
import { navigationController } from "@modules/navigation"
import { mediaController } from "@modules/media"
import { languagesController } from "@modules/languages"
import { settingsController } from "@modules/settings"

await ensureUploadDir()

const app = new Elysia()
  .use(
    cors({
      origin: config.corsOrigins,
      credentials: true,
    }),
  )
  .use(
    staticPlugin({
      assets: config.uploadDir,
      prefix: "/uploads",
    }),
  )
  .onError(({ code, error, set }) => {
    if (code === "NOT_FOUND") {
      set.status = 404
      return { error: "Not found", code: ERROR_CODES.NOT_FOUND }
    }

    if (code === "VALIDATION") {
      set.status = 400
      return {
        error: "Invalid input",
        code: ERROR_CODES.VALIDATION_ERROR,
        details: error.message,
      }
    }

    logger.error(`Unhandled error: ${error}`)
    set.status = 500
    return { error: "Internal server error", code: ERROR_CODES.INTERNAL_ERROR }
  })
  .use(authController)
  .use(pagesController)
  .use(navigationController)
  .use(mediaController)
  .use(languagesController)
  .use(settingsController)
  .listen(config.port)

logger.info(`API running at http://${app.server?.hostname}:${app.server?.port}`)

export type App = typeof app
