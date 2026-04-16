import { ALLOWED_MIME_TYPES } from "@shared/constants"

export interface MediaRecord {
  id: string
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  createdAt: string
}

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number]
