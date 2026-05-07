import { useSignal } from "@preact/signals";
import { Button } from "@repo/ui/Button";
import { api } from "@shared/api/client";
import type { JSX } from "preact";

export interface DeletePageButtonProps {
	pageId: string;
	onDeleted: () => void;
}

export function DeletePageButton({ pageId, onDeleted }: DeletePageButtonProps): JSX.Element {
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

		const { error: apiError } = await api.pages({ id: pageId }).delete();

		loading.value = false;

		if (apiError) {
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
