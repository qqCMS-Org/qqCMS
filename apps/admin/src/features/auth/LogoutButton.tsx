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
			style={{
				background: "transparent",
				border: "1px solid var(--border)",
				borderRadius: 5,
				padding: "4px 10px",
				color: "var(--text1)",
				fontSize: 11,
				cursor: loading.value ? "not-allowed" : "pointer",
				opacity: loading.value ? 0.5 : 1,
			}}
		>
			{loading.value ? "..." : "Log out"}
		</button>
	);
}
