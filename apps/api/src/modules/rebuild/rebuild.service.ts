import { config } from "@api/config";
import { Logger } from "@core/Logger";

const REBUILD_SECRET_HEADER = "x-revalidate-secret";

export const triggerRebuild = async (): Promise<boolean> => {
	if (!config.publicClientUrl) return true;

	const url = `${config.publicClientUrl}/api/revalidate`;

	const response = await fetch(url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			[REBUILD_SECRET_HEADER]: config.revalidateSecret,
		},
	}).catch((error: unknown) => {
		Logger.error(`Rebuild webhook failed: ${error}`);
		return null;
	});

	if (!response) return false;

	if (!response.ok) {
		Logger.error(`Rebuild webhook returned ${response.status}`);
		return false;
	}

	return true;
};
