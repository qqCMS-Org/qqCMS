import { useSignal } from "@preact/signals";
import { api } from "@shared/api/client";
import type { JSX } from "preact";

export function LogoutButton(): JSX.Element {
	const loading = useSignal(false);

	const handleLogout = async (): Promise<void> => {
		loading.value = true;
		await api.auth.logout.post().catch(() => null);
		window.location.href = "/login";
	};

	return (
		<button
			type="button"
			onClick={handleLogout}
			disabled={loading.value}
			className={`rounded-[5px] border bg-transparent px-[10px] py-1 text-[11px] ${
				loading.value ? "cursor-not-allowed opacity-50" : "cursor-pointer opacity-100"
			}`}
		>
			{loading.value ? "..." : "Log out"}
		</button>
	);
}
