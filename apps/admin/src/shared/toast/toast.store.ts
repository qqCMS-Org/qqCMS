import { signal } from "@preact/signals";

export type ToastType = "info" | "success" | "warning" | "error";

export interface ToastItem {
	id: string;
	title: string;
	description?: string;
	type: ToastType;
	delay: number;
	removing: boolean;
}

export const DISMISS_DURATION = 250;

const DEFAULT_DELAY = 4000;

export const toasts = signal<ToastItem[]>([]);

export const toast = ({
	title,
	description,
	type = "info",
	delay = DEFAULT_DELAY,
}: {
	title: string;
	description?: string;
	type?: ToastType;
	delay?: number;
}): string => {
	const id = crypto.randomUUID();
	toasts.value = [{ id, title, description, type, delay, removing: false }, ...toasts.value];
	return id;
};

export const dismissToast = (id: string): void => {
	const item = toasts.value.find((toastItem) => toastItem.id === id);
	if (!item || item.removing) return;

	toasts.value = toasts.value.map((toastItem) => (toastItem.id === id ? { ...toastItem, removing: true } : toastItem));

	setTimeout(() => {
		toasts.value = toasts.value.filter((toastItem) => toastItem.id !== id);
	}, DISMISS_DURATION);
};
