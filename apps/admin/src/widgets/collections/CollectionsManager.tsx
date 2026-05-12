import { useComputed, useSignal } from "@preact/signals";
import { Button, Input } from "@repo/ui";
import { api, extractApiError } from "@shared/api/client";
import type { ComponentChildren, JSX } from "preact";
import { useEffect } from "preact/hooks";

// ─── Types ────────────────────────────────────────────

export interface CollectionRow {
	id: string;
	name: string;
	fieldCount: number;
	entryCount: number;
}

export interface FieldRow {
	id: string;
	collectionId: string;
	name: string;
	type: FieldType;
	required: boolean;
	isUnique: boolean;
	localised: boolean;
	sortOrder: number;
}

export interface EntryRow {
	id: string;
	collectionId: string;
	data: Record<string, unknown>;
	createdAt: string | Date;
	updatedAt: string | Date;
}

type FieldType = "Text" | "Number" | "Boolean" | "Rich text" | "Media" | "Date";
type TabMode = "entries" | "schema";

const FIELD_TYPES: FieldType[] = ["Text", "Number", "Boolean", "Rich text", "Media", "Date"];

const FIELD_ICONS: Record<FieldType, string> = {
	Text: "T",
	Number: "#",
	Boolean: "○",
	"Rich text": "≡",
	Media: "▣",
	Date: "⊡",
};

interface CollectionsManagerProps {
	initialCollections: CollectionRow[];
}

// ─── Modal shell ──────────────────────────────────────

function ModalShell({
	title,
	onClose,
	children,
	width = "w-80",
}: {
	title: string;
	onClose: () => void;
	children: ComponentChildren;
	width?: string;
}): JSX.Element {
	return (
		<div class="fixed inset-0 z-50 flex items-center justify-center bg-black/75">
			<button type="button" class="absolute inset-0 cursor-default" onClick={onClose} aria-label="Close" />
			<div
				role="dialog"
				aria-modal="true"
				aria-label={title}
				class={`relative bg-bg2 border border-ui-border rounded-lg overflow-hidden flex flex-col max-h-[85vh] ${width}`}
			>
				<div class="flex items-center justify-between px-4 py-3 border-b border-ui-border shrink-0">
					<span class="text-xs text-text0">{title}</span>
					<button
						type="button"
						onClick={onClose}
						class="bg-transparent border-none text-text1 hover:text-text0 cursor-pointer text-lg leading-none px-0.5"
					>
						×
					</button>
				</div>
				<div class="p-4 overflow-y-auto">{children}</div>
			</div>
		</div>
	);
}

// ─── Entry value renderer ─────────────────────────────

function EntryVal({ val, type }: { val: unknown; type: FieldType }): JSX.Element {
	if (type === "Boolean") {
		return val ? (
			<span class="text-[11px] text-green">✓ true</span>
		) : (
			<span class="text-[11px] text-amber">- false</span>
		);
	}
	return <span class="text-[11px] text-text0">{String(val ?? "")}</span>;
}

// ─── Main component ───────────────────────────────────

