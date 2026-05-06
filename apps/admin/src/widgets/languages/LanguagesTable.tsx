import { useSignal } from "@preact/signals";
import { Button } from "@repo/ui/Button";
import { Input } from "@repo/ui/Input";
import type { JSX } from "preact";

export interface LanguageRow {
	id: string;
	code: string;
	label: string;
	isActive: boolean;
}

interface LanguagesTableProps {
	initialLanguages: LanguageRow[];
	apiUrl: string;
}

export function LanguagesTable({ initialLanguages, apiUrl }: LanguagesTableProps): JSX.Element {
	const languages = useSignal<LanguageRow[]>(initialLanguages);
	const adding = useSignal(false);
	const newCode = useSignal("");
	const newLabel = useSignal("");
	const addError = useSignal<string | null>(null);
	const saving = useSignal(false);

	const handleToggleActive = async (id: string, current: boolean): Promise<void> => {
		const res = await fetch(`${apiUrl}/languages/${id}`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({ isActive: !current }),
		}).catch(() => null);

		if (res?.ok) {
			languages.value = languages.value.map((lang) => (lang.id === id ? { ...lang, isActive: !current } : lang));
		}
	};

	const handleDelete = async (id: string): Promise<void> => {
		const res = await fetch(`${apiUrl}/languages/${id}`, {
			method: "DELETE",
			credentials: "include",
		}).catch(() => null);

		if (res?.ok || res?.status === 204) {
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

		const res = await fetch(`${apiUrl}/languages`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
			body: JSON.stringify({ code, label, isActive: true }),
		}).catch(() => null);

		saving.value = false;

		if (!res?.ok) {
			const body = (await res?.json().catch(() => null)) as { error?: string } | null;
			addError.value = body?.error ?? "Failed to add language";
			return;
		}

		const created = (await res.json()) as LanguageRow;
		languages.value = [...languages.value, created];
		newCode.value = "";
		newLabel.value = "";
		adding.value = false;
	};

	return (
		<div class="p-5 px-6 max-w-2xl">
			<div class="border border-ui-border rounded-lg overflow-hidden mb-4">
				<table class="w-full border-collapse text-xs">
					<thead>
						<tr class="bg-bg1 border-b border-ui-border">
							<Th>Code</Th>
							<Th>Label</Th>
							<Th>Status</Th>
							<Th align="right">Actions</Th>
						</tr>
					</thead>
					<tbody>
						{languages.value.length === 0 ? (
							<tr>
								<td colSpan={4} class="py-10 text-center text-text2 text-xs">
									No languages yet.
								</td>
							</tr>
						) : (
							languages.value.map((lang) => (
								<tr key={lang.id} class="border-b border-ui-border last:border-0">
									<td class="py-2.5 px-3.5 text-text0 font-mono font-medium uppercase">{lang.code}</td>
									<td class="py-2.5 px-3.5 text-text1">{lang.label}</td>
									<td class="py-2.5 px-3.5">
										<button
											type="button"
											onClick={() => handleToggleActive(lang.id, lang.isActive)}
											class={`inline-flex items-center gap-1.5 rounded text-[10px] font-semibold px-1.5 py-0.5 tracking-[0.04em] border transition-colors ${
												lang.isActive
													? "bg-green/10 text-green border-green/20 hover:bg-green/20"
													: "bg-bg3 text-text2 border-ui-border hover:border-ui-border-hover"
											}`}
										>
											<span class={`w-1.5 h-1.5 rounded-full ${lang.isActive ? "bg-green" : "bg-text3"}`} />
											{lang.isActive ? "Active" : "Inactive"}
										</button>
									</td>
									<td class="py-2.5 px-3.5 text-right">
										<DeleteButton onDelete={() => handleDelete(lang.id)} />
									</td>
								</tr>
							))
						)}
					</tbody>
				</table>
			</div>

			{adding.value ? (
				<div class="border border-ui-border rounded-lg p-4 bg-bg0">
					<div class="text-[11px] text-text0 font-medium mb-3">Add language</div>
					<div class="flex gap-2 mb-2">
						<Input
							placeholder="Code (e.g. en)"
							value={newCode.value}
							onInput={(event) => {
								newCode.value = (event.target as HTMLInputElement).value;
							}}
							class="w-24"
						/>
						<Input
							placeholder="Label (e.g. English)"
							value={newLabel.value}
							onInput={(event) => {
								newLabel.value = (event.target as HTMLInputElement).value;
							}}
							class="flex-1"
						/>
					</div>
					{addError.value && <p class="text-[10px] text-coral mb-2">{addError.value}</p>}
					<div class="flex gap-2">
						<Button size="sm" variant="primary" loading={saving.value} onClick={handleAdd}>
							Add
						</Button>
						<Button
							size="sm"
							variant="default"
							onClick={() => {
								adding.value = false;
								addError.value = null;
								newCode.value = "";
								newLabel.value = "";
							}}
						>
							Cancel
						</Button>
					</div>
				</div>
			) : (
				<button
					type="button"
					onClick={() => {
						adding.value = true;
					}}
					class="flex items-center gap-1.5 text-[11px] text-text2 hover:text-text0 transition-colors"
				>
					<span class="text-base leading-none">+</span> Add language
				</button>
			)}
		</div>
	);
}

// ── Internal helpers ──────────────────────────────────

interface ThProps {
	children: string;
	align?: "left" | "right";
}

const Th = ({ children, align = "left" }: ThProps): JSX.Element => (
	<th
		class={`py-2 px-3.5 text-text2 font-medium text-[11px] uppercase tracking-[0.03em] ${align === "right" ? "text-right" : "text-left"}`}
	>
		{children}
	</th>
);

interface DeleteButtonProps {
	onDelete: () => void;
}

const DeleteButton = ({ onDelete }: DeleteButtonProps): JSX.Element => {
	const confirming = useSignal(false);

	return confirming.value ? (
		<div class="inline-flex gap-1">
			<button
				type="button"
				onClick={onDelete}
				class="border border-coral/40 rounded text-coral text-[11px] px-2 py-1 hover:bg-coral/10 transition-colors"
			>
				Confirm
			</button>
			<button
				type="button"
				onClick={() => {
					confirming.value = false;
				}}
				class="border border-ui-border rounded text-text2 text-[11px] px-2 py-1 hover:border-ui-border-hover transition-colors"
			>
				Cancel
			</button>
		</div>
	) : (
		<button
			type="button"
			onClick={() => {
				confirming.value = true;
			}}
			class="border border-ui-border rounded text-text1 text-[11px] px-2 py-1 hover:border-ui-border-hover transition-colors"
		>
			Delete
		</button>
	);
};
