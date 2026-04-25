import { getSettings, upsertSetting } from "@repository/settings";

export const listSettings = () => getSettings();

export const setSetting = async (key: string, value: unknown) => {
	const [setting] = await upsertSetting(key, value);
	return setting;
};
