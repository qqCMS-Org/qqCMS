// @ts-nocheck -- Novel v1 uses TipTap v2 types; admin uses TipTap v3. Runtime is compatible, types are not.
import { useSignal } from "@preact/signals";
import { Toggle } from "@repo/ui/Toggle";
import { api, extractApiError } from "@shared/api/client";
import { Modal } from "@shared/modal";
import { toast } from "@shared/toast";
import type { JSONContent } from "@tiptap/core";
import {
	EditorCommand,
	EditorCommandEmpty,
	EditorCommandItem,
	EditorCommandList,
	EditorContent,
	EditorRoot,
	handleCommandNavigation,
	StarterKit,
} from "novel";
import type { JSX } from "preact";
import { slashCommand, suggestionItems } from "./slashCommands";
import { useUnsavedChanges } from "./useUnsavedChanges";

function slugify(text: string): string {
	const cyrillicToLatin: Record<string, string> = {
		а: "a",
		б: "b",
		в: "v",
		г: "g",
		д: "d",
		е: "e",
		ё: "yo",
		ж: "zh",
		з: "z",
		и: "i",
		й: "j",
		к: "k",
		л: "l",
		м: "m",
		н: "n",
		о: "o",
		п: "p",
		р: "r",
		с: "s",
		т: "t",
		у: "u",
		ф: "f",
		х: "h",
		ц: "c",
		ч: "ch",
		ш: "sh",
		щ: "shch",
		ъ: "",
		ы: "y",
		ь: "",
		э: "e",
		ю: "yu",
		я: "ya",
	};

	return text
		.toLowerCase()
		.split("")
		.map((char) => cyrillicToLatin[char] ?? char)
		.join("")
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

export interface PageLanguage {
	id: string;
	code: string;
	label: string;
	isActive: boolean;
	isDefault: boolean;
}
// ... (omitting some interfaces for brevity, will use full block in tool call)

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
	initialHideTitle?: boolean;
	initialStatus?: "draft" | "published" | "unpublished";
	initialHasDraft?: boolean;
	initialTranslations?: PageTranslationData[];
	languages: PageLanguage[];
	hasExistingHomepage?: boolean;
}

