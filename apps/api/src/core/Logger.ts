type LogLevel = "info" | "warn" | "error" | "debug";

const IS_DEBUG = process.env["DEBUG"] === "true";

const LEVEL_PREFIX: Record<LogLevel, string> = {
	info: "ℹ️  [INFO ]",
	warn: "⚠️  [WARN ]",
	error: "🔴 [ERROR]",
	debug: "🐛 [DEBUG]",
};

function log(level: LogLevel, message: string, meta?: unknown): void {
	if (level === "debug" && !IS_DEBUG) return;
	const ts = new Date().toISOString();
	const prefix = LEVEL_PREFIX[level];
	const metaStr = meta !== undefined ? ` ${JSON.stringify(meta)}` : "";
	const line = `${ts} ${prefix} ${message}${metaStr}`;

	if (level === "error") {
		console.error(line);
	} else if (level === "warn") {
		console.warn(line);
	} else {
		console.log(line);
	}
}

export const Logger = {
	info: (message: string, meta?: unknown) => log("info", message, meta),
	warn: (message: string, meta?: unknown) => log("warn", message, meta),
	error: (message: string, meta?: unknown) => log("error", message, meta),
	debug: (message: string, meta?: unknown) => log("debug", message, meta),
};
