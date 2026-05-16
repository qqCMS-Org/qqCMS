import { mkdir, unlink } from "node:fs/promises";
import { join } from "node:path";
import { config } from "@api/config";
import type { AllowedMimeType } from "@api/constants";
import { ALLOWED_MIME_TYPES, MAX_UPLOAD_SIZE } from "@api/constants";
import { BadRequestError, NotFoundError } from "@api/errors";
import {
	deleteMedia as deleteMediaInDb,
	getMediaFile as getMediaFileById,
	getMediaFiles,
	insertMedia,
} from "@repository/media";

export const ensureUploadDir = async () => {
	await mkdir(config.uploadDir, { recursive: true });
};

export const listMedia = () => getMediaFiles();

export const getMedia = (id: string) => getMediaFileById(id);

export const uploadMedia = async (file: File) => {
	if (!(ALLOWED_MIME_TYPES as readonly string[]).includes(file.type)) {
		throw new BadRequestError(`Unsupported file type: ${file.type}`);
	}

	if (file.size > MAX_UPLOAD_SIZE) {
		throw new BadRequestError(`File exceeds maximum size of ${MAX_UPLOAD_SIZE / 1024 / 1024} MB`);
	}

	const extension = file.name.split(".").pop() ?? "";
	const filename = `${crypto.randomUUID()}.${extension}`;
	const filePath = join(config.uploadDir, filename);

	const buffer = await file.arrayBuffer();
	await Bun.write(filePath, buffer);

	const [record] = await insertMedia({
		filename,
		originalName: file.name,
		mimeType: file.type as AllowedMimeType,
		size: file.size,
		url: `/uploads/${filename}`,
	});

	return record;
};

export const deleteMedia = async (id: string) => {
	const record = await getMediaFileById(id);
	if (!record) throw new NotFoundError("Media file not found");

	const filePath = join(config.uploadDir, record.filename);
	await unlink(filePath).catch(() => null);

	await deleteMediaInDb(id);
};
