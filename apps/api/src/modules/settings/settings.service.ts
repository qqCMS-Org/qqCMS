import { triggerRebuild } from "@modules/rebuild";
import { getSettings, upsertSetting } from "@repository/settings";

export const listSettings = () => getSettings();

export const setSetting = async (key: string, value: unknown) => {
	const [setting] = await upsertSetting(key, value);
	void triggerRebuild();
	return setting;
};
