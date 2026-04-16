import { randomUUID } from "crypto"
import { mkdir, unlink, writeFile } from "fs/promises"
import { join } from "path"
import {
  deleteMedia as deleteMediaInDb,
  getMediaFile as getMediaFileFromDb,
  getMediaFiles as getMediaFilesFromDb,
  insertMedia,
} from "@repository/media"
import { ALLOWED_MIME_TYPES, MAX_UPLOAD_SIZE_BYTES } from "@shared/constants"
import { config } from "@shared/config"

export const listMedia = () => getMediaFilesFromDb()

export const ensureUploadDir = async () => {
  await mkdir(config.uploadDir, { recursive: true })
}

export const uploadMedia = async (file: File) => {
  if (!(ALLOWED_MIME_TYPES as readonly string[]).includes(file.type)) {
    return { error: "unsupported_mime_type" as const }
  }

  if (file.size > MAX_UPLOAD_SIZE_BYTES) {
    return { error: "file_too_large" as const }
  }

  const ext = file.name.split(".").pop() ?? ""
  const storedFilename = ext ? `${randomUUID()}.${ext}` : randomUUID()
  const filePath = join(config.uploadDir, storedFilename)

  const buffer = await file.arrayBuffer()
  await writeFile(filePath, Buffer.from(buffer))

  const record = insertMedia({
    id: randomUUID(),
    filename: storedFilename,
    originalName: file.name,
    mimeType: file.type,
    size: file.size,
    url: `/uploads/${storedFilename}`,
    createdAt: new Date().toISOString(),
  })

  return { data: record }
}

export const deleteMedia = async (id: string) => {
  const record = getMediaFileFromDb(id)
  if (!record) return false

  await unlink(join(config.uploadDir, record.filename)).catch(() => null)
  deleteMediaInDb(id)
  return true
}
