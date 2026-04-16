const formatMessage = (level: string, message: string) =>
  `[${new Date().toISOString()}] [${level}] ${message}`

export const logger = {
  info: (message: string) => console.log(formatMessage("INFO", message)),
  warn: (message: string) => console.warn(formatMessage("WARN", message)),
  error: (message: string) => console.error(formatMessage("ERROR", message)),
}
