import { useSignal } from "@preact/signals";
import type { JSX } from "preact";

export interface DeletePageButtonProps {
	pageId: string;
	apiUrl: string;
	onDeleted: () => void;
}

export function DeletePageButton({ pageId, apiUrl, onDeleted }: DeletePageButtonProps): JSX.Element {
	const loading = useSignal(false);
	const confirming = useSignal(false);

	const handleClick = async (): Promise<void> => {
		if (!confirming.value) {
			confirming.value = true;
			return;
		}

		loading.value = true;

		await fetch(`${apiUrl}/pages/${pageId}`, {
			method: "DELETE",
			credentials: "include",
		}).catch(() => null);

		loading.value = false;
		confirming.value = false;
		onDeleted();
	};

	const handleBlur = (): void => {
		if (confirming.value) {
			confirming.value = false;
		}
	};

	return (
		<button
			type="button"
			onClick={handleClick}
			onBlur={handleBlur}
			disabled={loading.value}
			style={{
				background: confirming.value ? "var(--coral, #e05a5a)" : "transparent",
				border: `1px solid ${confirming.value ? "var(--coral, #e05a5a)" : "var(--border)"}`,
				borderRadius: 4,
				padding: "3px 8px",
				color: confirming.value ? "#fff" : "var(--text2)",
				fontSize: 11,
				cursor: loading.value ? "not-allowed" : "pointer",
				opacity: loading.value ? 0.5 : 1,
				transition: "all 0.15s",
				whiteSpace: "nowrap",
			}}
		>
			{loading.value ? "..." : confirming.value ? "Confirm?" : "Delete"}
		</button>
	);
}
