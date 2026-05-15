import type { ComponentChildren, JSX } from "preact";

interface ModalProps {
	isOpen: boolean;
	onClose: () => void;
	children: ComponentChildren;
}

export function Modal({ isOpen, onClose, children }: ModalProps): JSX.Element | null {
	if (!isOpen) return null;
	return (
		<>
			<button
				type="button"
				aria-label="Close modal"
				class="fixed inset-0 z-100 bg-black/50 cursor-default border-none p-0"
				onClick={onClose}
			/>
			<div class="fixed inset-0 z-100 flex items-center justify-center pointer-events-none">
				<div
					class="bg-bg0 border border-ui-border rounded-xl p-6 max-w-sm w-full mx-4 shadow-2xl pointer-events-auto"
					role="dialog"
					aria-modal="true"
				>
					{children}
				</div>
			</div>
		</>
	);
}
