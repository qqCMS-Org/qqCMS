import { useComputed, useSignal } from "@preact/signals";
import { api, extractApiError } from "@shared/api/client";
import type { JSX } from "preact";

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

// ─── Entry value renderer ─────────────────────────────

function EntryVal({ val, type }: { val: unknown; type: FieldType }): JSX.Element {
	if (type === "Boolean") {
		return val ? <span class="text-success text-xs">✓ true</span> : <span class="text-warning text-xs">- false</span>;
	}
	return <span class="text-xs text-base-content">{String(val ?? "")}</span>;
}

// ─── Main component ───────────────────────────────────

export function CollectionsManager({ initialCollections }: CollectionsManagerProps): JSX.Element {
	// Collections state
	const collections = useSignal<CollectionRow[]>(initialCollections);
	const selectedId = useSignal<string | null>(initialCollections[0]?.id ?? null);
	const mode = useSignal<TabMode>("entries");

	// Per-collection data cache
	const fieldsCache = useSignal<Record<string, FieldRow[]>>({});
	const entriesCache = useSignal<Record<string, EntryRow[]>>({});
	const loadingId = useSignal<string | null>(null);

	// New collection modal
	const newCollModal = useSignal(false);
	const newCollName = useSignal("");
	const newCollError = useSignal<string | null>(null);
	const newCollSaving = useSignal(false);

	// Add field modal
	const addFieldModal = useSignal(false);
	const fieldName = useSignal("");
	const fieldType = useSignal<FieldType>("Text");
	const fieldRequired = useSignal(false);
	const fieldUnique = useSignal(false);
	const fieldLocalised = useSignal(false);
	const addFieldError = useSignal<string | null>(null);
	const addFieldSaving = useSignal(false);

	// Add / edit entry modal
	const entryModal = useSignal<"add" | "edit" | null>(null);
	const editingEntry = useSignal<EntryRow | null>(null);
	const entryFormData = useSignal<Record<string, string>>({});
	const entryError = useSignal<string | null>(null);
	const entrySaving = useSignal(false);

	// Mobile panel
	const mobilePanelOpen = useSignal(false);

	// Hover row

	const selectedCollection = useComputed(() => collections.value.find((col) => col.id === selectedId.value) ?? null);
	const currentFields = useComputed(() => (selectedId.value ? (fieldsCache.value[selectedId.value] ?? []) : []));
	const currentEntries = useComputed(() => (selectedId.value ? (entriesCache.value[selectedId.value] ?? []) : []));

	// ─── Data loading ──────────────────────────────────

	const loadCollectionData = async (id: string): Promise<void> => {
		if (fieldsCache.value[id] !== undefined) return;
		loadingId.value = id;

		const [fieldsRes, entriesRes] = await Promise.all([
			api.collections({ id }).fields.get(),
			api.collections({ id }).entries.get(),
		]);

		const newFields: Record<string, FieldRow[]> = { ...fieldsCache.value };
		const newEntries: Record<string, EntryRow[]> = { ...entriesCache.value };

		newFields[id] = fieldsRes.data ?? [];
		newEntries[id] = entriesRes.data ?? [];

		fieldsCache.value = newFields;
		entriesCache.value = newEntries;
		loadingId.value = null;
	};

	const selectCollection = async (id: string): Promise<void> => {
		selectedId.value = id;
		mode.value = "entries";
		mobilePanelOpen.value = false;
		await loadCollectionData(id);
	};

	// Load first collection on mount
	if (selectedId.value) {
		void loadCollectionData(selectedId.value);
	}

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

		const newRow: CollectionRow = { id: created.id, name: created.name, fieldCount: 0, entryCount: 0 };
		collections.value = [...collections.value, newRow];

		const newFields: Record<string, FieldRow[]> = { ...fieldsCache.value, [created.id]: [] };
		const newEntries: Record<string, EntryRow[]> = { ...entriesCache.value, [created.id]: [] };
		fieldsCache.value = newFields;
		entriesCache.value = newEntries;

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

		const updated = { ...fieldsCache.value, [id]: [...(fieldsCache.value[id] ?? []), field] };
		fieldsCache.value = updated;
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

	const handleDeleteField = async (fieldId: string): Promise<void> => {
		const id = selectedId.value;
		if (!id) return;

		await api.collections({ id }).fields({ fieldId }).delete();

		const updated = {
			...fieldsCache.value,
			[id]: (fieldsCache.value[id] ?? []).filter((field) => field.id !== fieldId),
		};
		fieldsCache.value = updated;
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

			const updatedEntries = {
				...entriesCache.value,
				[id]: (entriesCache.value[id] ?? []).map((entry) => (entry.id === entryId ? updated : entry)),
			};
			entriesCache.value = updatedEntries;
		} else {
			const { data: created, error } = await api.collections({ id }).entries.post({ data });

			entrySaving.value = false;

			if (error || !created) {
				entryError.value = error ? (extractApiError(error) ?? "Failed to save") : "Failed to save";
				return;
			}

			const updatedEntries = {
				...entriesCache.value,
				[id]: [...(entriesCache.value[id] ?? []), created],
			};
			entriesCache.value = updatedEntries;
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

		const updatedEntries = {
			...entriesCache.value,
			[id]: (entriesCache.value[id] ?? []).filter((entry) => entry.id !== entryId),
		};
		entriesCache.value = updatedEntries;
		collections.value = collections.value.map((col) =>
			col.id === id ? { ...col, entryCount: Math.max(0, col.entryCount - 1) } : col,
		);
	};

	// ─── Sidebar list (shared desktop/mobile) ─────────

	const CollectionList = (): JSX.Element => (
		<>
			<div class="flex items-center justify-between px-3.5 py-2.5 border-b border-base-300">
				<span class="text-[9px] uppercase tracking-widest text-base-content/40">Collections</span>
				<button
					type="button"
					onClick={() => {
						newCollModal.value = true;
					}}
					class="text-base-content/60 hover:text-base-content text-xl leading-none bg-transparent border-none cursor-pointer"
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
						class={`w-full flex items-center gap-1.5 px-3.5 py-2.5 text-left text-xs border-l-2 bg-transparent border-none cursor-pointer transition-colors ${
							active
								? "border-l-primary bg-primary/5 text-base-content"
								: "border-l-transparent text-base-content/60 hover:text-base-content"
						}`}
					>
						<span class="text-[9px] text-base-content/40">≡</span>
						<span class="flex-1 overflow-hidden text-ellipsis whitespace-nowrap">{col.name}</span>
						<span
							class={`text-[9px] bg-base-300 px-1 py-0.5 rounded shrink-0 ${active ? "text-primary" : "text-base-content/40"}`}
						>
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
			{/* TopBar */}
			<div class="flex items-center justify-between px-4 h-11 border-b border-base-300 bg-base-100 shrink-0">
				<h1 class="font-serif italic text-base-content text-base">Collections</h1>
				<div class="flex items-center gap-2">
					<button
						type="button"
						class="btn btn-xs btn-ghost md:hidden"
						onClick={() => {
							mobilePanelOpen.value = true;
						}}
					>
						≡ {coll?.name}
					</button>
					<button
						type="button"
						class="btn btn-xs btn-primary"
						onClick={() => {
							newCollModal.value = true;
						}}
					>
						<span class="hidden md:inline">+ New collection</span>
						<span class="md:hidden">+</span>
					</button>
				</div>
			</div>

			<div class="flex flex-1 overflow-hidden">
				{/* Desktop sidebar */}
				<div class="hidden md:flex flex-col w-48 border-r border-base-300 bg-base-100 shrink-0 overflow-y-auto">
					<CollectionList />
				</div>

				{/* Main area */}
				{coll ? (
					<div class="flex flex-col flex-1 overflow-hidden bg-base-200">
						{/* Sub-header */}
						<div class="flex items-center gap-2 px-3.5 py-2 border-b border-base-300 bg-base-100 shrink-0 flex-wrap">
							<span class="font-serif italic text-base-content text-[17px]">{coll.name}</span>
							<span class="hidden md:inline text-xs text-base-content/40">
								{coll.entryCount} entries · {coll.fieldCount} fields
							</span>
							<div class="flex-1" />
							<button
								type="button"
								onClick={() => {
									mode.value = mode.value === "schema" ? "entries" : "schema";
								}}
								class={`px-2.5 py-1 rounded text-xs border cursor-pointer transition-colors ${
									mode.value === "schema"
										? "bg-primary border-primary text-primary-content"
										: "bg-base-300 border-base-300 text-base-content"
								}`}
							>
								Schema
							</button>
							<button type="button" class="btn btn-xs btn-ghost" onClick={openAddEntry}>
								+ Add entry
							</button>
							<button
								type="button"
								class="btn btn-xs btn-ghost text-error"
								onClick={() => void handleDeleteCollection(coll.id)}
							>
								Delete
							</button>
						</div>

						{isLoading ? (
							<div class="flex items-center justify-center flex-1 text-xs text-base-content/40">Loading…</div>
						) : mode.value === "entries" ? (
							/* Entries table */
							<div class="flex-1 overflow-y-auto">
								{fields.length === 0 ? (
									<div class="p-6 text-xs text-base-content/40">No fields yet. Switch to Schema to add fields.</div>
								) : (
									<div class="overflow-x-auto">
										{/* Header */}
										<div class="flex px-3.5 border-b border-base-300 min-h-8 items-center bg-base-100 min-w-96">
											{fields.map((field) => (
												<div key={field.id} class="flex-1 text-[10px] text-base-content/40 min-w-20">
													{field.name}
												</div>
											))}
											<div class="w-12" />
										</div>
										{/* Rows */}
										{entries.map((entry) => (
											<div
												key={entry.id}
												class="group flex items-center px-3.5 min-h-10 border-b border-base-300 min-w-96 transition-colors hover:bg-base-300/30"
											>
												{fields.map((field) => (
													<div key={field.id} class="flex-1 min-w-20">
														<EntryVal val={entry.data[field.name]} type={field.type} />
													</div>
												))}
												<div class="w-12 flex gap-1 justify-end opacity-0 group-hover:opacity-100 transition-opacity">
													<button
														type="button"
														class="bg-transparent border-none text-base-content/60 hover:text-base-content cursor-pointer text-xs p-1"
														onClick={() => openEditEntry(entry)}
													>
														✎
													</button>
													<button
														type="button"
														class="bg-transparent border-none text-error cursor-pointer text-xs p-1"
														onClick={() => void handleDeleteEntry(entry.id)}
													>
														⊗
													</button>
												</div>
											</div>
										))}
										<div class="p-2.5">
											<button
												type="button"
												class="bg-transparent border-none text-base-content/40 cursor-pointer text-xs"
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
											class="flex items-center gap-2.5 bg-base-100 border border-base-300 rounded px-3.5 py-2.5"
										>
											<span class="text-[10px] text-base-content/40 w-3">≡</span>
											<span class="text-xs text-base-content flex-1">{field.name}</span>
											<span class="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded">{field.type}</span>
											{field.required && (
												<span class="bg-success/10 text-success text-[10px] px-1.5 py-0.5 rounded">req</span>
											)}
											<button
												type="button"
												class="bg-transparent border-none text-error cursor-pointer text-xs"
												onClick={() => void handleDeleteField(field.id)}
											>
												⊗
											</button>
										</div>
									))}
								</div>
								<button
									type="button"
									class="bg-base-300 border border-dashed border-base-300 rounded w-full px-3.5 py-2.5 text-xs text-base-content/60 text-left cursor-pointer hover:text-base-content transition-colors"
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
					<div class="flex-1 flex items-center justify-center text-xs text-base-content/40">
						{collections.value.length === 0 ? "No collections yet. Create one to get started." : "Select a collection"}
					</div>
				)}
			</div>

			{/* Mobile: collection picker modal */}
			{mobilePanelOpen.value && (
				<div class="fixed inset-0 z-50 flex items-end md:hidden">
					<button
						type="button"
						class="absolute inset-0 cursor-default"
						onClick={() => {
							mobilePanelOpen.value = false;
						}}
						aria-label="Close"
					/>
					<div role="dialog" class="relative bg-base-100 w-full rounded-t-xl max-h-[70vh] overflow-y-auto">
						<div class="flex items-center justify-between px-4 py-3 border-b border-base-300">
							<span class="font-medium text-sm">Collections</span>
							<button
								type="button"
								class="btn btn-xs btn-ghost"
								onClick={() => {
									mobilePanelOpen.value = false;
								}}
							>
								✕
							</button>
						</div>
						<CollectionList />
					</div>
				</div>
			)}

			{/* New collection modal */}
			{newCollModal.value && (
				<div class="fixed inset-0 z-50 flex items-center justify-center">
					<button
						type="button"
						class="absolute inset-0 bg-black/50 cursor-default"
						onClick={() => {
							newCollModal.value = false;
						}}
						aria-label="Close"
					/>
					<div
						role="dialog"
						class="relative bg-base-100 border border-base-300 rounded-lg p-5 w-80 flex flex-col gap-3"
					>
						<div class="text-sm font-medium">New collection</div>
						<div>
							<div class="text-[10px] text-base-content/60 mb-1.5">Collection name</div>
							<input
								class="input input-bordered input-sm w-full font-mono"
								placeholder="e.g. blog_posts"
								value={newCollName.value}
								onInput={(e) => {
									newCollName.value = e.currentTarget.value;
								}}
								onKeyDown={(e) => {
									if (e.key === "Enter") void handleCreateCollection();
								}}
							/>
							<div class="text-[10px] text-base-content/40 mt-1">Lowercase letters, numbers and underscores only</div>
						</div>
						{newCollError.value && <div class="text-xs text-error">{newCollError.value}</div>}
						<div class="flex justify-end gap-2 pt-1 border-t border-base-300">
							<button
								type="button"
								class="btn btn-xs btn-ghost"
								onClick={() => {
									newCollModal.value = false;
								}}
							>
								Cancel
							</button>
							<button
								type="button"
								class="btn btn-xs btn-primary"
								disabled={!newCollName.value.trim() || newCollSaving.value}
								onClick={() => void handleCreateCollection()}
							>
								{newCollSaving.value ? "Creating…" : "Create"}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Add field modal */}
			{addFieldModal.value && (
				<div class="fixed inset-0 z-50 flex items-center justify-center">
					<button
						type="button"
						class="absolute inset-0 bg-black/50 cursor-default"
						onClick={() => {
							addFieldModal.value = false;
						}}
						aria-label="Close"
					/>
					<div
						role="dialog"
						class="relative bg-base-100 border border-base-300 rounded-lg p-5 w-96 flex flex-col gap-3.5"
					>
						<div class="text-sm font-medium">Add field</div>
						<div>
							<div class="text-[10px] text-base-content/60 mb-1.5">Field name</div>
							<input
								class="input input-bordered input-sm w-full font-mono"
								placeholder="e.g. title"
								value={fieldName.value}
								onInput={(e) => {
									fieldName.value = e.currentTarget.value;
								}}
							/>
						</div>
						<div>
							<div class="text-[10px] text-base-content/60 mb-2">Field type</div>
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
											class={`flex flex-col items-center gap-1 py-2.5 px-1.5 rounded border cursor-pointer transition-colors ${
												active
													? "bg-primary/10 border-primary text-primary"
													: "bg-base-200 border-base-300 text-base-content/60 hover:text-base-content"
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
									<label key={key} class="flex items-center gap-1.5 cursor-pointer text-xs text-base-content/60">
										<input
											type="checkbox"
											class="checkbox checkbox-xs checkbox-primary"
											checked={signal.value}
											onChange={(e) => {
												signal.value = e.currentTarget.checked;
											}}
										/>
										{labels[key]}
									</label>
								);
							})}
						</div>
						{addFieldError.value && <div class="text-xs text-error">{addFieldError.value}</div>}
						<div class="flex justify-end gap-2 pt-1 border-t border-base-300">
							<button
								type="button"
								class="btn btn-xs btn-ghost"
								onClick={() => {
									addFieldModal.value = false;
								}}
							>
								Cancel
							</button>
							<button
								type="button"
								class="btn btn-xs btn-primary"
								disabled={!fieldName.value.trim() || addFieldSaving.value}
								onClick={() => void handleAddField()}
							>
								{addFieldSaving.value ? "Adding…" : "Add field"}
							</button>
						</div>
					</div>
				</div>
			)}

			{/* Add / Edit entry modal */}
			{entryModal.value && (
				<div class="fixed inset-0 z-50 flex items-center justify-center">
					<button
						type="button"
						class="absolute inset-0 bg-black/50 cursor-default"
						onClick={() => {
							entryModal.value = null;
						}}
						aria-label="Close"
					/>
					<div
						role="dialog"
						class="relative bg-base-100 border border-base-300 rounded-lg p-5 w-96 flex flex-col gap-3 max-h-[80vh] overflow-y-auto"
					>
						<div class="text-sm font-medium">{entryModal.value === "edit" ? "Edit entry" : "Add entry"}</div>
						{fields.map((field) => (
							<div key={field.id}>
								<div class="text-[10px] text-base-content/60 mb-1.5">
									{field.name}
									{field.required && <span class="text-error ml-1">*</span>}
									<span class="ml-1.5 text-base-content/30">{field.type}</span>
								</div>
								{field.type === "Boolean" ? (
									<select
										class="select select-bordered select-sm w-full"
										value={entryFormData.value[field.name] ?? "false"}
										onChange={(e) => {
											entryFormData.value = { ...entryFormData.value, [field.name]: e.currentTarget.value };
										}}
									>
										<option value="false">false</option>
										<option value="true">true</option>
									</select>
								) : (
									<input
										class="input input-bordered input-sm w-full"
										type={field.type === "Number" ? "number" : field.type === "Date" ? "date" : "text"}
										value={entryFormData.value[field.name] ?? ""}
										onInput={(e) => {
											entryFormData.value = { ...entryFormData.value, [field.name]: e.currentTarget.value };
										}}
									/>
								)}
							</div>
						))}
						{entryError.value && <div class="text-xs text-error">{entryError.value}</div>}
						<div class="flex justify-end gap-2 pt-1 border-t border-base-300">
							<button
								type="button"
								class="btn btn-xs btn-ghost"
								onClick={() => {
									entryModal.value = null;
								}}
							>
								Cancel
							</button>
							<button
								type="button"
								class="btn btn-xs btn-primary"
								disabled={entrySaving.value}
								onClick={() => void handleSaveEntry()}
							>
								{entrySaving.value ? "Saving…" : "Save"}
							</button>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
