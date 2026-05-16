import { Button, Input } from "@repo/ui";
import { api, extractApiError } from "@shared/api/client";
import { MediaSelect } from "@shared/MediaSelect";
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
	const [settingsMap, setSettingsMap] = useState<Record<string, string>>(() => {
		const map: Record<string, string> = {
			siteName: "",
			siteLogo: "",
			siteIcon: "",
			apiUrl: "",
		};
		initialSettings.forEach((s) => {
			if (typeof s.value === "string") {
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

	const handleChange = (key: string, value: string | null) => {
		setSettingsMap((prev) => ({ ...prev, [key]: value || "" }));
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
					throw new Error(extractApiError(res.error) ?? `Failed to save ${key}`);
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
			const res = await api.settings.rebuilds.post();
			if (res.error) {
				throw new Error(extractApiError(res.error) ?? "Failed to trigger rebuild");
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
					onClick={() => handleSave(["siteName", "siteLogo", "siteIcon", "apiUrl"])}
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

			<SettingsBlock id="site" title="Site Branding">
				<FormRow label="Site name" hint="Display name shown in the header and browser tab.">
					<Input
						value={settingsMap.siteName || ""}
						onChange={(e) => handleChange("siteName", e.currentTarget.value)}
						placeholder="My qqCMS Site"
					/>
				</FormRow>

				<div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
					<MediaSelect
						label="Logo"
						hint="Displayed in the admin sidebar and web header."
						value={settingsMap.siteLogo}
						onChange={(id) => handleChange("siteLogo", id)}
					/>
					<MediaSelect
						label="Icon"
						hint="Favicon for the browser tab (ICO/PNG/SVG)."
						value={settingsMap.siteIcon}
						onChange={(id) => handleChange("siteIcon", id)}
					/>
				</div>
			</SettingsBlock>

			<SettingsBlock id="api" title="API">
				<FormRow
					label="Public URL"
					hint="Domain or host where the API is accessible (e.g. localhost:3000 or api.example.com)."
				>
					<Input
						value={settingsMap.apiUrl || ""}
						onChange={(e) => handleChange("apiUrl", e.currentTarget.value)}
						placeholder="localhost:3000"
					/>
				</FormRow>
			</SettingsBlock>

			<SettingsBlock id="rebuild" title="Rebuild">
				<div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
					<div>
						<div class="text-xs text-text0 mb-1">Trigger site rebuild</div>
						<div class="text-[11px] text-text1">
							Manually calls the configured rebuild webhook to deploy the static frontend.
						</div>
					</div>
					<Button variant="primary" loading={isRebuilding} onClick={handleRebuild} class="shrink-0">
						Rebuild site
					</Button>
				</div>
			</SettingsBlock>
		</div>
	);
};
