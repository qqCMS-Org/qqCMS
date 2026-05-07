import { useSignal } from "@preact/signals";
import { Toggle } from "@repo/ui/Toggle";
import type { JSONContent } from "@tiptap/core";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import type { ComponentChildren, JSX } from "preact";
import { useRef } from "preact/hooks";

export interface PageLanguage {
	id: string;
	code: string;
	label: string;
	isActive: boolean;
}

export interface PageTranslationData {
	languageCode: string;
	title: string;
	content: JSONContent | null;
}

interface TranslationEntry {
	title: string;
	content: JSONContent | null;
}

interface PageEditorProps {
	pageId?: string;
	initialSlug?: string;
	initialIsHomepage?: boolean;
	initialStatus?: "draft" | "published" | "unpublished";
	initialHasDraft?: boolean;
	initialTranslations?: PageTranslationData[];
	languages: PageLanguage[];
	apiUrl: string;
}

export function PageEditor({
	pageId,
	initialSlug = "",
	initialIsHomepage = false,
	initialStatus = "draft",
	initialHasDraft = true,
	initialTranslations = [],
	languages,
	apiUrl,
}: PageEditorProps): JSX.Element {
	const activeLang = useSignal(languages[0]?.code ?? "");
	const slug = useSignal(initialSlug);
	const isHomepage = useSignal(initialIsHomepage);
	const status = useSignal<"draft" | "published" | "unpublished">(initialStatus);
	const hasDraft = useSignal(initialHasDraft);
	const seoTitle = useSignal("");
	const saving = useSignal(false);
	const errorMsg = useSignal<string | null>(null);
	const showDeleteConfirm = useSignal(false);
	const skipNextUpdate = useRef(false);

	const savedTranslations = useSignal<Record<string, TranslationEntry>>(
		Object.fromEntries(
			languages.map((lang) => {
				const found = initialTranslations.find((t) => t.languageCode === lang.code);
				return [lang.code, { title: found?.title ?? "", content: found?.content ?? null }];
			}),
		),
	);

	const activeTitle = useSignal(savedTranslations.value[activeLang.value]?.title ?? "");
	const editorTick = useSignal(0);

	const editor = useEditor({
		extensions: [StarterKit],
		content: savedTranslations.value[activeLang.value]?.content ?? "",
		onUpdate({ editor: e }) {
			editorTick.value += 1;
			if (skipNextUpdate.current) {
				skipNextUpdate.current = false;
				return;
			}
			savedTranslations.value = {
				...savedTranslations.value,
				[activeLang.value]: {
					...savedTranslations.value[activeLang.value],
					content: e.getJSON(),
				},
			};
		},
		onSelectionUpdate() {
			editorTick.value += 1;
		},
	});

	const switchLang = (code: string): void => {
		savedTranslations.value = {
			...savedTranslations.value,
			[activeLang.value]: {
				title: activeTitle.value,
				content: editor?.getJSON() ?? savedTranslations.value[activeLang.value]?.content ?? null,
			},
		};

		activeLang.value = code;
		activeTitle.value = savedTranslations.value[code]?.title ?? "";

		skipNextUpdate.current = true;
		editor?.commands.setContent(savedTranslations.value[code]?.content ?? "");
	};

	const saveTranslations = async (resolvedPageId: string): Promise<boolean> => {
		const allTranslations: Record<string, TranslationEntry> = {
			...savedTranslations.value,
			[activeLang.value]: {
				title: activeTitle.value,
				content: editor?.getJSON() ?? savedTranslations.value[activeLang.value]?.content ?? null,
			},
		};

		for (const [langCode, translation] of Object.entries(allTranslations)) {
			if (!translation.title.trim()) continue;

			const transRes = await fetch(`${apiUrl}/pages/${resolvedPageId}/translations/${langCode}`, {
				method: "PUT",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ title: translation.title, content: translation.content }),
			}).catch(() => null);

			if (!transRes?.ok) {
				const body = (await transRes?.json().catch(() => null)) as { error?: string } | null;
				errorMsg.value = body?.error ?? `Failed to save ${langCode} translation`;
				return false;
			}
		}

		return true;
	};

	const handleSaveDraft = async (): Promise<void> => {
		const trimmedSlug = slug.value.trim() || (isHomepage.value ? "/" : "");
		if (!trimmedSlug) {
			errorMsg.value = "Slug is required";
			return;
		}
		if (trimmedSlug === "/" && !isHomepage.value) {
			errorMsg.value = 'Slug "/" is reserved for the homepage';
			return;
		}

		saving.value = true;
		errorMsg.value = null;

		let resolvedPageId = pageId;

		if (!resolvedPageId) {
			const createRes = await fetch(`${apiUrl}/pages`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ slug: trimmedSlug, isHomepage: isHomepage.value }),
			}).catch(() => null);

			if (!createRes?.ok) {
				const body = (await createRes?.json().catch(() => null)) as { error?: string } | null;
				errorMsg.value = body?.error ?? "Failed to create page";
				saving.value = false;
				return;
			}

			const newPage = (await createRes.json()) as { id: string };
			resolvedPageId = newPage.id;
		} else {
			const updateRes = await fetch(`${apiUrl}/pages/${resolvedPageId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ slug: trimmedSlug, isHomepage: isHomepage.value }),
			}).catch(() => null);

			if (!updateRes?.ok) {
				const body = (await updateRes?.json().catch(() => null)) as { error?: string } | null;
				errorMsg.value = body?.error ?? "Failed to update page";
				saving.value = false;
				return;
			}
		}

		const ok = await saveTranslations(resolvedPageId);
		saving.value = false;

		if (ok) {
			if (status.value === "published" || status.value === "unpublished") {
				hasDraft.value = true;
			}
			window.location.href = "/pages";
		}
	};

	const handlePublish = async (): Promise<void> => {
		const trimmedSlug = slug.value.trim() || (isHomepage.value ? "/" : "");
		if (!trimmedSlug) {
			errorMsg.value = "Slug is required";
			return;
		}
		if (trimmedSlug === "/" && !isHomepage.value) {
			errorMsg.value = 'Slug "/" is reserved for the homepage';
			return;
		}

		saving.value = true;
		errorMsg.value = null;

		let resolvedPageId = pageId;

		if (!resolvedPageId) {
			const createRes = await fetch(`${apiUrl}/pages`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ slug: trimmedSlug, isHomepage: isHomepage.value }),
			}).catch(() => null);

			if (!createRes?.ok) {
				const body = (await createRes?.json().catch(() => null)) as { error?: string } | null;
				errorMsg.value = body?.error ?? "Failed to create page";
				saving.value = false;
				return;
			}

			const newPage = (await createRes.json()) as { id: string };
			resolvedPageId = newPage.id;
		} else {
			const updateRes = await fetch(`${apiUrl}/pages/${resolvedPageId}`, {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				credentials: "include",
				body: JSON.stringify({ slug: trimmedSlug, isHomepage: isHomepage.value }),
			}).catch(() => null);

			if (!updateRes?.ok) {
				const body = (await updateRes?.json().catch(() => null)) as { error?: string } | null;
				errorMsg.value = body?.error ?? "Failed to update page";
				saving.value = false;
				return;
			}
		}

		const translationsOk = await saveTranslations(resolvedPageId);
		if (!translationsOk) {
			saving.value = false;
			return;
		}

		const publishRes = await fetch(`${apiUrl}/pages/${resolvedPageId}/status`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({ status: "published" }),
		}).catch(() => null);

		if (!publishRes?.ok) {
			const body = (await publishRes?.json().catch(() => null)) as { error?: string } | null;
			errorMsg.value = body?.error ?? "Failed to publish page";
			saving.value = false;
			return;
		}

		saving.value = false;
		window.location.href = "/pages";
	};

	const handleDiscardDraft = async (): Promise<void> => {
		if (!pageId) return;

		saving.value = true;
		errorMsg.value = null;

		const res = await fetch(`${apiUrl}/pages/${pageId}/draft`, {
			method: "DELETE",
			credentials: "include",
		}).catch(() => null);

		saving.value = false;

		if (!res?.ok) {
			const body = (await res?.json().catch(() => null)) as { error?: string } | null;
			errorMsg.value = body?.error ?? "Failed to discard draft";
			return;
		}

		window.location.href = "/pages";
	};

	const handleToggleVisibility = async (): Promise<void> => {
		if (!pageId) return;

		saving.value = true;
		errorMsg.value = null;

		const newStatus = status.value === "published" ? "unpublished" : "published";
		const res = await fetch(`${apiUrl}/pages/${pageId}/status`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({ status: newStatus }),
		}).catch(() => null);

		saving.value = false;

		if (!res?.ok) {
			const body = (await res?.json().catch(() => null)) as { error?: string } | null;
			errorMsg.value = body?.error ?? "Failed to update visibility";
			return;
		}

		status.value = newStatus;
	};

	const handleDeletePage = async (): Promise<void> => {
		if (!pageId) return;

		saving.value = true;
		errorMsg.value = null;

		const res = await fetch(`${apiUrl}/pages/${pageId}`, {
			method: "DELETE",
			credentials: "include",
		}).catch(() => null);

		saving.value = false;

		if (!res?.ok) {
			const body = (await res?.json().catch(() => null)) as { error?: string } | null;
			errorMsg.value = body?.error ?? "Failed to delete page";
			showDeleteConfirm.value = false;
			return;
		}

		window.location.href = "/pages";
	};

	const activeLangLabel =
		languages.find((lang) => lang.code === activeLang.value)?.label ?? activeLang.value.toUpperCase();

	if (languages.length === 0) {
		return (
			<div class="py-16 px-6 text-center text-text2 text-[11px]">
				No active languages.{" "}
				<a href="/languages" class="text-accent no-underline hover:underline">
					Add a language
				</a>{" "}
				first.
			</div>
		);
	}

	return (
		<div class="flex flex-col h-full">
			{/* ── Topbar ────────────────────────────────────── */}
			<div class="h-11 bg-bg0 border-b border-ui-border flex items-center px-3 gap-1.5 shrink-0">
				<a
					href="/pages"
					class="flex items-center gap-1 text-[11px] text-text1 hover:text-text0 transition-colors no-underline px-1.5 py-1 rounded hover:bg-bg3"
				>
					← Back
				</a>
				<span class="text-[11px] text-text2">/</span>
				<span class="text-[11px] text-text0 font-mono">{slug.value || "new"}</span>
				<div class="flex-1" />
				{status.value === "published" ? (
					<span class="inline-flex items-center gap-1.5 text-[11px] text-green bg-green-faint px-2.5 py-1 rounded">
						<span class="w-1.5 h-1.5 rounded-full bg-green shrink-0" />
						Published{hasDraft.value ? " · draft pending" : ""}
					</span>
				) : status.value === "unpublished" ? (
					<span class="inline-flex items-center gap-1.5 text-[11px] text-text2 bg-bg3 px-2.5 py-1 rounded">
						<span class="w-1.5 h-1.5 rounded-full bg-text2 shrink-0" />
						Unpublished
					</span>
				) : (
					<span class="inline-flex items-center gap-1.5 text-[11px] text-amber bg-amber-faint px-2.5 py-1 rounded">
						<span class="w-1.5 h-1.5 rounded-full bg-amber shrink-0" />
						Draft
					</span>
				)}
			</div>

			{/* ── Body ──────────────────────────────────────── */}
			<div class="flex-1 flex overflow-hidden">
				{/* ── Editor column ─────────────────────────── */}
				<div class="flex-1 flex flex-col overflow-hidden border-r border-ui-border">
					{/* Toolbar */}
					<div class="flex items-center gap-0.5 px-2.5 py-1.5 border-b border-ui-border bg-bg0 shrink-0 overflow-x-auto">
						{/* editorTick.value read here so Preact re-renders toolbar on cursor move */}
						{editorTick.value >= 0 && (
							<>
								<ToolbarBtn
									onClick={() => editor?.chain().focus().toggleBold().run()}
									active={!!editor?.isActive("bold")}
								>
									B
								</ToolbarBtn>
								<ToolbarBtn
									onClick={() => editor?.chain().focus().toggleItalic().run()}
									active={!!editor?.isActive("italic")}
									italic
								>
									I
								</ToolbarBtn>
								<ToolbarBtn
									onClick={() => editor?.chain().focus().toggleStrike().run()}
									active={!!editor?.isActive("strike")}
								>
									S
								</ToolbarBtn>
								<ToolbarBtn
									onClick={() => editor?.chain().focus().toggleCode().run()}
									active={!!editor?.isActive("code")}
								>
									{"<>"}
								</ToolbarBtn>
								<div class="w-px h-4 bg-ui-border mx-1 shrink-0" />
								<ToolbarBtn
									onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
									active={!!editor?.isActive("heading", { level: 1 })}
								>
									H1
								</ToolbarBtn>
								<ToolbarBtn
									onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
									active={!!editor?.isActive("heading", { level: 2 })}
								>
									H2
								</ToolbarBtn>
								<div class="w-px h-4 bg-ui-border mx-1 shrink-0" />
								<ToolbarBtn
									onClick={() => editor?.chain().focus().toggleBulletList().run()}
									active={!!editor?.isActive("bulletList")}
								>
									•
								</ToolbarBtn>
								<ToolbarBtn
									onClick={() => editor?.chain().focus().toggleOrderedList().run()}
									active={!!editor?.isActive("orderedList")}
								>
									≡
								</ToolbarBtn>
							</>
						)}
					</div>

					{/* Content area */}
					<div class="flex-1 overflow-y-auto bg-bg1" style={{ padding: "28px 48px" }}>
						<div style={{ maxWidth: 640, margin: "0 auto" }}>
							<input
								type="text"
								value={activeTitle.value}
								onInput={(event) => {
									activeTitle.value = (event.target as HTMLInputElement).value;
								}}
								placeholder="Page title…"
								style={{
									fontFamily: "Instrument Serif, serif",
									fontStyle: "italic",
									fontSize: 28,
									color: "var(--text0)",
									background: "transparent",
									border: "none",
									outline: "none",
									width: "100%",
									marginBottom: 20,
									lineHeight: 1.3,
								}}
							/>
							<EditorContent
								editor={editor}
								className="[&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-48 [&_.ProseMirror]:text-[13px] [&_.ProseMirror]:text-text1 [&_.ProseMirror]:leading-relaxed [&_.ProseMirror_h1]:text-xl [&_.ProseMirror_h1]:font-semibold [&_.ProseMirror_h1]:text-text0 [&_.ProseMirror_h1]:mb-3 [&_.ProseMirror_h2]:text-base [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h2]:text-text0 [&_.ProseMirror_h2]:mb-2 [&_.ProseMirror_p]:mb-3 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5 [&_.ProseMirror_ul]:mb-3 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5 [&_.ProseMirror_ol]:mb-3 [&_.ProseMirror_code]:bg-bg3 [&_.ProseMirror_code]:rounded [&_.ProseMirror_code]:px-1 [&_.ProseMirror_code]:text-[11px] [&_.ProseMirror_code]:font-mono [&_.ProseMirror_strong]:font-semibold [&_.ProseMirror_em]:italic [&_.ProseMirror_s]:line-through"
							/>
						</div>
					</div>

					{/* Footer */}
					<div class="py-1.5 px-3.5 border-t border-ui-border text-[10px] text-text2 bg-bg0 shrink-0">
						{pageId ? "Last saved" : "Not saved yet"}
					</div>
				</div>

				{/* ── Right sidebar ─────────────────────────── */}
				<div class="w-80 shrink-0 bg-bg0 p-3.5 overflow-y-auto flex flex-col gap-3">
					{/* Version status card */}
					<div class="bg-bg2 border border-ui-border rounded-md p-3">
						<div class="text-[11px] text-text0 mb-2.5">Version status</div>

						{/* Published/Unpublished toggle — only for pages that have ever been published */}
						{pageId && status.value !== "draft" && (
							<div class="flex items-center justify-between mb-2.5">
								<span class="text-[10px] text-text1">{status.value === "published" ? "Published" : "Unpublished"}</span>
								<Toggle
									value={status.value === "published"}
									onChange={handleToggleVisibility}
									disabled={saving.value}
								/>
							</div>
						)}

						{/* Draft pending banner */}
						{pageId && hasDraft.value && (status.value === "published" || status.value === "unpublished") && (
							<div class="bg-amber-faint border border-amber/20 rounded px-2 py-1.5 mb-2.5">
								<div class="text-[10px] text-amber font-medium mb-1.5">Draft pending</div>
								<div class="flex gap-1">
									<button
										type="button"
										onClick={handlePublish}
										disabled={saving.value}
										class="flex-1 text-center text-[10px] bg-accent text-white border-none rounded py-1 cursor-pointer hover:bg-accent-hover transition-colors disabled:opacity-40"
									>
										{saving.value ? "…" : "Publish draft"}
									</button>
									<button
										type="button"
										onClick={handleDiscardDraft}
										disabled={saving.value}
										class="flex-1 text-center text-[10px] bg-bg3 border border-ui-border text-text1 rounded py-1 cursor-pointer hover:border-ui-border-hover transition-colors disabled:opacity-40"
									>
										Discard
									</button>
								</div>
							</div>
						)}

						{!pageId && <div class="text-[10px] text-text1 mb-2.5">Not published yet</div>}

						{errorMsg.value && (
							<p class="text-[10px] text-coral bg-coral/10 border border-coral/20 rounded px-2 py-1.5 mb-2">
								{errorMsg.value}
							</p>
						)}

						{/* Save draft / Publish — shown when page is new or has no pending draft */}
						{(!pageId || status.value === "draft" || !hasDraft.value) && (
							<div class="flex gap-1.5">
								<button
									type="button"
									onClick={handleSaveDraft}
									disabled={saving.value}
									class="flex-1 text-center text-[11px] bg-bg3 border border-ui-border text-text0 rounded py-1.5 cursor-pointer hover:border-ui-border-hover transition-colors disabled:opacity-40"
								>
									Save draft
								</button>
								<button
									type="button"
									onClick={handlePublish}
									disabled={saving.value}
									class="flex-1 text-center text-[11px] bg-accent text-white border-none rounded py-1.5 cursor-pointer hover:bg-accent-hover transition-colors disabled:opacity-40"
								>
									{saving.value ? "…" : "Publish ↑"}
								</button>
							</div>
						)}
					</div>

					{/* Page meta card */}
					<div class="bg-bg2 border border-ui-border rounded-md p-3">
						<div class="text-[11px] text-text0 mb-2.5">Page meta</div>
						<label class="flex items-center gap-2.5 cursor-pointer select-none mb-2.5">
							<input
								type="checkbox"
								checked={isHomepage.value}
								onChange={(event) => {
									isHomepage.value = (event.target as HTMLInputElement).checked;
									if ((event.target as HTMLInputElement).checked) {
										slug.value = "/";
									}
								}}
								class="w-4 h-4 accent-accent cursor-pointer"
							/>
							<span class="text-[11px] text-text1">Set as homepage</span>
						</label>
						<div class="text-[10px] text-text2 mb-1">Slug</div>
						<input
							type="text"
							value={isHomepage.value ? "/" : slug.value}
							onInput={(event) => {
								slug.value = (event.target as HTMLInputElement).value;
							}}
							placeholder="/about"
							disabled={isHomepage.value}
							class={`w-full bg-bg1 border border-ui-border rounded text-[11px] text-text0 px-2 py-1.5 outline-none focus:border-ui-border-hover transition-colors mb-2.5 ${isHomepage.value ? "opacity-40 cursor-not-allowed" : ""}`}
						/>
						<div class="text-[10px] text-text2 mb-1">SEO title</div>
						<input
							type="text"
							value={seoTitle.value}
							onInput={(event) => {
								seoTitle.value = (event.target as HTMLInputElement).value;
							}}
							placeholder="Page title — My Website"
							class="w-full bg-bg1 border border-ui-border rounded text-[11px] text-text0 px-2 py-1.5 outline-none focus:border-ui-border-hover transition-colors"
						/>
					</div>

					{/* Language card */}
					<div class="bg-bg2 border border-ui-border rounded-md p-3">
						<div class="text-[11px] text-text0 mb-2.5">Language</div>
						<div class="flex gap-1 flex-wrap mb-1.5">
							{languages.map((lang) => (
								<button
									key={lang.code}
									type="button"
									onClick={() => switchLang(lang.code)}
									class={`flex-1 py-1 text-[10px] rounded border cursor-pointer transition-all ${
										activeLang.value === lang.code
											? "bg-accent border-accent text-white"
											: "bg-bg4 border-ui-border text-text1 hover:border-ui-border-hover"
									}`}
								>
									{lang.code.toUpperCase()}
								</button>
							))}
						</div>
						<div class="text-[9px] text-text2">Editing: {activeLangLabel} variant</div>
					</div>

					{/* Danger zone card — only for existing pages */}
					{pageId && (
						<div class="bg-bg2 border border-coral/30 rounded-md p-3">
							<div class="text-[11px] text-coral mb-2.5">Danger zone</div>
							{showDeleteConfirm.value ? (
								<>
									<p class="text-[10px] text-text1 mb-2">
										This will permanently delete the page and all its translations. This action cannot be undone.
									</p>
									<div class="flex gap-1">
										<button
											type="button"
											onClick={handleDeletePage}
											disabled={saving.value}
											class="flex-1 text-center text-[10px] bg-coral text-white border-none rounded py-1 cursor-pointer hover:opacity-80 transition-opacity disabled:opacity-40"
										>
											{saving.value ? "Deleting…" : "Yes, delete"}
										</button>
										<button
											type="button"
											onClick={() => {
												showDeleteConfirm.value = false;
											}}
											disabled={saving.value}
											class="flex-1 text-center text-[10px] bg-bg3 border border-ui-border text-text1 rounded py-1 cursor-pointer hover:border-ui-border-hover transition-colors disabled:opacity-40"
										>
											Cancel
										</button>
									</div>
								</>
							) : (
								<button
									type="button"
									onClick={() => {
										showDeleteConfirm.value = true;
									}}
									class="w-full text-center text-[10px] border border-coral/40 text-coral rounded py-1.5 cursor-pointer hover:bg-coral/10 transition-colors"
								>
									Delete page
								</button>
							)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
}

// ── Internal helpers ──────────────────────────────────

interface ToolbarBtnProps {
	children: ComponentChildren;
	onClick: () => void;
	active: boolean;
	italic?: boolean;
}

const ToolbarBtn = ({ children, onClick, active, italic = false }: ToolbarBtnProps): JSX.Element => (
	<button
		type="button"
		onClick={onClick}
		class={`px-1.5 py-1 text-[11px] font-mono rounded transition-colors shrink-0 ${
			active ? "bg-bg3 text-text0" : "text-text2 hover:bg-bg2 hover:text-text1"
		} ${italic ? "italic" : ""}`}
	>
		{children}
	</button>
);
