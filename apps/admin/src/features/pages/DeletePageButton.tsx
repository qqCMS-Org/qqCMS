import { useSignal } from "@preact/signals";
import { Button } from "@repo/ui/Button";
import type { JSX } from "preact";

export interface DeletePageButtonProps {
	pageId: string;
	apiUrl: string;
	onDeleted: () => void;
}

export function DeletePageButton({ pageId, apiUrl, onDeleted }: DeletePageButtonProps): JSX.Element {
	const loading = useSignal(false);
	const confirming = useSignal(false);
	const error = useSignal<string | null>(null);

	const handleClick = async (): Promise<void> => {
		if (!confirming.value) {
			confirming.value = true;
			return;
		}

		loading.value = true;
		error.value = null;

		const res = await fetch(`${apiUrl}/pages/${pageId}`, {
			method: "DELETE",
			credentials: "include",
		}).catch(() => null);

		loading.value = false;

		if (!res?.ok) {
			error.value = "Failed to delete page";
			confirming.value = false;
			return;
		}

		confirming.value = false;
		onDeleted();
	};

	const handleBlur = (): void => {
		if (confirming.value) {
			confirming.value = false;
		}
	};

	return (
		<>
			{error.value && <span class="text-[11px] text-coral">{error.value}</span>}
			<Button
				variant={confirming.value ? "danger" : "default"}
				size="sm"
				loading={loading.value}
				onClick={handleClick}
				onBlur={handleBlur}
			>
				{confirming.value ? "Confirm?" : "Delete"}
			</Button>
		</>
	);
}
