import { useComputed, useSignal } from "@preact/signals";
import { ALLOWED_MIME_TYPES, MAX_UPLOAD_SIZE } from "@repo/types";
import { api } from "@shared/api/client";
import { Grid2x2, List, Search, Upload, X } from "lucide-preact";
import type { JSX } from "preact";
import { useEffect } from "preact/hooks";

// ── Types ─────────────────────────────────────────────

export interface MediaFile {
	id: string;
	filename: string;
	originalName: string;
	mimeType: string;
	size: number;
	url: string;
	createdAt: string;
}

interface MediaLibraryProps {
	initialFiles: MediaFile[];
}

// ── Constants ─────────────────────────────────────────

type FilterKey = "All" | "Images" | "Video" | "Documents";

const FILTER_KEYS: FilterKey[] = ["All", "Images", "Video", "Documents"];

const IMAGE_MIME_TYPES = ALLOWED_MIME_TYPES.filter((mime) => mime.startsWith("image/"));
const VIDEO_MIME_TYPES = ALLOWED_MIME_TYPES.filter((mime) => mime.startsWith("video/"));
const DOCUMENT_MIME_TYPES = ALLOWED_MIME_TYPES.filter(
	(mime) => !mime.startsWith("image/") && !mime.startsWith("video/"),
);

const MAX_UPLOAD_SIZE_MB = MAX_UPLOAD_SIZE / 1024 / 1024;
const ACCEPTED_MIME_TYPES = ALLOWED_MIME_TYPES.join(",");

const MIME_FILTERS: Record<FilterKey, (file: MediaFile) => boolean> = {
	All: () => true,
	Images: (file) => IMAGE_MIME_TYPES.some((mime) => mime === file.mimeType),
	Video: (file) => VIDEO_MIME_TYPES.some((mime) => mime === file.mimeType),
	Documents: (file) => DOCUMENT_MIME_TYPES.some((mime) => file.mimeType.startsWith(mime)),
};

