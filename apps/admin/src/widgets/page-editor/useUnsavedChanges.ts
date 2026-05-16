import { useSignal } from "@preact/signals";
import type { ModalControls } from "@shared/modal";
import { useModal } from "@shared/modal";
import { useEffect } from "preact/hooks";

export interface UnsavedChangesHook {
	isDirty: { value: boolean };
	markDirty: () => void;
	resetDirty: () => void;
	navigateTo: (href: string) => void;
	confirmNavigation: () => void;
	modal: ModalControls;
}

export const useUnsavedChanges = (): UnsavedChangesHook => {
	const isDirty = useSignal(false);
	const pendingHref = useSignal("");
	const modal = useModal();

	useEffect(() => {
		const handleBeforeUnload = (event: BeforeUnloadEvent) => {
			if (isDirty.value) {
				event.preventDefault();
			}
		};
		window.addEventListener("beforeunload", handleBeforeUnload);
		return () => window.removeEventListener("beforeunload", handleBeforeUnload);
	}, []);

	const markDirty = (): void => {
		isDirty.value = true;
	};

	const resetDirty = (): void => {
		isDirty.value = false;
	};

	const navigateTo = (href: string): void => {
		if (isDirty.value) {
			pendingHref.value = href;
			modal.show();
		} else {
			window.location.href = href;
		}
	};

	const confirmNavigation = (): void => {
		isDirty.value = false;
		window.location.href = pendingHref.value;
	};

	return { isDirty, markDirty, resetDirty, navigateTo, confirmNavigation, modal };
};
