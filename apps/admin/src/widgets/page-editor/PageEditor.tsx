import { useSignal } from "@preact/signals";
import { Button } from "@repo/ui/Button";
import { Input } from "@repo/ui/Input";
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
		const trimmedSlug = slug.value.trim();
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

	if (languages.length === 0) {
		return (
			<div class="py-16 px-6 text-center text-text2 text-sm">
				No active languages.{" "}
				<a href="/languages" class="text-accent no-underline hover:underline">
					Add a language
				</a>{" "}
				first.
			</div>
		);
	}

	return (
		<div class="flex h-full overflow-hidden">
			{/* ── Editor column ─────────────────────────────── */}
			<div class="flex-1 flex flex-col overflow-hidden min-w-0 border-r border-ui-border">
				{/* Language tabs */}
				<div class="flex gap-1 px-4 pt-3 border-b border-ui-border bg-bg0 shrink-0">
					{languages.map((lang) => (
						<button
							key={lang.code}
							type="button"
							onClick={() => switchLang(lang.code)}
							class={`px-3 py-1.5 text-[11px] rounded-t border border-b-0 transition-colors ${
								activeLang.value === lang.code
									? "bg-bg1 border-ui-border text-text0"
									: "border-transparent text-text2 hover:text-text1"
							}`}
						>
							{lang.code.toUpperCase()}
						</button>
					))}
				</div>

				{/* Title */}
				<div class="px-12 pt-8 pb-2 shrink-0 bg-bg1">
					<input
						type="text"
						value={activeTitle.value}
						onInput={(event) => {
							activeTitle.value = (event.target as HTMLInputElement).value;
						}}
						placeholder="Page title…"
						class="w-full bg-transparent border-none outline-none text-2xl font-medium text-text0 placeholder:text-text3"
					/>
				</div>

				{/* Toolbar */}
				<div class="flex items-center gap-0.5 px-3 py-1.5 border-y border-ui-border bg-bg0 shrink-0 overflow-x-auto">
					<ToolbarButton onClick={() => editor?.chain().focus().toggleBold().run()} active={!!editor?.isActive("bold")}>
						B
					</ToolbarButton>
					<ToolbarButton
						onClick={() => editor?.chain().focus().toggleItalic().run()}
						active={!!editor?.isActive("italic")}
						italic
					>
						I
					</ToolbarButton>
					<ToolbarButton
						onClick={() => editor?.chain().focus().toggleStrike().run()}
						active={!!editor?.isActive("strike")}
					>
						S
					</ToolbarButton>
					<ToolbarButton onClick={() => editor?.chain().focus().toggleCode().run()} active={!!editor?.isActive("code")}>
						{"</>"}
					</ToolbarButton>
					<div class="w-px h-4 bg-ui-border mx-1 shrink-0" />
					<ToolbarButton
						onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
						active={!!editor?.isActive("heading", { level: 1 })}
					>
						H1
					</ToolbarButton>
					<ToolbarButton
						onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
						active={!!editor?.isActive("heading", { level: 2 })}
					>
						H2
					</ToolbarButton>
					<div class="w-px h-4 bg-ui-border mx-1 shrink-0" />
					<ToolbarButton
						onClick={() => editor?.chain().focus().toggleBulletList().run()}
						active={!!editor?.isActive("bulletList")}
					>
						•
					</ToolbarButton>
					<ToolbarButton
						onClick={() => editor?.chain().focus().toggleOrderedList().run()}
						active={!!editor?.isActive("orderedList")}
					>
						≡
					</ToolbarButton>
				</div>

				{/* Editor content */}
				<div class="flex-1 overflow-y-auto px-12 py-8 bg-bg1">
					<div class="max-w-2xl mx-auto">
						<EditorContent
							editor={editor}
							className="[&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-48 [&_.ProseMirror]:text-sm [&_.ProseMirror]:text-text1 [&_.ProseMirror]:leading-relaxed [&_.ProseMirror_h1]:text-xl [&_.ProseMirror_h1]:font-semibold [&_.ProseMirror_h1]:text-text0 [&_.ProseMirror_h1]:mb-3 [&_.ProseMirror_h2]:text-base [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h2]:text-text0 [&_.ProseMirror_h2]:mb-2 [&_.ProseMirror_p]:mb-3 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5 [&_.ProseMirror_ul]:mb-3 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5 [&_.ProseMirror_ol]:mb-3 [&_.ProseMirror_code]:bg-bg3 [&_.ProseMirror_code]:rounded [&_.ProseMirror_code]:px-1 [&_.ProseMirror_code]:text-[11px] [&_.ProseMirror_code]:font-mono [&_.ProseMirror_strong]:font-semibold [&_.ProseMirror_em]:italic [&_.ProseMirror_s]:line-through"
						/>
					</div>
				</div>
			</div>

			{/* ── Sidebar ───────────────────────────────────── */}
			<div class="w-52 shrink-0 flex flex-col gap-3 bg-bg0 p-3.5 overflow-y-auto">
				{/* Save actions */}
				<div class="flex flex-col gap-2">
					{errorMsg.value && (
						<p class="text-[10px] text-coral bg-coral/10 border border-coral/20 rounded px-2 py-1.5">
							{errorMsg.value}
						</p>
					)}
					<Button size="sm" variant="primary" loading={saving.value} onClick={handleSave} class="w-full justify-center">
						{pageId ? "Save changes" : "Create page"}
					</Button>
					<a
						href="/pages"
						class="flex items-center justify-center w-full h-8 border border-ui-border rounded text-[11px] text-text1 no-underline hover:border-ui-border-hover transition-colors"
					>
						Cancel
					</a>
				</div>

				{/* Page settings */}
				<div class="bg-bg2 border border-ui-border rounded-md p-3">
					<div class="text-[11px] text-text0 font-medium mb-2.5">Page settings</div>
					<Input
						label="Slug"
						value={slug.value}
						onInput={(event) => {
							slug.value = (event.target as HTMLInputElement).value;
						}}
						placeholder="about"
					/>
					<label class="flex items-center gap-2 mt-2.5 cursor-pointer select-none">
						<input
							type="checkbox"
							checked={isHomepage.value}
							onChange={(event) => {
								isHomepage.value = (event.target as HTMLInputElement).checked;
							}}
							class="checkbox checkbox-xs"
						/>
						<span class="text-[11px] text-text1">Homepage</span>
					</label>
				</div>
			</div>
		</div>
	);
}

// ── Internal helpers ──────────────────────────────────

interface ToolbarButtonProps {
	children: ComponentChildren;
	onClick: () => void;
	active: boolean;
	italic?: boolean;
}

const ToolbarButton = ({ children, onClick, active, italic = false }: ToolbarButtonProps): JSX.Element => (
	<button
		type="button"
		onClick={onClick}
		class={`px-2 py-1 text-[11px] font-mono rounded transition-colors shrink-0 ${
			active ? "bg-bg3 text-text0" : "text-text2 hover:bg-bg2 hover:text-text1"
		} ${italic ? "italic" : ""}`}
	>
		{children}
	</button>
);
