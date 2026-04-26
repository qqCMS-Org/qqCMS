import { ALLOWED_MIME_TYPES } from "@shared/constants";
import { type Static, t } from "elysia";

export const AllowedMimeSchema = t.Union(
	ALLOWED_MIME_TYPES.map((mime) => t.Literal(mime)) as [
		ReturnType<typeof t.Literal>,
		ReturnType<typeof t.Literal>,
		...ReturnType<typeof t.Literal>[],
	],
);

export interface MediaRecord {
	id: string;
	filename: string;
	originalName: string;
	mimeType: string;
	size: number;
	url: string;
	createdAt: Date;
}

export const UploadMediaSchema = t.Object({
	file: t.File(),
});

export type UploadMediaInput = Static<typeof UploadMediaSchema>;
