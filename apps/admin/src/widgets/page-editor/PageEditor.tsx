import { useSignal } from "@preact/signals";
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
	content: Record<string, unknown> | null;
}

interface TranslationEntry {
	title: string;
	content: JSONContent | null;
}

interface PageEditorProps {
	pageId?: string;
	initialSlug?: string;
	initialIsHomepage?: boolean;
	initialTranslations?: PageTranslationData[];
	languages: PageLanguage[];
	apiUrl: string;
}

export function PageEditor({
	pageId,
	initialSlug = "",
	initialIsHomepage = false,
	initialTranslations = [],
	languages,
	apiUrl,
}: PageEditorProps): JSX.Element {
	const activeLang = useSignal(languages[0]?.code ?? "");
	const slug = useSignal(initialSlug);
	const isHomepage = useSignal(initialIsHomepage);
	const seoTitle = useSignal("");
	const saving = useSignal(false);
	const errorMsg = useSignal<string | null>(null);
	const skipNextUpdate = useRef(false);

	const savedTranslations = useSignal<Record<string, TranslationEntry>>(
		Object.fromEntries(
			languages.map((lang) => {
				const found = initialTranslations.find((t) => t.languageCode === lang.code);
				return [lang.code, { title: found?.title ?? "", content: (found?.content ?? null) as JSONContent | null }];
			}),
		),
	);

	const activeTitle = useSignal(savedTranslations.value[activeLang.value]?.title ?? "");

	const editor = useEditor({
		extensions: [StarterKit],
		content: savedTranslations.value[activeLang.value]?.content ?? "",
		onUpdate({ editor: e }) {
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

	const handleSave = async (): Promise<void> => {
		const trimmedSlug = slug.value.trim() || (isHomepage.value ? "/" : "");
		if (!trimmedSlug) {
			errorMsg.value = "Slug is required";
			return;
		}

		saving.value = true;
		errorMsg.value = null;

		const allTranslations: Record<string, TranslationEntry> = {
			...savedTranslations.value,
			[activeLang.value]: {
				title: activeTitle.value,
				content: editor?.getJSON() ?? savedTranslations.value[activeLang.value]?.content ?? null,
			},
		};

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
				saving.value = false;
				return;
			}
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
				<span class="inline-flex items-center gap-1.5 text-[11px] text-amber bg-amber-faint px-2.5 py-1 rounded">
					<span class="w-1.5 h-1.5 rounded-full bg-amber shrink-0" />
					Draft
				</span>
			</div>

			{/* ── Body ──────────────────────────────────────── */}
			<div class="flex-1 flex overflow-hidden">
				{/* ── Editor column ─────────────────────────── */}
				<div class="flex-1 flex flex-col overflow-hidden border-r border-ui-border">
					{/* Toolbar */}
					<div class="flex items-center gap-0.5 px-2.5 py-1.5 border-b border-ui-border bg-bg0 shrink-0 overflow-x-auto">
						<ToolbarBtn onClick={() => editor?.chain().focus().toggleBold().run()} active={!!editor?.isActive("bold")}>
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
						<ToolbarBtn onClick={() => editor?.chain().focus().toggleCode().run()} active={!!editor?.isActive("code")}>
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
				<div class="w-55 shrink-0 bg-bg0 p-3.5 overflow-y-auto flex flex-col gap-3">
					{/* Version status card */}
					<div class="bg-bg2 border border-ui-border rounded-md p-3">
						<div class="text-[11px] text-text0 mb-2.5">Version status</div>
						{!pageId && <div class="text-[10px] text-text1 mb-2.5">Not published yet</div>}
						{errorMsg.value && (
							<p class="text-[10px] text-coral bg-coral/10 border border-coral/20 rounded px-2 py-1.5 mb-2">
								{errorMsg.value}
							</p>
						)}
						<div class="flex gap-1.5">
							<button
								type="button"
								onClick={handleSave}
								disabled={saving.value}
								class="flex-1 text-center text-[11px] bg-bg3 border border-ui-border text-text0 rounded py-1.5 cursor-pointer hover:border-ui-border-hover transition-colors disabled:opacity-40"
							>
								Save draft
							</button>
							<button
								type="button"
								onClick={handleSave}
								disabled={saving.value}
								class="flex-1 text-center text-[11px] bg-accent text-white border-none rounded py-1.5 cursor-pointer hover:bg-accent-hover transition-colors disabled:opacity-40"
							>
								{saving.value ? "…" : "Publish ↑"}
							</button>
						</div>
					</div>

					{/* Page meta card */}
					<div class="bg-bg2 border border-ui-border rounded-md p-3">
						<div class="text-[11px] text-text0 mb-2.5">Page meta</div>
						<div class="flex items-center justify-between mb-1">
							<div class="text-[10px] text-text2">Slug</div>
							<label class="flex items-center gap-1 cursor-pointer">
								<input
									type="checkbox"
									checked={isHomepage.value}
									onChange={(event) => {
										isHomepage.value = (event.target as HTMLInputElement).checked;
									}}
									class="w-2.5 h-2.5 accent-accent"
								/>
								<span class="text-[10px] text-text2">Homepage</span>
							</label>
						</div>
						<input
							type="text"
							value={slug.value}
							onInput={(event) => {
								slug.value = (event.target as HTMLInputElement).value;
							}}
							placeholder={isHomepage.value && !slug.value ? "/ (auto)" : "/about"}
							disabled={isHomepage.value && !slug.value}
							class={`w-full bg-bg1 border border-ui-border rounded text-[11px] text-text0 px-2 py-1.5 outline-none focus:border-ui-border-hover transition-colors mb-2.5 ${isHomepage.value && !slug.value ? "opacity-40 cursor-not-allowed" : ""}`}
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