export function PageEditor({
	pageId,
	initialSlug = "",
	initialIsHomepage = false,
	initialHideTitle = false,
	initialStatus = "draft",
	initialHasDraft = true,
	initialTranslations = [],
	languages,
	hasExistingHomepage = false,
}: PageEditorProps): JSX.Element {
	const defaultLang = languages.find((lang) => lang.isDefault) ?? languages[0];
	const activeLang = useSignal(defaultLang?.code ?? "");
	const slug = useSignal(initialSlug);
	const slugManuallyEdited = useSignal(false);
	const isHomepage = useSignal(initialIsHomepage);
	const hideTitle = useSignal(initialHideTitle);
	const status = useSignal<"draft" | "published" | "unpublished">(initialStatus);
	const hasDraft = useSignal(initialHasDraft);
	const saving = useSignal(false);
	const errorMsg = useSignal<string | null>(null);
	const showDeleteConfirm = useSignal(false);
	const sidebarOpen = useSignal(false);
	const { markDirty, resetDirty, navigateTo, confirmNavigation, modal } = useUnsavedChanges();

	const savedTranslations = useSignal<Record<string, TranslationEntry>>(
		Object.fromEntries(
			languages.map((lang) => {
				const found = initialTranslations.find((translation) => translation.languageCode === lang.code);
				return [lang.code, { title: found?.title ?? "", content: found?.content ?? null }];
			}),
		),
	);

	const activeTitle = useSignal(savedTranslations.value[activeLang.value]?.title ?? "");

	const switchLang = (code: string): void => {
		activeLang.value = code;
		activeTitle.value = savedTranslations.value[code]?.title ?? "";
	};

	const saveTranslations = async (resolvedPageId: string): Promise<boolean> => {
		for (const [langCode, translation] of Object.entries(savedTranslations.value)) {
			const initial = initialTranslations.find((t) => t.languageCode === langCode);
			if (!translation.title.trim() && !initial) continue;

			const { error } = await api
				.pages({ id: resolvedPageId })
				.translations({ lang: langCode })
				.put({
					title: translation.title,
					content: translation.content ?? undefined,
				});

			if (error) {
				errorMsg.value = extractApiError(error) ?? `Failed to save ${langCode} translation`;
				return false;
			}
		}

		return true;
	};

	const upsertPage = async (pageIdArg: string | undefined): Promise<string | null> => {
		const trimmedSlug = slug.value.trim() || (isHomepage.value ? "/" : "");
		if (!trimmedSlug) {
			errorMsg.value = "Slug is required";
			return null;
		}
		if (trimmedSlug === "/" && !isHomepage.value) {
			errorMsg.value = 'Slug "/" is reserved for the homepage';
			return null;
		}

		if (!pageIdArg) {
			const { data: newPage, error: createError } = await api.pages.post({
				slug: trimmedSlug,
				isHomepage: isHomepage.value,
			});

			if (createError || !newPage) {
				errorMsg.value = createError
					? (extractApiError(createError) ?? "Failed to create page")
					: "Failed to create page";
				return null;
			}

			return newPage.id;
		}

		const { error: updateError } = await api.pages({ id: pageIdArg }).patch({
			slug: trimmedSlug,
			isHomepage: isHomepage.value,
			hideTitle: hideTitle.value,
		});

		if (updateError) {
			errorMsg.value = extractApiError(updateError) ?? "Failed to update page";
			return null;
		}

		return pageIdArg;
	};

	const defaultLangCode = (languages.find((lang) => lang.isDefault) ?? languages[0])?.code;

	const validateDefaultLangTitle = (): boolean => {
		if (!defaultLangCode || savedTranslations.value[defaultLangCode]?.title.trim()) return true;
		errorMsg.value = `Title in the default language (${defaultLangCode.toUpperCase()}) is required`;
		activeLang.value = defaultLangCode;
		activeTitle.value = savedTranslations.value[defaultLangCode]?.title ?? "";
		return false;
	};

	const handleSaveDraft = async (): Promise<void> => {
		if (!validateDefaultLangTitle()) return;
		saving.value = true;
		errorMsg.value = null;

		const resolvedPageId = await upsertPage(pageId);
		if (!resolvedPageId) {
			saving.value = false;
			return;
		}

		const ok = await saveTranslations(resolvedPageId);
		saving.value = false;

		if (ok) {
			resetDirty();
			window.location.href = "/pages";
		}
	};

	const handlePublish = async (): Promise<void> => {
		if (!validateDefaultLangTitle()) return;
		saving.value = true;
		errorMsg.value = null;

		const resolvedPageId = await upsertPage(pageId);
		if (!resolvedPageId) {
			saving.value = false;
			return;
		}

		const translationsOk = await saveTranslations(resolvedPageId);
		if (!translationsOk) {
			saving.value = false;
			return;
		}

		const { error: publishError } = await api.pages({ id: resolvedPageId }).status.patch({ status: "published" });

		if (publishError) {
			errorMsg.value = extractApiError(publishError) ?? "Failed to publish";
			saving.value = false;
			return;
		}

		resetDirty();
		saving.value = false;
		window.location.href = "/pages";
	};

	const handleToggleVisibility = async (): Promise<void> => {
		if (!pageId || status.value === "draft") return;
		const newStatus = status.value === "published" ? "unpublished" : "published";

		const { error: visibilityError } = await api.pages({ id: pageId }).status.patch({ status: newStatus });

		if (visibilityError) {
			errorMsg.value = extractApiError(visibilityError) ?? "Failed to update visibility";
			return;
		}

		status.value = newStatus;
	};

	const handleDiscardDraft = async (): Promise<void> => {
		if (!pageId) return;
		saving.value = true;

		const { error } = await api.pages({ id: pageId }).draft.delete();

		saving.value = false;
		if (error) {
			errorMsg.value = extractApiError(error) ?? "Failed to discard draft";
			return;
		}

		hasDraft.value = false;
		resetDirty();
		window.location.reload();
	};

	const handleDeletePage = async (): Promise<void> => {
		if (!pageId) return;
		saving.value = true;
		errorMsg.value = null;

		const { error: deleteError } = await api.pages({ id: pageId }).delete();

		saving.value = false;

		if (deleteError) {
			errorMsg.value = extractApiError(deleteError) ?? "Failed to delete page";
			showDeleteConfirm.value = false;
			return;
		}

		resetDirty();
		window.location.href = "/pages";
	};

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

	const editorContentClass =
		"outline-none [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[60vh] [&_.ProseMirror]:text-[14px] [&_.ProseMirror]:text-text1 [&_.ProseMirror]:leading-relaxed [&_.ProseMirror_h1]:text-3xl [&_.ProseMirror_h1]:font-bold [&_.ProseMirror_h1]:text-text0 [&_.ProseMirror_h1]:mt-8 [&_.ProseMirror_h1]:mb-3 [&_.ProseMirror_h2]:text-xl [&_.ProseMirror_h2]:font-semibold [&_.ProseMirror_h2]:text-text0 [&_.ProseMirror_h2]:mt-6 [&_.ProseMirror_h2]:mb-2 [&_.ProseMirror_h3]:text-base [&_.ProseMirror_h3]:font-semibold [&_.ProseMirror_h3]:text-text0 [&_.ProseMirror_h3]:mt-4 [&_.ProseMirror_h3]:mb-1 [&_.ProseMirror_p]:mb-3 [&_.ProseMirror_ul]:list-disc [&_.ProseMirror_ul]:pl-5 [&_.ProseMirror_ul]:mb-3 [&_.ProseMirror_ol]:list-decimal [&_.ProseMirror_ol]:pl-5 [&_.ProseMirror_ol]:mb-3 [&_.ProseMirror_blockquote]:border-l-2 [&_.ProseMirror_blockquote]:border-ui-border [&_.ProseMirror_blockquote]:pl-4 [&_.ProseMirror_blockquote]:italic [&_.ProseMirror_blockquote]:text-text2 [&_.ProseMirror_pre]:bg-bg3 [&_.ProseMirror_pre]:rounded [&_.ProseMirror_pre]:p-3 [&_.ProseMirror_pre]:text-[12px] [&_.ProseMirror_pre]:font-mono [&_.ProseMirror_code]:bg-bg3 [&_.ProseMirror_code]:rounded [&_.ProseMirror_code]:px-1 [&_.ProseMirror_code]:text-[12px] [&_.ProseMirror_code]:font-mono [&_.ProseMirror_strong]:font-semibold [&_.ProseMirror_em]:italic [&_.ProseMirror_s]:line-through [&_.ProseMirror_hr]:border-ui-border [&_.ProseMirror_hr]:my-4";

	return (
		<div class="flex flex-col h-screen">
			{/* ── Topbar ──────────────────────────────────────── */}
			<div class="h-11 bg-bg0 border-b border-ui-border flex items-center px-3 gap-1.5 shrink-0 z-10 min-w-0">
				<button
					type="button"
					onClick={() => navigateTo("/pages")}
					class="flex items-center gap-1 text-[11px] text-text1 hover:text-text0 transition-colors bg-transparent border-none cursor-pointer px-1.5 py-1 rounded hover:bg-bg3 shrink-0"
				>
					← Back
				</button>
				<span class="text-[11px] text-text2 shrink-0">/</span>
				<span class="text-[11px] text-text0 font-mono truncate min-w-0">{slug.value || "new"}</span>

				<div class="flex-1 shrink-0 min-w-2" />

				{status.value === "published" ? (
					<span class="inline-flex items-center gap-1.5 text-[11px] text-green bg-green-faint px-2.5 py-1 rounded">
						<span class="w-1.5 h-1.5 rounded-full bg-green shrink-0" />
						Published
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

			{/* ── Body ──────────────────────────────────────────── */}
			<div class="flex-1 flex overflow-hidden">
				{sidebarOpen.value && (
					<button
						type="button"
						aria-label="Close settings"
						class="fixed inset-0 z-40 bg-black/50 min-[841px]:hidden cursor-default border-none p-0"
						onClick={() => {
							sidebarOpen.value = false;
						}}
					/>
				)}
				{/* ── Editor ──────────────────────────────────── */}
				<div class="flex-1 flex flex-col overflow-hidden bg-bg1">
					<div class="flex-1 flex flex-col overflow-y-auto">
						<div class="max-w-[720px] mx-auto w-full px-6 pt-10 pb-2 shrink-0">
							<input
								type="text"
								key={activeLang.value}
								value={activeTitle.value}
								onInput={(event: Event & { currentTarget: HTMLInputElement }) => {
									const newTitle = event.currentTarget.value;
									activeTitle.value = newTitle;
									savedTranslations.value = {
										...savedTranslations.value,
										[activeLang.value]: {
											...savedTranslations.value[activeLang.value],
											title: newTitle,
										},
									};
									markDirty();

									if (
										!pageId &&
										activeLang.value === defaultLangCode &&
										!slugManuallyEdited.value &&
										!isHomepage.value
									) {
										slug.value = slugify(newTitle);
									}
								}}
								placeholder="Page title…"
								class="font-serif italic text-[32px] text-text0 bg-transparent border-none outline-none w-full mb-2 leading-[1.3] placeholder-text2/40"
							/>
						</div>
						<EditorRoot>
							<EditorContent
								key={activeLang.value}
								extensions={[StarterKit, slashCommand]}
								initialContent={savedTranslations.value[activeLang.value]?.content ?? undefined}
								className={editorContentClass}
								editorProps={{
									handleDOMEvents: {
										keydown: (_view: unknown, event: KeyboardEvent) => handleCommandNavigation(event),
									},
									attributes: {
										class: "max-w-[720px] mx-auto px-6 py-4",
									},
								}}
								onUpdate={({ editor }: { editor: { getJSON: () => JSONContent } }) => {
									savedTranslations.value = {
										...savedTranslations.value,
										[activeLang.value]: {
											...savedTranslations.value[activeLang.value],
											content: editor.getJSON(),
										},
									};
									markDirty();
								}}
							>
								<EditorCommand className="z-50 h-auto max-h-82.5 overflow-y-auto rounded-xl border border-ui-border bg-bg0 shadow-lg transition-all">
									<EditorCommandEmpty className="px-3 py-3 text-[11px] text-text2">No results</EditorCommandEmpty>
									<EditorCommandList className="px-1 py-1">
										{suggestionItems.map((item) => (
											<EditorCommandItem
												key={item.title}
												value={item.title}
												onCommand={(value: unknown) => {
													if (item.command) {
														item.command(value as Parameters<NonNullable<typeof item.command>>[0]);
													}
												}}
												className="flex items-start gap-3 w-full rounded-lg px-3 py-2 text-left text-[12px] text-text1 hover:bg-bg2 cursor-pointer transition-colors aria-selected:bg-bg2 aria-selected:text-text0"
											>
												<div>
													<div class="font-medium text-text0">{item.title}</div>
													<div class="text-[11px] text-text2">{item.description}</div>
												</div>
											</EditorCommandItem>
										))}
									</EditorCommandList>
								</EditorCommand>
							</EditorContent>
						</EditorRoot>
					</div>
				</div>

				{/* ── Settings sidebar ────────────────────────── */}
				<aside
					class={`w-80 shrink-0 bg-bg0 border-l border-ui-border overflow-y-auto flex flex-col gap-3 p-3.5 max-[840px]:fixed max-[840px]:top-0 max-[840px]:right-0 max-[840px]:h-full max-[840px]:z-50 max-[840px]:shadow-2xl max-[840px]:transition-transform max-[840px]:duration-200 ${sidebarOpen.value ? "max-[840px]:translate-x-0" : "max-[840px]:translate-x-full"}`}
				>
					<div class="hidden max-[840px]:flex justify-between items-center">
						<span class="text-[11px] text-text0">Settings</span>
						<button
							type="button"
							onClick={() => {
								sidebarOpen.value = false;
							}}
							class="flex items-center justify-center w-6 h-6 text-text1 hover:text-text0 hover:bg-bg3 rounded transition-colors"
							aria-label="Close settings"
						>
							✕
						</button>
					</div>
					{/* Language switcher */}
					{languages.length > 1 && (
						<div class="bg-bg2 border border-ui-border rounded-md p-3">
							<div class="text-[11px] text-text0 mb-2.5">Language</div>
							<div class="flex flex-wrap gap-1.5">
								{languages.map((lang) => (
									<button
										key={lang.code}
										type="button"
										onClick={() => switchLang(lang.code)}
										class={`px-3 py-1.5 text-[11px] rounded border cursor-pointer transition-all ${
											activeLang.value === lang.code
												? "bg-accent border-accent text-white"
												: "bg-bg1 border-ui-border text-text1 hover:border-ui-border-hover"
										}`}
									>
										{lang.label}
										{lang.isDefault && <span class="ml-1 text-[9px] opacity-50">default</span>}
									</button>
								))}
							</div>
						</div>
					)}

					{/* Version status */}
					<div class="bg-bg2 border border-ui-border rounded-md p-3">
						<div class="text-[11px] text-text0 mb-2.5">Version status</div>

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

						{pageId && hasDraft.value && (status.value === "published" || status.value === "unpublished") && (
							<div class="bg-amber-faint border border-amber/20 rounded px-2 py-1.5 mb-2.5">
								<div class="text-[10px] text-amber font-medium mb-1.5">Draft pending</div>
								<div class="flex flex-col gap-1">
									<button
										type="button"
										onClick={handlePublish}
										disabled={saving.value}
										class="w-full text-center text-[10px] bg-accent text-white border-none rounded py-1 cursor-pointer hover:bg-accent-hover transition-colors disabled:opacity-40"
									>
										{saving.value ? "…" : "Publish draft"}
									</button>
									<button
										type="button"
										onClick={handleDiscardDraft}
										disabled={saving.value}
										class="w-full text-center text-[10px] bg-bg3 border border-ui-border text-text1 rounded py-1 cursor-pointer hover:border-ui-border-hover transition-colors disabled:opacity-40"
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

					{/* Page meta */}
					<div class="bg-bg2 border border-ui-border rounded-md p-3">
						<div class="text-[11px] text-text0 mb-2.5">Page meta</div>

						<label class="flex items-center gap-2.5 cursor-pointer select-none mb-2.5">
							<input
								type="checkbox"
								checked={isHomepage.value}
								onChange={(event: Event & { currentTarget: HTMLInputElement }) => {
									if (event.currentTarget.checked && hasExistingHomepage) {
										event.currentTarget.checked = false;
										toast({
											title: "Homepage already set",
											description: "Another page is already set as homepage. Remove that designation first.",
											type: "warning",
										});
										return;
									}
									isHomepage.value = event.currentTarget.checked;
									if (event.currentTarget.checked) {
										slug.value = "/";
									} else if (!pageId && !slugManuallyEdited.value) {
										const defaultTitle = savedTranslations.value[defaultLangCode ?? ""]?.title ?? "";
										slug.value = slugify(defaultTitle);
									}
									markDirty();
								}}
								class="w-4 h-4 accent-accent cursor-pointer"
							/>
							<span class="text-[11px] text-text1">Set as homepage</span>
						</label>

						<label class="flex items-center gap-2.5 cursor-pointer select-none mb-2.5">
							<input
								type="checkbox"
								checked={hideTitle.value}
								onChange={(event: Event & { currentTarget: HTMLInputElement }) => {
									hideTitle.value = event.currentTarget.checked;
									markDirty();
								}}
								class="w-4 h-4 accent-accent cursor-pointer"
							/>
							<span class="text-[11px] text-text1">Hide title on page</span>
						</label>

						<div class="text-[10px] text-text2 mb-1">Slug</div>
						<input
							type="text"
							value={isHomepage.value ? "/" : slug.value}
							onInput={(event: Event & { currentTarget: HTMLInputElement }) => {
								slug.value = event.currentTarget.value;
								slugManuallyEdited.value = true;
								markDirty();
							}}
							placeholder="/about"
							maxLength={255}
							disabled={isHomepage.value}
							class={`w-full bg-bg1 border border-ui-border rounded text-[11px] text-text0 px-2 py-1.5 outline-none focus:border-ui-border-hover transition-colors ${isHomepage.value ? "opacity-40 cursor-not-allowed" : ""}`}
						/>
					</div>

					{/* Danger zone */}
					{pageId && (
						<div class="bg-bg2 border border-coral/30 rounded-md p-3">
							<div class="text-[11px] text-coral mb-2.5">Danger zone</div>
							{showDeleteConfirm.value ? (
								<>
									<p class="text-[10px] text-text1 mb-2">
										Permanently deletes this page and all translations. Cannot be undone.
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
				</aside>
			</div>

			{/* ── Mobile sidebar tab ─────────────────────────── */}
			{!sidebarOpen.value && (
				<button
					type="button"
					onClick={() => {
						sidebarOpen.value = true;
					}}
					aria-label="Open page settings"
					class="hidden max-[840px]:flex fixed right-0 bottom-1/3 z-30 flex-col items-center gap-1.5 bg-bg0 border border-r-0 border-ui-border rounded-l-xl px-2.5 py-3.5 shadow-lg text-text1 hover:text-text0 hover:bg-bg2 transition-colors"
				>
					<span class="text-[15px]">⚙</span>
					<span class="text-[9px] [writing-mode:vertical-rl] rotate-180 tracking-widest uppercase text-text2">
						Settings
					</span>
				</button>
			)}

			<Modal isOpen={modal.isOpen.value} onClose={modal.hide}>
				<div class="text-[14px] font-semibold text-text0 mb-2">Unsaved changes</div>
				<p class="text-[12px] text-text2 mb-5">You have unsaved changes. If you leave now, they will be lost.</p>
				<div class="flex gap-2 justify-end">
					<button
						type="button"
						onClick={modal.hide}
						class="px-4 py-1.5 text-[12px] bg-bg3 border border-ui-border text-text1 rounded cursor-pointer hover:border-ui-border-hover transition-colors"
					>
						Cancel
					</button>
					<button
						type="button"
						onClick={confirmNavigation}
						class="px-4 py-1.5 text-[12px] bg-coral text-white border-none rounded cursor-pointer hover:opacity-80 transition-opacity"
					>
						Leave anyway
					</button>
				</div>
			</Modal>
		</div>
	);
}
