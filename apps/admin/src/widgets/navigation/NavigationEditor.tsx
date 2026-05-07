import { useSignal } from "@preact/signals";
import { api, extractApiError } from "@shared/api/client";
import type { JSX } from "preact";

export interface NavigationItemRow {
	id: string;
	label: Record<string, string>;
	href: string;
	order: number;
	parentId: string | null;
}

interface NavigationEditorProps {
	initialItems: NavigationItemRow[];
}

const DRAG_CLASS = "opacity-40";

export function NavigationEditor({ initialItems }: NavigationEditorProps): JSX.Element {
	const items = useSignal<NavigationItemRow[]>([...initialItems].sort((a, b) => a.order - b.order));
	const adding = useSignal(false);
	const newLabel = useSignal("");
	const newHref = useSignal("");
	const addError = useSignal<string | null>(null);
	const saving = useSignal(false);
	const editingId = useSignal<string | null>(null);
	const editLabel = useSignal("");
	const editHref = useSignal("");
	const editError = useSignal<string | null>(null);
	const draggingId = useSignal<string | null>(null);
	const dragOverId = useSignal<string | null>(null);

	const handleDelete = async (id: string): Promise<void> => {
		const { error } = await api.navigation({ id }).delete();
		if (!error) {
			items.value = items.value.filter((item) => item.id !== id);
		}
	};

	const startEdit = (item: NavigationItemRow): void => {
		editingId.value = item.id;
		editLabel.value = item.label.en ?? Object.values(item.label)[0] ?? "";
		editHref.value = item.href;
		editError.value = null;
	};

	const cancelEdit = (): void => {
		editingId.value = null;
		editError.value = null;
	};

	const handleSaveEdit = async (id: string): Promise<void> => {
		const label = editLabel.value.trim();
		const href = editHref.value.trim();

		if (!label || !href) {
			editError.value = "Label and URL are required";
			return;
		}

		saving.value = true;
		editError.value = null;

		const { data: updated, error } = await api.navigation({ id }).patch({ label: { en: label }, href });

		saving.value = false;

		if (error || !updated) {
			editError.value = error ? (extractApiError(error) ?? "Failed to save") : "Failed to save";
			return;
		}

		items.value = items.value.map((item) => (item.id === id ? { ...item, label: { en: label }, href } : item));
		editingId.value = null;
	};

	const handleAdd = async (): Promise<void> => {
		const label = newLabel.value.trim();
		const href = newHref.value.trim();

		if (!label || !href) {
			addError.value = "Label and URL are required";
			return;
		}

		saving.value = true;
		addError.value = null;

		const nextOrder = items.value.length;
		const { data: created, error } = await api.navigation.post({ label: { en: label }, href, order: nextOrder });

		saving.value = false;

		if (error || !created) {
			addError.value = error ? (extractApiError(error) ?? "Failed to add item") : "Failed to add item";
			return;
		}

		items.value = [...items.value, created as NavigationItemRow];
		newLabel.value = "";
		newHref.value = "";
		adding.value = false;
	};

	const handleDragStart = (id: string): void => {
		draggingId.value = id;
	};

	const handleDragOver = (event: DragEvent, id: string): void => {
		event.preventDefault();
		if (id !== draggingId.value) {
			dragOverId.value = id;
		}
	};

	const handleDrop = async (event: DragEvent): Promise<void> => {
		event.preventDefault();
		const fromId = draggingId.value;
		const toId = dragOverId.value;

		draggingId.value = null;
		dragOverId.value = null;

		if (!fromId || !toId || fromId === toId) return;

		const list = [...items.value];
		const fromIndex = list.findIndex((item) => item.id === fromId);
		const toIndex = list.findIndex((item) => item.id === toId);

		if (fromIndex === -1 || toIndex === -1) return;

		const [moved] = list.splice(fromIndex, 1);
		list.splice(toIndex, 0, moved);

		const reordered = list.map((item, index) => ({ ...item, order: index }));
		items.value = reordered;

		await api.navigation.reorder.patch({ orderedIds: reordered.map((item) => item.id) });
	};

	const handleDragEnd = (): void => {
		draggingId.value = null;
		dragOverId.value = null;
	};

	return (
		<div class="h-full overflow-y-auto p-5">
			<div>
				<div class="text-[11px] font-semibold uppercase tracking-wider text-text0 mb-3">Navigation</div>
				<div class="text-[11px] text-text1 mb-3.5" style={{ marginTop: -4 }}>
					Manage navigation menu items and their order.
				</div>

				{items.value.length === 0 && !adding.value && (
					<div class="text-[11px] text-text2 py-4">No navigation items yet.</div>
				)}

				<ul class="list-none m-0 p-0">
					{items.value.map((item, index) => (
						<li
							key={item.id}
							draggable
							onDragStart={() => handleDragStart(item.id)}
							onDragOver={(event: DragEvent) => handleDragOver(event, item.id)}
							onDrop={handleDrop}
							onDragEnd={handleDragEnd}
							class={`flex items-center gap-2 py-2.5 cursor-grab active:cursor-grabbing ${draggingId.value === item.id ? DRAG_CLASS : ""}`}
							style={{
								borderBottom: index < items.value.length - 1 ? "1px solid var(--border)" : "none",
								outline: dragOverId.value === item.id ? "1px dashed var(--border-hover)" : "none",
								outlineOffset: "2px",
							}}
						>
							<span class="text-[11px] text-text2 select-none" aria-hidden="true">
								⠿
							</span>

							{editingId.value === item.id ? (
								<div class="flex-1 flex flex-col gap-1.5">
									<div class="flex gap-2">
										<input
											type="text"
											placeholder="Label"
											value={editLabel.value}
											onInput={(event: Event & { currentTarget: HTMLInputElement }) => {
												editLabel.value = event.currentTarget.value;
											}}
											class="bg-bg1 border border-ui-border rounded text-[11px] text-text0 px-2 py-1.5 outline-none focus:border-ui-border-hover flex-1"
										/>
										<input
											type="text"
											placeholder="URL (e.g. /about)"
											value={editHref.value}
											onInput={(event: Event & { currentTarget: HTMLInputElement }) => {
												editHref.value = event.currentTarget.value;
											}}
											class="bg-bg1 border border-ui-border rounded text-[11px] text-text0 px-2 py-1.5 outline-none focus:border-ui-border-hover flex-1"
										/>
									</div>
									{editError.value && <p class="text-[10px] text-coral">{editError.value}</p>}
									<div class="flex gap-2">
										<button
											type="button"
											onClick={() => handleSaveEdit(item.id)}
											disabled={saving.value}
											class="text-[11px] text-text0 bg-transparent border border-ui-border rounded px-2 py-1 cursor-pointer hover:border-ui-border-hover transition-colors disabled:opacity-50"
										>
											Save
										</button>
										<button
											type="button"
											onClick={cancelEdit}
											class="text-[11px] text-text2 bg-transparent border-none cursor-pointer hover:text-text0 transition-colors"
										>
											Cancel
										</button>
									</div>
								</div>
							) : (
								<>
									<div class="flex-1 min-w-0">
										<span class="text-[11px] text-text0 block truncate">
											{item.label.en ?? Object.values(item.label)[0] ?? "—"}
										</span>
										<span class="text-[10px] text-text2 font-mono block truncate">{item.href}</span>
									</div>
									<button
										type="button"
										onClick={() => startEdit(item)}
										class="text-text2 text-[11px] bg-transparent border-none cursor-pointer px-1 py-0.5 hover:text-text0 transition-colors"
									>
										Edit
									</button>
									<button
										type="button"
										onClick={() => handleDelete(item.id)}
										class="text-text2 text-[13px] leading-none bg-transparent border-none cursor-pointer px-1 py-0.5 hover:text-coral transition-colors"
									>
										×
									</button>
								</>
							)}
						</li>
					))}
				</ul>

				{adding.value && (
					<div class="py-3" style={{ borderTop: items.value.length > 0 ? "1px solid var(--border)" : "none" }}>
						<div class="flex gap-2 mb-2">
							<input
								type="text"
								placeholder="Label (e.g. About)"
								value={newLabel.value}
								onInput={(event: Event & { currentTarget: HTMLInputElement }) => {
									newLabel.value = event.currentTarget.value;
								}}
								class="bg-bg1 border border-ui-border rounded text-[11px] text-text0 px-2 py-1.5 outline-none focus:border-ui-border-hover flex-1"
							/>
							<input
								type="text"
								placeholder="URL (e.g. /about)"
								value={newHref.value}
								onInput={(event: Event & { currentTarget: HTMLInputElement }) => {
									newHref.value = event.currentTarget.value;
								}}
								class="bg-bg1 border border-ui-border rounded text-[11px] text-text0 px-2 py-1.5 outline-none focus:border-ui-border-hover flex-1"
							/>
						</div>
						{addError.value && <p class="text-[10px] text-coral mb-2">{addError.value}</p>}
						<div class="flex gap-2">
							<button
								type="button"
								onClick={handleAdd}
								disabled={saving.value}
								class="text-[11px] text-text0 bg-transparent border border-ui-border rounded px-2 py-1 cursor-pointer hover:border-ui-border-hover transition-colors disabled:opacity-50"
							>
								Add
							</button>
							<button
								type="button"
								onClick={() => {
									adding.value = false;
									addError.value = null;
									newLabel.value = "";
									newHref.value = "";
								}}
								class="text-[11px] text-text2 bg-transparent border-none cursor-pointer hover:text-text0 transition-colors"
							>
								Cancel
							</button>
						</div>
					</div>
				)}

				{!adding.value && (
					<div style={{ marginTop: items.value.length > 0 ? "8px" : "0" }}>
						<button
							type="button"
							onClick={() => {
								adding.value = true;
								addError.value = null;
							}}
							class="text-[11px] text-text2 bg-transparent border-none cursor-pointer hover:text-text0 transition-colors p-0"
						>
							+ Add item
						</button>
					</div>
				)}
			</div>
		</div>
	);
}
