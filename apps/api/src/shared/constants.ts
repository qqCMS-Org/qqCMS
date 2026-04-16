export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/svg+xml",
  "application/pdf",
] as const

export const MAX_UPLOAD_SIZE_BYTES = 10 * 1024 * 1024 // 10 MB

export const ERROR_CODES = {
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  UNAUTHORIZED: "UNAUTHORIZED",
  FORBIDDEN: "FORBIDDEN",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  INTERNAL_ERROR: "INTERNAL_ERROR",
  UNSUPPORTED_MEDIA_TYPE: "UNSUPPORTED_MEDIA_TYPE",
  PAYLOAD_TOO_LARGE: "PAYLOAD_TOO_LARGE",
} as const
