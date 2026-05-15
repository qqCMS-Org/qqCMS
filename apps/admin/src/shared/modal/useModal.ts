import type { Signal } from "@preact/signals";
import { useSignal } from "@preact/signals";

export interface ModalControls {
	isOpen: Signal<boolean>;
	show: () => void;
	hide: () => void;
}

export const useModal = (): ModalControls => {
	const isOpen = useSignal(false);
	return {
		isOpen,
		show: () => {
			isOpen.value = true;
		},
		hide: () => {
			isOpen.value = false;
		},
	};
};
