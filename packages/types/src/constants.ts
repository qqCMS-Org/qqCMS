/** Allowed MIME types for media uploads */
export const ALLOWED_MIME_TYPES = [
	"image/jpeg",
	"image/png",
	"image/gif",
	"image/webp",
	"image/svg+xml",
	"application/pdf",
	"video/mp4",
	"video/webm",
	"audio/mpeg",
	"audio/wav",
] as const;

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

/** Maximum upload size in bytes (10 MB) */
export const MAX_UPLOAD_SIZE = 10 * 1024 * 1024;

/** Name of the httpOnly cookie that stores the JWT */
export const AUTH_COOKIE_NAME = "qq_auth";

/** JWT expiry (7 days in seconds) */
export const JWT_EXPIRES_IN = 60 * 60 * 24 * 7;
