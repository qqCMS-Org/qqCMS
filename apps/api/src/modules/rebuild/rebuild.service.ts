import { config } from "@shared/config"
import { logger } from "@core/Logger"

const REVALIDATE_SECRET = "qqcms-revalidate"

export const triggerRebuild = async () => {
  const url = `${config.publicClientUrl}/api/revalidate`

  await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-revalidate-secret": REVALIDATE_SECRET,
    },
  }).catch((error) => {
    logger.warn(`Rebuild trigger failed: ${error}`)
  })
}
