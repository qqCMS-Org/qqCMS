import { Button, Input } from "@repo/ui";
import { api } from "@shared/api/client";
import type { ComponentChildren } from "preact";
import { useState } from "preact/compat";

export interface SettingRow {
	id: string;
	key: string;
	value: unknown;
}

interface SettingsFormProps {
	initialSettings: SettingRow[];
}

const SettingsBlock = ({
	id,
	title,
	danger,
	children,
}: {
	id: string;
	title: string;
	danger?: boolean;
	children: ComponentChildren;
}) => (
	<div
		id={id}
		class={`rounded-lg p-4 mb-3 border ${danger ? "bg-coral-faint border-coral/25" : "bg-bg2 border-ui-border"}`}
	>
		<div class={`font-serif italic text-[17px] mb-3.5 ${danger ? "text-coral" : "text-text0"}`}>{title}</div>
		{children}
	</div>
);

const FormRow = ({ label, hint, children }: { label: string; hint?: string; children: ComponentChildren }) => (
	<div class="mb-4 last:mb-0">
		<div class="text-[12px] text-text0 mb-1">{label}</div>
		{hint && <div class="text-[10px] text-text1 mb-2">{hint}</div>}
		<div>{children}</div>
	</div>
);

export const SettingsForm = ({ initialSettings }: SettingsFormProps) => {
	const [settingsMap, setSettingsMap] = useState<Record<string, unknown>>(() => {
		const map: Record<string, unknown> = {
			projectName: "",
			adminUrl: "",
			apiUrl: "",
			contentApiKey: "",
		};
		initialSettings.forEach((s) => {
			if (s.value !== undefined) {
				map[s.key] = s.value;
			}
		});
		return map;
	});

	const [isSaving, setIsSaving] = useState(false);
	const [isRebuilding, setIsRebuilding] = useState(false);
	const [message, setMessage] = useState<{
		text: string;
		type: "success" | "error";
	} | null>(null);

	const handleChange = (key: string, value: unknown) => {
		setSettingsMap((prev) => ({ ...prev, [key]: value }));
	};

	const showMessage = (text: string, type: "success" | "error") => {
		setMessage({ text, type });
		setTimeout(() => setMessage(null), 3000);
	};

	const handleSave = async (keys: string[]) => {
		setIsSaving(true);
		setMessage(null);
		try {
			for (const key of keys) {
				const res = await api.settings({ key }).put({ value: settingsMap[key] });
				if (res.error) {
					throw new Error((res.error.value as any)?.error || `Failed to save ${key}`);
				}
			}
			showMessage("Settings saved successfully", "success");
		} catch (error) {
			showMessage(String(error), "error");
		} finally {
			setIsSaving(false);
		}
	};

	const handleRebuild = async () => {
		setIsRebuilding(true);
		setMessage(null);
		try {
			const res = await api.settings.rebuild.post();
			if (res.error) {
				throw new Error((res.error.value as any)?.error || "Failed to trigger rebuild");
			}
			showMessage("Rebuild webhook triggered successfully", "success");
		} catch (error) {
			showMessage(String(error), "error");
		} finally {
			setIsRebuilding(false);
		}
	};

	return (
		<div class="max-w-[660px]">
			<div class="flex justify-between items-center mb-5">
				<h2 class="text-base text-text0 font-medium">Global Settings</h2>
				<Button
					variant="primary"
					loading={isSaving}
					onClick={() => handleSave(["projectName", "adminUrl", "apiUrl", "contentApiKey"])}
				>
					Save all changes
				</Button>
			</div>

			{message && (
				<div
					class={`mb-5 p-2.5 rounded-[4px] text-[13px] ${
						message.type === "success" ? "bg-green-faint text-green" : "bg-coral-faint text-coral"
					}`}
				>
					{message.text}
				</div>
			)}

			<SettingsBlock id="project" title="Project">
				<FormRow label="Project name" hint="Display name shown in the browser tab.">
					<Input
						value={(settingsMap.projectName as string) || ""}
						onChange={(e) => handleChange("projectName", (e.target as HTMLInputElement).value)}
						placeholder="My qqCMS Project"
					/>
				</FormRow>
				<FormRow label="Admin URL" hint="Base URL for the admin interface.">
					<Input
						value={(settingsMap.adminUrl as string) || ""}
						onChange={(e) => handleChange("adminUrl", (e.target as HTMLInputElement).value)}
						placeholder="https://admin.example.com"
					/>
				</FormRow>
			</SettingsBlock>

			<SettingsBlock id="api" title="API">
				<FormRow label="API URL" hint="Public-facing base URL for the API.">
					<Input
						value={(settingsMap.apiUrl as string) || ""}
						onChange={(e) => handleChange("apiUrl", (e.target as HTMLInputElement).value)}
						placeholder="https://api.example.com"
					/>
				</FormRow>
				<FormRow label="Content API key" hint="Read-only key for public content access.">
					<div class="flex gap-2">
						<Input
							value={(settingsMap.contentApiKey as string) || ""}
							onChange={(e) => handleChange("contentApiKey", (e.target as HTMLInputElement).value)}
							class="flex-1"
						/>
					</div>
				</FormRow>
			</SettingsBlock>

			<SettingsBlock id="danger" title="Danger Zone" danger>
				<div class="text-[11px] text-text1 mb-4 -mt-1">Irreversible and destructive actions.</div>
				<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 py-3">
					<div>
						<div class="text-xs text-text0 mb-1">Trigger site rebuild</div>
						<div class="text-[11px] text-text1">
							Manually calls the configured rebuild webhook to deploy the static frontend.
						</div>
					</div>
					<Button variant="danger" loading={isRebuilding} onClick={handleRebuild} class="shrink-0">
						Rebuild site
					</Button>
				</div>
			</SettingsBlock>
		</div>
	);
};
