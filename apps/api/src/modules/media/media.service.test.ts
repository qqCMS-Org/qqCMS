import { beforeEach, describe, expect, it, mock } from "bun:test";
import { MAX_UPLOAD_SIZE } from "@api/constants";
import { NotFoundError } from "@api/errors";
import type { Media } from "@schema/media";

const mockGetMediaFiles = mock((): Promise<Media[]> => Promise.resolve([]));
const mockGetMediaFile = mock((): Promise<Media | undefined> => Promise.resolve(undefined));
const mockInsertMedia = mock(() =>
	Promise.resolve([
		{
			id: "media-1",
			filename: "test.jpg",
			originalName: "photo.jpg",
			mimeType: "image/jpeg",
			size: 1024,
			url: "/uploads/test.jpg",
			createdAt: new Date(),
		},
	]),
);
const mockDeleteMedia = mock(() => Promise.resolve());
const mockUnlink = mock(() => Promise.resolve());

mock.module("@repository/media", () => ({
	getMediaFiles: mockGetMediaFiles,
	getMediaFile: mockGetMediaFile,
	insertMedia: mockInsertMedia,
	deleteMedia: mockDeleteMedia,
}));

mock.module("node:fs/promises", () => ({
	mkdir: mock(() => Promise.resolve()),
	unlink: mockUnlink,
}));

mock.module("@shared/config", () => ({
	config: {
		uploadDir: "/tmp/test-uploads",
		publicClientUrl: "",
		port: 3000,
		admin: { login: "admin", passwordHash: "hash" },
		jwtSecret: "secret",
		corsOrigins: [],
		databaseUrl: "",
		debug: false,
	},
}));

const { uploadMedia, deleteMedia } = await import("./media.service");

const makeFile = (name: string, type: string, size: number): File => {
	const content = new Uint8Array(size);
	return new File([content], name, { type });
};

describe("uploadMedia", () => {
	beforeEach(() => {
		mockInsertMedia.mockReset();
		mockInsertMedia.mockResolvedValue([
			{
				id: "media-1",
				filename: "abc.jpg",
				originalName: "photo.jpg",
				mimeType: "image/jpeg",
				size: 1024,
				url: "/uploads/abc.jpg",
				createdAt: new Date(),
			},
		]);
	});

	it("throws when MIME type is not allowed", async () => {
		const file = makeFile("script.exe", "application/x-msdownload", 512);

		expect(uploadMedia(file)).rejects.toThrow("Unsupported file type");
	});

	it("throws when file exceeds maximum size", async () => {
		const oversizedFile = makeFile("big.jpg", "image/jpeg", MAX_UPLOAD_SIZE + 1);

		expect(uploadMedia(oversizedFile)).rejects.toThrow("File exceeds maximum size");
	});

	it("uploads a valid file and returns media record", async () => {
		const file = makeFile("photo.jpg", "image/jpeg", 1024);

		const result = await uploadMedia(file);

		expect(result).toMatchObject({ mimeType: "image/jpeg", originalName: "photo.jpg" });
		expect(mockInsertMedia).toHaveBeenCalledTimes(1);
	});
});

describe("deleteMedia", () => {
	beforeEach(() => {
		mockGetMediaFile.mockReset();
		mockDeleteMedia.mockReset();
		mockUnlink.mockReset();
	});

	it("throws NotFoundError when media record does not exist", async () => {
		mockGetMediaFile.mockResolvedValueOnce(undefined);

		expect(deleteMedia("nonexistent")).rejects.toThrow(NotFoundError);
	});

	it("deletes file from disk and removes database record", async () => {
		mockGetMediaFile.mockResolvedValueOnce({
			id: "media-1",
			filename: "test.jpg",
			originalName: "test.jpg",
			mimeType: "image/jpeg",
			size: 1024,
			url: "/uploads/test.jpg",
			createdAt: new Date(),
		});
		mockUnlink.mockResolvedValueOnce(undefined);
		mockDeleteMedia.mockResolvedValueOnce(undefined);

		await deleteMedia("media-1");

		expect(mockUnlink).toHaveBeenCalledWith("/tmp/test-uploads/test.jpg");
		expect(mockDeleteMedia).toHaveBeenCalledWith("media-1");
	});

	it("still deletes database record even if file unlink fails", async () => {
		mockGetMediaFile.mockResolvedValueOnce({
			id: "media-1",
			filename: "missing.jpg",
			originalName: "missing.jpg",
			mimeType: "image/jpeg",
			size: 1024,
			url: "/uploads/missing.jpg",
			createdAt: new Date(),
		});
		mockUnlink.mockRejectedValueOnce(new Error("ENOENT"));
		mockDeleteMedia.mockResolvedValueOnce(undefined);

		await deleteMedia("media-1");

		expect(mockDeleteMedia).toHaveBeenCalledWith("media-1");
	});
});
