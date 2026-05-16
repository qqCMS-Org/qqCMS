import { api, extractApiError } from "@shared/api/client";
import { Image as ImageIcon } from "lucide-preact";
import type { JSX } from "preact";
import { useEffect, useRef, useState } from "preact/compat";

interface MediaSelectProps {
	value?: string; // Media ID
	onChange: (id: string | null) => void;
	label: string;
	hint?: string;
}

export const MediaSelect = ({ value, onChange, label, hint }: MediaSelectProps) => {
	const [previewUrl, setPreviewUrl] = useState<string | null>(null);
	const [isUploading, setIsUploading] = useState(false);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const API_URL = import.meta.env.PUBLIC_API_URL ?? "http://localhost:3000";

	useEffect(() => {
		if (value) {
			api
				.media({ id: value })
				.get()
				.then((res) => {
					if (res.data && "url" in res.data) {
						setPreviewUrl(`${API_URL}${res.data.url}`);
					}
				});
		} else {
			setPreviewUrl(null);
		}
	}, [value, API_URL]);

	const handleFileChange = async (e: JSX.TargetedEvent<HTMLInputElement, Event>) => {
		const file = e.currentTarget.files?.[0];
		if (!file) return;

		setIsUploading(true);
		try {
			const res = await api.media.post({ file });
			if (res.error) {
				throw new Error(extractApiError(res.error) ?? "Upload failed");
			}
			if (res.data && typeof res.data === "object" && "id" in res.data) {
				const mediaId = res.data.id as string;
				onChange(mediaId);
			}
		} catch (err) {
			console.error(err);
			alert(String(err));
		} finally {
			setIsUploading(false);
		}
	};

	return (
		<div class="mb-4 last:mb-0">
			<div class="text-[12px] text-text0 mb-1">{label}</div>
			{hint && <div class="text-[10px] text-text1 mb-2">{hint}</div>}
			<div class="flex items-center gap-3">
				<button
					type="button"
					class="w-12 h-12 rounded border border-ui-border bg-bg3 flex items-center justify-center overflow-hidden cursor-pointer hover:border-accent transition-colors p-0"
					onClick={() => fileInputRef.current?.click()}
					aria-label={`Select ${label}`}
				>
					{previewUrl ? (
						<img src={previewUrl} alt={label} class="w-full h-full object-cover" />
					) : (
						<ImageIcon size={20} class="text-text2" />
					)}
				</button>
				<div class="flex flex-col gap-1">
					<button
						type="button"
						onClick={() => fileInputRef.current?.click()}
						class="text-[11px] text-accent hover:underline bg-transparent border-none p-0 cursor-pointer text-left font-medium"
						disabled={isUploading}
					>
						{isUploading ? "Uploading..." : value ? "Change image" : "Upload image"}
					</button>
					{value && (
						<button
							type="button"
							onClick={() => onChange(null)}
							class="text-[11px] text-coral hover:underline bg-transparent border-none p-0 cursor-pointer text-left font-medium"
						>
							Remove
						</button>
					)}
				</div>
				<input type="file" ref={fileInputRef} onChange={handleFileChange} class="hidden" accept="image/*" />
			</div>
		</div>
	);
};