export function CollectionsManager({ initialCollections }: CollectionsManagerProps): JSX.Element {
	const collections = useSignal<CollectionRow[]>(initialCollections);
	const selectedId = useSignal<string | null>(initialCollections[0]?.id ?? null);
	const mode = useSignal<TabMode>("entries");

	const fieldsCache = useSignal<Record<string, FieldRow[]>>({});
	const entriesCache = useSignal<Record<string, EntryRow[]>>({});
	const loadingId = useSignal<string | null>(null);

	const newCollModal = useSignal(false);
	const newCollName = useSignal("");
	const newCollError = useSignal<string | null>(null);
	const newCollSaving = useSignal(false);

	const addFieldModal = useSignal(false);
	const fieldName = useSignal("");
	const fieldType = useSignal<FieldType>("Text");
	const fieldRequired = useSignal(false);
	const fieldUnique = useSignal(false);
	const fieldLocalised = useSignal(false);
	const addFieldError = useSignal<string | null>(null);
	const addFieldSaving = useSignal(false);

	const editFieldModal = useSignal<FieldRow | null>(null);
	const editFieldName = useSignal("");
	const editFieldType = useSignal<FieldType>("Text");
	const editFieldRequired = useSignal(false);
	const editFieldUnique = useSignal(false);
	const editFieldLocalised = useSignal(false);
	const editFieldError = useSignal<string | null>(null);
	const editFieldSaving = useSignal(false);

	const entryModal = useSignal<"add" | "edit" | null>(null);
	const editingEntry = useSignal<EntryRow | null>(null);
	const entryFormData = useSignal<Record<string, string>>({});
	const entryError = useSignal<string | null>(null);
	const entrySaving = useSignal(false);

	const mobilePanelOpen = useSignal(false);

	const selectedCollection = useComputed(() => collections.value.find((col) => col.id === selectedId.value) ?? null);
	const currentFields = useComputed(() => (selectedId.value ? (fieldsCache.value[selectedId.value] ?? []) : []));
	const currentEntries = useComputed(() => (selectedId.value ? (entriesCache.value[selectedId.value] ?? []) : []));

	// ─── Data loading ──────────────────────────────────

	const loadCollectionData = async (id: string): Promise<void> => {
		if (fieldsCache.value[id] !== undefined || loadingId.value === id) return;
		loadingId.value = id;

		const [fieldsRes, entriesRes] = await Promise.all([
			api.collections({ id }).fields.get(),
			api.collections({ id }).entries.get(),
		]);

		fieldsCache.value = { ...fieldsCache.value, [id]: fieldsRes.data ?? [] };
		entriesCache.value = { ...entriesCache.value, [id]: entriesRes.data ?? [] };
		loadingId.value = null;
	};

	const selectCollection = async (id: string): Promise<void> => {
		selectedId.value = id;
		mode.value = "entries";
		mobilePanelOpen.value = false;
		await loadCollectionData(id);
	};

	useEffect(() => {
		if (selectedId.value) {
			void loadCollectionData(selectedId.value);
		}
	}, []);

	// ─── Collection actions ────────────────────────────

	const handleCreateCollection = async (): Promise<void> => {
		const name = newCollName.value.trim();
		if (!name) return;

		newCollSaving.value = true;
		newCollError.value = null;

		const { data: created, error } = await api.collections.post({ name });
		newCollSaving.value = false;

		if (error || !created) {
			newCollError.value = error ? (extractApiError(error) ?? "Failed to create") : "Failed to create";
			return;
		}

		collections.value = [...collections.value, { id: created.id, name: created.name, fieldCount: 0, entryCount: 0 }];
		fieldsCache.value = { ...fieldsCache.value, [created.id]: [] };
		entriesCache.value = { ...entriesCache.value, [created.id]: [] };

		newCollModal.value = false;
		newCollName.value = "";
		selectedId.value = created.id;
		mode.value = "schema";
	};

	const handleDeleteCollection = async (id: string): Promise<void> => {
		if (!confirm("Delete this collection and all its data?")) return;
		await api.collections({ id }).delete();
		collections.value = collections.value.filter((col) => col.id !== id);
		if (selectedId.value === id) {
			selectedId.value = collections.value[0]?.id ?? null;
		}
	};

	// ─── Field actions ─────────────────────────────────

	const handleAddField = async (): Promise<void> => {
		const id = selectedId.value;
		if (!id) return;

		addFieldSaving.value = true;
		addFieldError.value = null;

		const { data: field, error } = await api.collections({ id }).fields.post({
			name: fieldName.value.trim(),
			type: fieldType.value,
			required: fieldRequired.value,
			isUnique: fieldUnique.value,
			localised: fieldLocalised.value,
		});

		addFieldSaving.value = false;

		if (error || !field) {
			addFieldError.value = error ? (extractApiError(error) ?? "Failed to add field") : "Failed to add field";
			return;
		}

		fieldsCache.value = { ...fieldsCache.value, [id]: [...(fieldsCache.value[id] ?? []), field] };
		collections.value = collections.value.map((col) =>
			col.id === id ? { ...col, fieldCount: col.fieldCount + 1 } : col,
		);

		addFieldModal.value = false;
		fieldName.value = "";
		fieldType.value = "Text";
		fieldRequired.value = false;
		fieldUnique.value = false;
		fieldLocalised.value = false;
	};

	const openEditField = (field: FieldRow): void => {
		editFieldName.value = field.name;
		editFieldType.value = field.type;
		editFieldRequired.value = field.required;
		editFieldUnique.value = field.isUnique;
		editFieldLocalised.value = field.localised;
		editFieldError.value = null;
		editFieldModal.value = field;
	};

	const handleEditField = async (): Promise<void> => {
		const field = editFieldModal.value;
		const id = selectedId.value;
		if (!field || !id) return;

		editFieldSaving.value = true;
		editFieldError.value = null;

		const { data: updated, error } = await api
			.collections({ id })
			.fields({ fieldId: field.id })
			.patch({
				name: editFieldName.value.trim() || undefined,
				type: editFieldType.value,
				required: editFieldRequired.value,
				isUnique: editFieldUnique.value,
				localised: editFieldLocalised.value,
			});

		editFieldSaving.value = false;

		if (error || !updated) {
			editFieldError.value = error ? (extractApiError(error) ?? "Failed to save") : "Failed to save";
			return;
		}

		fieldsCache.value = {
			...fieldsCache.value,
			[id]: (fieldsCache.value[id] ?? []).map((f) => (f.id === field.id ? updated : f)),
		};
		editFieldModal.value = null;
	};

	const handleDeleteField = async (fieldId: string): Promise<void> => {
		const id = selectedId.value;
		if (!id) return;
		await api.collections({ id }).fields({ fieldId }).delete();
		fieldsCache.value = {
			...fieldsCache.value,
			[id]: (fieldsCache.value[id] ?? []).filter((field) => field.id !== fieldId),
		};
		collections.value = collections.value.map((col) =>
			col.id === id ? { ...col, fieldCount: Math.max(0, col.fieldCount - 1) } : col,
		);
	};

	// ─── Entry actions ─────────────────────────────────

	const openAddEntry = (): void => {
		const initial: Record<string, string> = {};
		for (const field of currentFields.value) {
			initial[field.name] = "";
		}
		entryFormData.value = initial;
		editingEntry.value = null;
		entryModal.value = "add";
		entryError.value = null;
	};

	const openEditEntry = (entry: EntryRow): void => {
		const form: Record<string, string> = {};
		for (const field of currentFields.value) {
			form[field.name] = String(entry.data[field.name] ?? "");
		}
		entryFormData.value = form;
		editingEntry.value = entry;
		entryModal.value = "edit";
		entryError.value = null;
	};

	const coerceEntryData = (fields: FieldRow[], form: Record<string, string>): Record<string, unknown> => {
		const result: Record<string, unknown> = {};
		for (const field of fields) {
			const raw = form[field.name] ?? "";
			if (field.type === "Number") {
				result[field.name] = raw === "" ? null : Number(raw);
			} else if (field.type === "Boolean") {
				result[field.name] = raw === "true";
			} else {
				result[field.name] = raw;
			}
		}
		return result;
	};

	const handleSaveEntry = async (): Promise<void> => {
		const id = selectedId.value;
		if (!id) return;

		entrySaving.value = true;
		entryError.value = null;

		const data = coerceEntryData(currentFields.value, entryFormData.value);

		if (entryModal.value === "edit" && editingEntry.value) {
			const entryId = editingEntry.value.id;
			const { data: updated, error } = await api.collections({ id }).entries({ entryId }).patch({ data });
			entrySaving.value = false;

			if (error || !updated) {
				entryError.value = error ? (extractApiError(error) ?? "Failed to save") : "Failed to save";
				return;
			}

			entriesCache.value = {
				...entriesCache.value,
				[id]: (entriesCache.value[id] ?? []).map((entry) => (entry.id === entryId ? updated : entry)),
			};
		} else {
			const { data: created, error } = await api.collections({ id }).entries.post({ data });
			entrySaving.value = false;

			if (error || !created) {
				entryError.value = error ? (extractApiError(error) ?? "Failed to save") : "Failed to save";
				return;
			}

			entriesCache.value = {
				...entriesCache.value,
				[id]: [...(entriesCache.value[id] ?? []), created],
			};
			collections.value = collections.value.map((col) =>
				col.id === id ? { ...col, entryCount: col.entryCount + 1 } : col,
			);
		}

		entryModal.value = null;
		editingEntry.value = null;
	};

	const handleDeleteEntry = async (entryId: string): Promise<void> => {
		const id = selectedId.value;
		if (!id) return;
		await api.collections({ id }).entries({ entryId }).delete();
		entriesCache.value = {
			...entriesCache.value,
			[id]: (entriesCache.value[id] ?? []).filter((entry) => entry.id !== entryId),
		};
		collections.value = collections.value.map((col) =>
			col.id === id ? { ...col, entryCount: Math.max(0, col.entryCount - 1) } : col,
		);
	};

	// ─── Sidebar list ──────────────────────────────────

	const CollectionList = (): JSX.Element => (
		<>
			<div class="flex items-center justify-between px-3.5 py-2.5 border-b border-ui-border">
				<span class="text-[9px] uppercase tracking-[0.07em] text-text2">Collections</span>
				<button
					type="button"
					onClick={() => {
						newCollModal.value = true;
					}}
					class="bg-transparent border-none text-text1 hover:text-text0 cursor-pointer text-base leading-none"
				>
					+
				</button>
			</div>
			{collections.value.map((col) => {
				const active = col.id === selectedId.value;
				return (
					<button
						key={col.id}
						type="button"
						onClick={() => void selectCollection(col.id)}
						class={`w-full flex items-center gap-2 px-3.5 py-2.5 border-none border-l-2 cursor-pointer text-[11px] text-left transition-colors ${
							active
								? "bg-accent-faint border-l-accent text-text0"
								: "bg-transparent border-l-transparent text-text1 hover:text-text0"
						}`}
					>
						<span class="text-[9px] text-text2">≡</span>
						<span class="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{col.name}</span>
						<span class={`text-[9px] bg-bg3 px-1.5 py-px rounded-sm shrink-0 ${active ? "text-accent" : "text-text2"}`}>
							{col.entryCount}
						</span>
					</button>
				);
			})}
		</>
	);

	// ─── Render ────────────────────────────────────────

	const coll = selectedCollection.value;
	const fields = currentFields.value;
	const entries = currentEntries.value;
	const isLoading = loadingId.value === selectedId.value;

	return (
		<div class="flex flex-col h-full">
			{/* Topbar */}
			<div class="flex items-center gap-2.5 px-[18px] h-11 border-b border-ui-border bg-bg0 shrink-0">
				<span class="font-serif italic text-text0 text-xl leading-none">Collections</span>
				<div class="ml-auto flex items-center gap-1.5">
					<button
						type="button"
						class="md:hidden bg-bg3 border border-ui-border text-text1 hover:text-text0 text-[11px] px-2 py-1 rounded cursor-pointer transition-colors"
						onClick={() => {
							mobilePanelOpen.value = true;
						}}
					>
						≡ {coll?.name}
					</button>
					<Button
						variant="primary"
						size="sm"
						onClick={() => {
							newCollModal.value = true;
						}}
					>
						<span class="hidden md:inline">+ New collection</span>
						<span class="md:hidden">+</span>
					</Button>
				</div>
			</div>

			{/* Body */}
			<div class="flex flex-1 overflow-hidden">
				{/* Desktop sidebar */}
				<div class="hidden md:flex flex-col w-[190px] border-r border-ui-border bg-bg0 shrink-0 overflow-y-auto">
					<CollectionList />
				</div>

				{/* Main area */}
				{coll ? (
					<div class="flex flex-col flex-1 overflow-hidden bg-bg1">
						{/* Sub-header */}
						<div class="flex items-center gap-2 px-3.5 py-2 border-b border-ui-border bg-bg0 shrink-0 flex-wrap">
							<span class="font-serif italic text-text0 text-[17px]">{coll.name}</span>
							<span class="hidden md:inline text-[10px] text-text2">
								{coll.entryCount} entries · {coll.fieldCount} fields
							</span>
							<div class="flex-1" />
							<button
								type="button"
								onClick={() => {
									mode.value = mode.value === "schema" ? "entries" : "schema";
								}}
								class={`px-2.5 py-[3px] rounded border cursor-pointer text-[11px] transition-colors ${
									mode.value === "schema"
										? "bg-accent border-accent text-white"
										: "bg-bg3 border-ui-border text-text1 hover:text-text0"
								}`}
							>
								Schema
							</button>
							<Button variant="default" size="sm" onClick={openAddEntry}>
								+ Add entry
							</Button>
							<Button variant="danger" size="sm" onClick={() => void handleDeleteCollection(coll.id)}>
								Delete
							</Button>
						</div>

						{/* Content */}
						{isLoading ? (
							<div class="flex items-center justify-center flex-1 text-xs text-text2">Loading…</div>
						) : mode.value === "entries" ? (
							/* Entries table */
							<div class="flex-1 overflow-y-auto">
								{fields.length === 0 ? (
									<div class="p-6 text-xs text-text2">No fields yet. Switch to Schema to add fields.</div>
								) : (
									<div class="overflow-x-auto">
										{/* Table header */}
										<div class="flex px-3.5 border-b border-ui-border min-h-8 items-center bg-bg0 min-w-96">
											{fields.map((field) => (
												<div key={field.id} class="flex-1 text-[10px] text-text2 min-w-20">
													{field.name}
												</div>
											))}
											<div class="w-12" />
										</div>
										{/* Rows */}
										{entries.map((entry) => (
											<div
												key={entry.id}
												class="group flex items-center px-3.5 min-h-10 border-b border-ui-border min-w-96 transition-colors hover:bg-bg2"
											>
												{fields.map((field) => (
													<div key={field.id} class="flex-1 min-w-20">
														<EntryVal val={entry.data[field.name]} type={field.type} />
													</div>
												))}
												<div class="w-12 flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
													<button
														type="button"
														class="bg-transparent border-none text-text1 hover:text-text0 cursor-pointer text-xs p-1"
														onClick={() => openEditEntry(entry)}
														aria-label="Edit entry"
														title="Edit entry"
													>
														✎
													</button>
													<button
														type="button"
														class="bg-transparent border-none text-coral cursor-pointer text-xs p-1"
														onClick={() => void handleDeleteEntry(entry.id)}
														aria-label="Delete entry"
														title="Delete entry"
													>
														⊗
													</button>
												</div>
											</div>
										))}
										<div class="p-2.5">
											<button
												type="button"
												class="bg-transparent border-none text-text2 hover:text-text1 cursor-pointer text-xs transition-colors"
												onClick={openAddEntry}
											>
												+ Add entry
											</button>
										</div>
									</div>
								)}
							</div>
						) : (
							/* Schema view */
							<div class="flex-1 overflow-y-auto p-4">
								<div class="flex flex-col gap-2 mb-4">
									{fields.map((field) => (
										<div
											key={field.id}
											class="flex items-center gap-2.5 bg-bg2 border border-ui-border rounded px-3.5 py-2.5"
										>
											<span class="text-[10px] text-text2 w-3">≡</span>
											<span class="text-xs text-text0 flex-1">{field.name}</span>
											<span class="bg-accent-faint text-accent text-[10px] px-1.5 py-0.5 rounded-sm">{field.type}</span>
											{field.required && (
												<span class="bg-green-faint text-green text-[10px] px-1.5 py-0.5 rounded-sm">req</span>
											)}
											<button
												type="button"
												class="bg-transparent border-none text-text1 hover:text-text0 cursor-pointer text-sm leading-none px-1"
												onClick={() => openEditField(field)}
												aria-label="Edit field"
											>
												✎
											</button>
											<button
												type="button"
												class="bg-transparent border-none text-coral cursor-pointer text-base leading-none px-1"
												onClick={() => void handleDeleteField(field.id)}
												aria-label="Delete field"
												title="Delete field"
											>
												⊗
											</button>
										</div>
									))}
								</div>
								<button
									type="button"
									class="bg-bg3 border border-dashed border-ui-border rounded w-full px-3.5 py-2.5 text-xs text-text1 text-left cursor-pointer hover:text-text0 transition-colors"
									onClick={() => {
										addFieldModal.value = true;
									}}
								>
									+ Add field
								</button>
							</div>
						)}
					</div>
				) : (
					<div class="flex-1 flex items-center justify-center text-xs text-text2">
						{collections.value.length === 0 ? "No collections yet. Create one to get started." : "Select a collection"}
					</div>
				)}
			</div>

			{/* Mobile: bottom sheet */}
			{mobilePanelOpen.value && (
				<div class="fixed inset-0 z-50 flex items-end md:hidden bg-black/75">
					<button
						type="button"
						class="absolute inset-0 cursor-default"
						onClick={() => {
							mobilePanelOpen.value = false;
						}}
						aria-label="Close"
					/>
					<div class="relative bg-bg0 w-full rounded-t-xl max-h-[70vh] overflow-y-auto">
						<div class="flex items-center justify-between px-4 py-3 border-b border-ui-border">
							<span class="text-xs text-text0">Collections</span>
							<button
								type="button"
								class="bg-transparent border-none text-text1 hover:text-text0 cursor-pointer text-lg leading-none"
								onClick={() => {
									mobilePanelOpen.value = false;
								}}
							>
								×
							</button>
						</div>
						<CollectionList />
					</div>
				</div>
			)}

			{/* New collection modal */}
			{newCollModal.value && (
				<ModalShell
					title="New collection"
					onClose={() => {
						newCollModal.value = false;
						newCollName.value = "";
						newCollError.value = null;
					}}
				>
					<div class="flex flex-col gap-3">
						<Input
							label="Collection name"
							placeholder="e.g. blog_posts"
							value={newCollName.value}
							onInput={(e) => {
								newCollName.value = e.currentTarget.value;
							}}
							onKeyDown={(e) => {
								if (e.key === "Enter") void handleCreateCollection();
							}}
						/>
						<p class="text-[10px] text-text2 -mt-1">Lowercase letters, numbers and underscores only</p>
						{newCollError.value && <div class="text-xs text-coral">{newCollError.value}</div>}
						<div class="flex justify-end gap-2 pt-2 border-t border-ui-border">
							<Button
								variant="default"
								size="sm"
								onClick={() => {
									newCollModal.value = false;
								}}
							>
								Cancel
							</Button>
							<Button
								variant="primary"
								size="sm"
								disabled={!newCollName.value.trim() || newCollSaving.value}
								onClick={() => void handleCreateCollection()}
							>
								{newCollSaving.value ? "Creating…" : "Create"}
							</Button>
						</div>
					</div>
				</ModalShell>
			)}

			{/* Add field modal */}
			{addFieldModal.value && (
				<ModalShell
					title="Add field"
					onClose={() => {
						addFieldModal.value = false;
					}}
					width="w-96"
				>
					<div class="flex flex-col gap-4">
						<Input
							label="Field name"
							placeholder="e.g. title"
							value={fieldName.value}
							onInput={(e) => {
								fieldName.value = e.currentTarget.value;
							}}
						/>
						<div>
							<div class="text-[10px] text-text1 mb-2">Field type</div>
							<div class="grid grid-cols-3 gap-1.5">
								{FIELD_TYPES.map((type) => {
									const active = fieldType.value === type;
									return (
										<button
											key={type}
											type="button"
											onClick={() => {
												fieldType.value = type;
											}}
											class={`flex flex-col items-center gap-1.5 py-2.5 px-1.5 rounded border cursor-pointer transition-colors ${
												active
													? "bg-accent-faint border-accent text-accent"
													: "bg-bg3 border-ui-border text-text1 hover:text-text0"
											}`}
										>
											<span class="text-lg">{FIELD_ICONS[type]}</span>
											<span class="text-[10px]">{type}</span>
										</button>
									);
								})}
							</div>
						</div>
						<div class="flex gap-4">
							{(["required", "isUnique", "localised"] as const).map((key) => {
								const labels = { required: "Required", isUnique: "Unique", localised: "Localised" };
								const signals = { required: fieldRequired, isUnique: fieldUnique, localised: fieldLocalised };
								const signal = signals[key];
								return (
									<label key={key} class="flex items-center gap-1.5 cursor-pointer text-[11px] text-text1">
										<input
											type="checkbox"
											checked={signal.value}
											onChange={(e) => {
												signal.value = e.currentTarget.checked;
											}}
											style="accent-color: var(--accent)"
										/>
										{labels[key]}
									</label>
								);
							})}
						</div>
						{addFieldError.value && <div class="text-xs text-coral">{addFieldError.value}</div>}
						<div class="flex justify-end gap-2 pt-2 border-t border-ui-border">
							<Button
								variant="default"
								size="sm"
								onClick={() => {
									addFieldModal.value = false;
								}}
							>
								Cancel
							</Button>
							<Button
								variant="primary"
								size="sm"
								disabled={!fieldName.value.trim() || addFieldSaving.value}
								onClick={() => void handleAddField()}
							>
								{addFieldSaving.value ? "Adding…" : "Add field"}
							</Button>
						</div>
					</div>
				</ModalShell>
			)}

			{/* Edit field modal */}
			{editFieldModal.value && (
				<ModalShell
					title="Edit field"
					onClose={() => {
						editFieldModal.value = null;
					}}
					width="w-96"
				>
					<div class="flex flex-col gap-4">
						<Input
							label="Field name"
							placeholder="e.g. title"
							value={editFieldName.value}
							onInput={(e) => {
								editFieldName.value = e.currentTarget.value;
							}}
						/>
						<div>
							<div class="text-[10px] text-text1 mb-2">Field type</div>
							<div class="grid grid-cols-3 gap-1.5">
								{FIELD_TYPES.map((type) => {
									const active = editFieldType.value === type;
									return (
										<button
											key={type}
											type="button"
											onClick={() => {
												editFieldType.value = type;
											}}
											class={`flex flex-col items-center gap-1.5 py-2.5 px-1.5 rounded border cursor-pointer transition-colors ${
												active
													? "bg-accent-faint border-accent text-accent"
													: "bg-bg3 border-ui-border text-text1 hover:text-text0"
											}`}
										>
											<span class="text-lg">{FIELD_ICONS[type]}</span>
											<span class="text-[10px]">{type}</span>
										</button>
									);
								})}
							</div>
						</div>
						<div class="flex gap-4">
							{(["required", "isUnique", "localised"] as const).map((key) => {
								const labels = { required: "Required", isUnique: "Unique", localised: "Localised" };
								const signals = {
									required: editFieldRequired,
									isUnique: editFieldUnique,
									localised: editFieldLocalised,
								};
								const signal = signals[key];
								return (
									<label key={key} class="flex items-center gap-1.5 cursor-pointer text-[11px] text-text1">
										<input
											type="checkbox"
											checked={signal.value}
											onChange={(e) => {
												signal.value = e.currentTarget.checked;
											}}
											style="accent-color: var(--accent)"
										/>
										{labels[key]}
									</label>
								);
							})}
						</div>
						{editFieldError.value && <div class="text-xs text-coral">{editFieldError.value}</div>}
						<p class="text-[10px] text-text2">Changing the field type will clear all existing values for this field.</p>
						<div class="flex justify-end gap-2 pt-2 border-t border-ui-border">
							<Button
								variant="default"
								size="sm"
								onClick={() => {
									editFieldModal.value = null;
								}}
							>
								Cancel
							</Button>
							<Button
								variant="primary"
								size="sm"
								disabled={editFieldSaving.value}
								onClick={() => void handleEditField()}
							>
								{editFieldSaving.value ? "Saving…" : "Save"}
							</Button>
						</div>
					</div>
				</ModalShell>
			)}

			{/* Add / Edit entry modal */}
			{entryModal.value && (
				<ModalShell
					title={entryModal.value === "edit" ? "Edit entry" : "Add entry"}
					onClose={() => {
						entryModal.value = null;
					}}
					width="w-96"
				>
					<div class="flex flex-col gap-3">
						{fields.map((field) => (
							<div key={field.id}>
								<div class="text-[10px] text-text1 mb-1.5">
									{field.name}
									{field.required && <span class="text-coral ml-1">*</span>}
									<span class="ml-1.5 text-text2">{field.type}</span>
								</div>
								{field.type === "Boolean" ? (
									<select
										class="w-full bg-bg1 border border-ui-border rounded px-2.5 py-1.5 text-xs text-text0 outline-none cursor-pointer focus:border-accent"
										value={entryFormData.value[field.name] ?? "false"}
										onChange={(e) => {
											entryFormData.value = { ...entryFormData.value, [field.name]: e.currentTarget.value };
										}}
									>
										<option value="false">false</option>
										<option value="true">true</option>
									</select>
								) : (
									<Input
										value={entryFormData.value[field.name] ?? ""}
										type={field.type === "Number" ? "number" : field.type === "Date" ? "date" : "text"}
										onInput={(e) => {
											entryFormData.value = { ...entryFormData.value, [field.name]: e.currentTarget.value };
										}}
									/>
								)}
							</div>
						))}
						{entryError.value && <div class="text-xs text-coral">{entryError.value}</div>}
						<div class="flex justify-end gap-2 pt-2 border-t border-ui-border">
							<Button
								variant="default"
								size="sm"
								onClick={() => {
									entryModal.value = null;
								}}
							>
								Cancel
							</Button>
							<Button variant="primary" size="sm" disabled={entrySaving.value} onClick={() => void handleSaveEntry()}>
								{entrySaving.value ? "Saving…" : "Save"}
							</Button>
						</div>
					</div>
				</ModalShell>
			)}
		</div>
	);
}