const formatBytes = (bytes: number): string => {
	if (bytes < 1024) return `${bytes} B`;
	if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
	return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (iso: string): string =>
	new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

const getMimeLabel = (mimeType: string): string => {
	if (mimeType.startsWith("image/")) return mimeType.split("/")[1].toUpperCase();
	if (mimeType.startsWith("video/")) return mimeType.split("/")[1].toUpperCase();
	if (mimeType === "application/pdf") return "PDF";
	if (mimeType === "text/csv") return "CSV";
	return mimeType.split("/").pop()?.toUpperCase() ?? "FILE";
};

const isImage = (mimeType: string) => mimeType.startsWith("image/");

// ── FileIcon ──────────────────────────────────────────

const FileIcon = ({ mimeType, size = 28 }: { mimeType: string; size?: number }) => {
	const label = getMimeLabel(mimeType);
	const colorClass = isImage(mimeType)
		? "text-accent"
		: mimeType === "application/pdf"
			? "text-coral"
			: mimeType.startsWith("video/")
				? "text-green"
				: "text-amber";

	return (
		<span class={`${colorClass} opacity-60 leading-none font-mono`} style={{ fontSize: size }}>
			{label[0]}
		</span>
	);
};

// ── FilePreview ───────────────────────────────────────

const FilePreview = ({ file, apiUrl }: { file: MediaFile; apiUrl: string }) => {
	if (isImage(file.mimeType)) {
		return (
			<img src={`${apiUrl}${file.url}`} alt={file.originalName} class="w-full h-full object-cover" loading="lazy" />
		);
	}
	return (
		<div class="w-full h-full flex items-center justify-center">
			<FileIcon mimeType={file.mimeType} size={36} />
		</div>
	);
};

// ── DetailPanel ───────────────────────────────────────

interface DetailPanelProps {
	file: MediaFile;
	apiUrl: string;
	onDelete: (id: string) => void;
	onClose: () => void;
}

const DetailPanel = ({ file, apiUrl, onDelete, onClose }: DetailPanelProps): JSX.Element => {
	const copying = useSignal(false);
	const deleting = useSignal(false);

	const handleCopyUrl = async (): Promise<void> => {
		copying.value = true;
		await navigator.clipboard.writeText(`${apiUrl}${file.url}`).catch(() => null);
		setTimeout(() => {
			copying.value = false;
		}, 1200);
	};

	const handleDelete = async (): Promise<void> => {
		deleting.value = true;
		const { error } = await api.media({ id: file.id }).delete();
		deleting.value = false;
		if (!error) {
			onDelete(file.id);
			onClose();
		}
	};

	const meta: [string, string][] = [
		["Type", getMimeLabel(file.mimeType)],
		["Size", formatBytes(file.size)],
		["Uploaded", formatDate(file.createdAt)],
		["Filename", file.filename],
	];

	return (
		<div class="flex flex-col h-full overflow-hidden">
			<div class="flex items-center justify-between px-3.5 py-2.5 border-b border-ui-border shrink-0">
				<span class="text-[11px] text-text0 truncate max-w-42.5" title={file.originalName}>
					{file.originalName}
				</span>
				<button
					type="button"
					onClick={onClose}
					class="text-text1 hover:text-text0 cursor-pointer bg-transparent border-0 p-0 leading-none ml-2"
				>
					<X size={15} />
				</button>
			</div>

			<div class="flex-1 overflow-y-auto p-3.5">
				<div class="bg-bg3 border border-ui-border rounded aspect-4/3 flex items-center justify-center overflow-hidden mb-3.5">
					<FilePreview file={file} apiUrl={apiUrl} />
				</div>

				{meta.map(([key, value]) => (
					<div key={key} class="mb-2.5">
						<div class="text-[10px] text-text2 mb-0.5">{key}</div>
						<div class="text-[11px] text-text0 truncate">{value}</div>
					</div>
				))}

				<div class="flex flex-col gap-1.5 mt-4">
					<button
						type="button"
						onClick={handleCopyUrl}
						class="w-full text-[11px] bg-bg3 border border-ui-border text-text0 rounded px-3 py-1.5 cursor-pointer hover:bg-bg4 transition-colors"
					>
						{copying.value ? "Copied!" : "Copy URL"}
					</button>
					<button
						type="button"
						onClick={handleDelete}
						disabled={deleting.value}
						class="w-full text-[11px] bg-transparent border border-coral/40 text-coral rounded px-3 py-1.5 cursor-pointer hover:bg-coral/10 transition-colors disabled:opacity-50"
					>
						{deleting.value ? "Deleting…" : "Delete file"}
					</button>
				</div>
			</div>
		</div>
	);
};

// ── UploadModal ───────────────────────────────────────

interface UploadModalProps {
	onClose: () => void;
	onUploaded: (file: MediaFile) => void;
	apiUrl: string;
}

const UploadModal = ({ onClose, onUploaded, apiUrl }: UploadModalProps): JSX.Element => {
	const dragging = useSignal(false);
	const uploading = useSignal(false);
	const error = useSignal<string | null>(null);

	useEffect(() => {
		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") onClose();
		};
		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, []);

	const uploadFile = async (file: File): Promise<void> => {
		uploading.value = true;
		error.value = null;

		const formData = new FormData();
		formData.append("file", file);

		const response = await fetch(`${apiUrl}/media`, {
			method: "POST",
			body: formData,
			credentials: "include",
		}).catch(() => null);

		uploading.value = false;

		if (!response?.ok) {
			const body = await response?.json().catch(() => null);
			error.value = body?.error ?? "Upload failed";
			return;
		}

		const uploaded: MediaFile = await response.json();
		onUploaded(uploaded);
		onClose();
	};

	const handleDrop = async (event: DragEvent): Promise<void> => {
		event.preventDefault();
		dragging.value = false;
		const file = event.dataTransfer?.files[0];
		if (file) await uploadFile(file);
	};

	const handleInputChange = async (event: Event): Promise<void> => {
		const input = event.target as HTMLInputElement;
		const file = input.files?.[0];
		if (file) await uploadFile(file);
	};

	return (
		<div
			class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
			role="dialog"
			aria-modal="true"
			onClick={(event) => {
				if (event.target === event.currentTarget) onClose();
			}}
			onKeyDown={(event) => {
				if (event.key === "Escape") onClose();
			}}
		>
			<div class="bg-bg0 border border-ui-border rounded-lg w-full max-w-md shadow-xl">
				<div class="flex items-center justify-between px-4 py-3 border-b border-ui-border">
					<span class="text-[13px] font-medium text-text0">Upload files</span>
					<button
						type="button"
						onClick={onClose}
						class="text-text1 hover:text-text0 cursor-pointer bg-transparent border-0 p-0"
					>
						<X size={16} />
					</button>
				</div>

				<div class="p-4">
					{error.value && (
						<div class="text-[11px] text-coral mb-3 bg-coral/10 border border-coral/30 rounded px-3 py-2">
							{error.value}
						</div>
					)}

					<label
						class="block"
						onDragOver={(event) => {
							event.preventDefault();
							dragging.value = true;
						}}
						onDragLeave={() => {
							dragging.value = false;
						}}
						onDrop={handleDrop}
					>
						<div
							class={`border-2 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors ${
								dragging.value ? "border-accent bg-accent/5" : "border-ui-border hover:border-ui-border2"
							}`}
						>
							{uploading.value ? (
								<>
									<div class="text-[28px] text-accent opacity-70 mb-2">⋯</div>
									<div class="text-[13px] text-text0">Uploading…</div>
								</>
							) : (
								<>
									<Upload size={28} class="mx-auto mb-2 text-accent opacity-70" />
									<div class="text-[13px] text-text0 mb-1">Drop files here or click to browse</div>
									<div class="text-[10px] text-text2">Images, PDF, Video, Audio — max {MAX_UPLOAD_SIZE_MB} MB</div>
								</>
							)}
						</div>
						<input
							type="file"
							class="hidden"
							accept={ACCEPTED_MIME_TYPES}
							onChange={handleInputChange}
							disabled={uploading.value}
						/>
					</label>
				</div>
			</div>
		</div>
	);
};

// ── MediaLibrary ──────────────────────────────────────

export function MediaLibrary({ initialFiles }: MediaLibraryProps): JSX.Element {
	const files = useSignal<MediaFile[]>(initialFiles);
	const filter = useSignal<FilterKey>("All");
	const search = useSignal("");
	const viewMode = useSignal<"grid" | "list">("grid");
	const selectedId = useSignal<string | null>(null);
	const showUpload = useSignal(false);

	const apiUrl = import.meta.env.PUBLIC_API_URL ?? "http://localhost:3000";

	const visible = useComputed(() =>
		files.value
			.filter(MIME_FILTERS[filter.value])
			.filter((file) => !search.value || file.originalName.toLowerCase().includes(search.value.toLowerCase())),
	);

	const selectedFile = useComputed(() => files.value.find((file) => file.id === selectedId.value) ?? null);

	const handleSelect = (id: string): void => {
		selectedId.value = selectedId.value === id ? null : id;
	};

	const handleUploaded = (file: MediaFile): void => {
		files.value = [file, ...files.value];
	};

	const handleDeleted = (id: string): void => {
		files.value = files.value.filter((file) => file.id !== id);
	};

	return (
		<div class="flex h-full overflow-hidden">
			{/* Main area */}
			<div class="flex-1 flex flex-col overflow-hidden">
				{/* Filters bar */}
				<div class="flex flex-wrap gap-1.5 px-3 py-2 border-b border-ui-border bg-bg0 shrink-0 items-center">
					<div class="relative flex-1 min-w-30">
						<Search size={12} class="absolute left-2 top-1/2 -translate-y-1/2 text-text2 pointer-events-none" />
						<input
							type="text"
							value={search.value}
							onInput={(event) => {
								search.value = (event.target as HTMLInputElement).value;
							}}
							placeholder="Search…"
							class="w-full bg-bg2 border border-ui-border rounded text-[11px] text-text0 pl-6 pr-2 py-1.5 outline-none focus:border-accent"
						/>
					</div>

					<div class="flex gap-1 shrink-0">
						{FILTER_KEYS.map((key) => (
							<button
								key={key}
								type="button"
								onClick={() => {
									filter.value = key;
								}}
								class={`text-[10px] px-2.5 py-1 rounded border cursor-pointer transition-colors whitespace-nowrap ${
									filter.value === key
										? "bg-accent border-accent text-white"
										: "bg-bg3 border-ui-border text-text1 hover:text-text0"
								}`}
							>
								{key}
							</button>
						))}
					</div>

					<div class="flex bg-bg3 border border-ui-border rounded overflow-hidden shrink-0">
						<button
							type="button"
							onClick={() => {
								viewMode.value = "grid";
							}}
							class={`px-2.5 py-1.5 cursor-pointer transition-colors border-0 ${viewMode.value === "grid" ? "bg-bg4 text-text0" : "bg-transparent text-text2 hover:text-text1"}`}
						>
							<Grid2x2 size={13} />
						</button>
						<button
							type="button"
							onClick={() => {
								viewMode.value = "list";
							}}
							class={`px-2.5 py-1.5 cursor-pointer transition-colors border-0 ${viewMode.value === "list" ? "bg-bg4 text-text0" : "bg-transparent text-text2 hover:text-text1"}`}
						>
							<List size={13} />
						</button>
					</div>

					<button
						type="button"
						onClick={() => {
							showUpload.value = true;
						}}
						class="flex items-center gap-1.5 text-[11px] px-3 py-1.5 bg-accent text-white rounded cursor-pointer hover:opacity-90 transition-opacity border-0 shrink-0"
					>
						<Upload size={12} />
						<span class="max-sm:hidden">Upload</span>
					</button>
				</div>

				{/* File grid / list */}
				<div class="flex-1 overflow-y-auto bg-bg1">
					{visible.value.length === 0 ? (
						<div class="flex items-center justify-center h-full">
							<span class="text-[11px] text-text2">No files found.</span>
						</div>
					) : viewMode.value === "grid" ? (
						<div class="grid gap-px bg-ui-border grid-cols-[repeat(auto-fill,minmax(150px,1fr))]">
							{visible.value.map((file) => (
								<button
									key={file.id}
									type="button"
									onClick={() => handleSelect(file.id)}
									class={`relative aspect-4/3 flex flex-col items-center justify-center gap-1.5 cursor-pointer p-2 transition-colors bg-bg2 border-0 ${
										file.id === selectedId.value ? "ring-2 ring-accent z-10" : "hover:bg-bg3"
									}`}
								>
									<div class="w-full h-full absolute inset-0 overflow-hidden">
										<FilePreview file={file} apiUrl={apiUrl} />
									</div>
									<div class="relative z-10 w-full px-1 pb-1 mt-auto">
										<div class="text-[9px] text-text0 truncate w-full text-center drop-shadow-sm">
											{file.originalName}
										</div>
										<div class="text-[8px] text-text2 text-center">{formatBytes(file.size)}</div>
									</div>
									{file.id === selectedId.value && (
										<div class="absolute top-1.5 right-1.5 w-4 h-4 bg-accent rounded-full flex items-center justify-center z-20">
											<span class="text-white text-[9px] font-bold">✓</span>
										</div>
									)}
								</button>
							))}
						</div>
					) : (
						<div>
							<div class="flex px-3 py-2 border-b border-ui-border bg-bg0 text-[10px] text-text2 uppercase tracking-wider">
								<div class="flex-3">Name</div>
								<div class="flex-1">Type</div>
								<div class="flex-1">Size</div>
								<div class="flex-1 max-sm:hidden">Uploaded</div>
							</div>
							{visible.value.map((file) => (
								<button
									key={file.id}
									type="button"
									onClick={() => handleSelect(file.id)}
									class={`flex items-center w-full px-3 min-h-10 border-b border-ui-border cursor-pointer transition-colors text-left border-x-0 border-t-0 ${
										file.id === selectedId.value ? "bg-accent/10" : "bg-transparent hover:bg-bg2"
									}`}
								>
									<div class="flex-3 flex items-center gap-2 overflow-hidden pr-2">
										<FileIcon mimeType={file.mimeType} size={13} />
										<span class="text-[11px] text-text0 truncate">{file.originalName}</span>
									</div>
									<div class="flex-1 text-[10px] text-accent">{getMimeLabel(file.mimeType)}</div>
									<div class="flex-1 text-[11px] text-text1">{formatBytes(file.size)}</div>
									<div class="flex-1 text-[10px] text-text2 max-sm:hidden">{formatDate(file.createdAt)}</div>
								</button>
							))}
						</div>
					)}

					<div class="flex items-center justify-between px-3 py-2 border-t border-ui-border text-[10px] text-text2">
						<span>{visible.value.length} files</span>
					</div>
				</div>
			</div>

			{/* Desktop detail panel */}
			{selectedFile.value && (
				<div class="w-57.5 border-l border-ui-border bg-bg0 flex flex-col shrink-0 max-sm:hidden">
					<DetailPanel
						file={selectedFile.value}
						apiUrl={apiUrl}
						onDelete={handleDeleted}
						onClose={() => {
							selectedId.value = null;
						}}
					/>
				</div>
			)}

			{/* Upload modal */}
			{showUpload.value && (
				<UploadModal
					onClose={() => {
						showUpload.value = false;
					}}
					onUploaded={handleUploaded}
					apiUrl={apiUrl}
				/>
			)}
		</div>
	);
}
