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
		<Button
			variant={confirming.value ? "danger" : "default"}
			size="sm"
			loading={loading.value}
			onClick={handleClick}
			onBlur={handleBlur}
		>
			{confirming.value ? "Confirm?" : "Delete"}
		</Button>
	);
}
