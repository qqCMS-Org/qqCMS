import { useSignal } from "@preact/signals";
import { api, extractApiError } from "@shared/api/client";
import type { JSX } from "preact";

export interface LanguageRow {
	id: string;
	code: string;
	label: string;
	isActive: boolean;
	isDefault: boolean;
}

interface LanguagesTableProps {
	initialLanguages: LanguageRow[];
}

export function LanguagesTable({ initialLanguages }: LanguagesTableProps): JSX.Element {
	const languages = useSignal<LanguageRow[]>(initialLanguages);
	const adding = useSignal(false);
	const newCode = useSignal("");
	const newLabel = useSignal("");
	const addError = useSignal<string | null>(null);
	const saving = useSignal(false);

	const handleToggleActive = async (id: string, current: boolean): Promise<void> => {
		const { error } = await api.languages({ id }).patch({ isActive: !current });

		if (!error) {
			languages.value = languages.value.map((lang) => (lang.id === id ? { ...lang, isActive: !current } : lang));
		}
	};

	const handleSetDefault = async (id: string): Promise<void> => {
		const { error } = await api.languages({ id }).patch({ isDefault: true });

		if (!error) {
			languages.value = languages.value.map((lang) => ({ ...lang, isDefault: lang.id === id }));
		}
	};

	const handleDelete = async (id: string): Promise<void> => {
		const { error } = await api.languages({ id }).delete();

		if (!error) {
			languages.value = languages.value.filter((lang) => lang.id !== id);
		}
	};

	const handleAdd = async (): Promise<void> => {
		const code = newCode.value.trim().toLowerCase();
		const label = newLabel.value.trim();

		if (!code || !label) {
			addError.value = "Both code and label are required";
			return;
		}

		saving.value = true;
		addError.value = null;

		const { data: created, error } = await api.languages.post({ code, label, isActive: true });

		saving.value = false;

		if (error || !created) {
			addError.value = error ? (extractApiError(error) ?? "Failed to add language") : "Failed to add language";
			return;
		}

		languages.value = [...languages.value, created];
		newCode.value = "";
		newLabel.value = "";
		adding.value = false;
	};

	return (
		<div class="h-full overflow-y-auto p-5">
			<div>
				<div class="text-[11px] font-semibold uppercase tracking-wider text-text0 mb-3">Localization</div>
				<div class="text-[11px] text-text1 mb-3.5" style={{ marginTop: -4 }}>
					Manage the languages available for your content.
				</div>

				{languages.value.length === 0 && !adding.value && (
					<div class="text-[11px] text-text2 py-4">No languages configured yet.</div>
				)}

				{languages.value.map((lang, index) => (
					<div
						key={lang.id}
						class="flex items-center gap-2 py-2.5"
						style={{ borderBottom: index < languages.value.length - 1 ? "1px solid var(--border)" : "none" }}
					>
						<span class="text-[10px] text-text2 font-mono w-5 shrink-0">{lang.code}</span>
						<span class="text-[11px] text-text0 flex-1">{lang.label}</span>
						{lang.isDefault ? (
							<span class="text-[10px] text-accent font-medium px-1.5 py-0.5 rounded bg-accent-faint border border-accent/20">
								default
							</span>
						) : (
							<button
								type="button"
								onClick={() => handleSetDefault(lang.id)}
								class="text-[10px] text-text2 bg-transparent border border-ui-border rounded px-1.5 py-0.5 cursor-pointer hover:text-text0 hover:border-ui-border-hover transition-colors"
							>
								Set default
							</button>
						)}
						<Toggle value={lang.isActive} onChange={() => handleToggleActive(lang.id, lang.isActive)} />
						<button
							type="button"
							onClick={() => handleDelete(lang.id)}
							class="text-text2 text-[13px] leading-none bg-transparent border-none cursor-pointer px-1 py-0.5 hover:text-coral transition-colors"
						>
							×
						</button>
					</div>
				))}

				{adding.value && (
					<div class="py-3" style={{ borderTop: languages.value.length > 0 ? "1px solid var(--border)" : "none" }}>
						<div class="flex gap-2 mb-2">
							<input
								type="text"
								placeholder="Code (e.g. en)"
								value={newCode.value}
								onInput={(event: Event & { currentTarget: HTMLInputElement }) => {
									newCode.value = event.currentTarget.value;
								}}
								class="bg-bg1 border border-ui-border rounded text-[11px] text-text0 px-2 py-1.5 outline-none focus:border-ui-border-hover w-24"
							/>
							<input
								type="text"
								placeholder="Label (e.g. English)"
								value={newLabel.value}
								onInput={(event: Event & { currentTarget: HTMLInputElement }) => {
									newLabel.value = event.currentTarget.value;
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
								class="text-[11px] bg-accent text-white border-none rounded px-3 py-1.5 cursor-pointer hover:bg-accent-hover transition-colors disabled:opacity-40"
							>
								{saving.value ? "Adding…" : "Add"}
							</button>
							<button
								type="button"
								onClick={() => {
									adding.value = false;
									addError.value = null;
									newCode.value = "";
									newLabel.value = "";
								}}
								class="text-[11px] bg-bg3 border border-ui-border text-text0 rounded px-3 py-1.5 cursor-pointer hover:border-ui-border-hover transition-colors"
							>
								Cancel
							</button>
						</div>
					</div>
				)}

				{!adding.value && (
					<button
						type="button"
						onClick={() => {
							adding.value = true;
						}}
						class="text-[11px] text-accent bg-transparent border-none cursor-pointer mt-3 p-0 hover:opacity-80 transition-opacity"
					>
						+ Add locale
					</button>
				)}
			</div>
		</div>
	);
}

// ── Internal helpers ──────────────────────────────────

const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }): JSX.Element => (
	<button
		type="button"
		onClick={onChange}
		class={`w-8.5 h-4.75 rounded-full relative cursor-pointer transition-all shrink-0 border bg-transparent ${
			value ? "bg-accent border-accent" : "bg-bg4 border-ui-border"
		}`}
	>
		<div
			class={`w-3.25 h-3.25 rounded-full absolute top-0.5 transition-all ${
				value ? "left-4.25 bg-white" : "left-0.5 bg-text2"
			}`}
		/>
	</button>
);
