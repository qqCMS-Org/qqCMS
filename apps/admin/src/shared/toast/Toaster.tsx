import { useSignal, useSignalEffect } from "@preact/signals";
import type { JSX } from "preact";
import { useEffect, useRef } from "preact/hooks";
import { DISMISS_DURATION, dismissToast, type ToastItem, type ToastType, toasts } from "./toast.store";

interface TimerEntry {
	timeoutId: ReturnType<typeof setTimeout> | undefined;
	remainingMs: number;
	endsAt: number | undefined;
}

const TOAST_WIDTH = 360;
const STACK_PEEK_Y = 10;
const STACK_SCALE_STEP = 0.04;
const EXPANDED_GAP = 8;
const MAX_VISIBLE_COLLAPSED = 3;

interface TypeConfig {
	dot: string;
	border: string;
}

const TYPE_CONFIG: Record<ToastType, TypeConfig> = {
	info: { dot: "bg-text2", border: "border-ui-border" },
	success: { dot: "bg-green", border: "border-green/30" },
	warning: { dot: "bg-amber", border: "border-amber/30" },
	error: { dot: "bg-coral", border: "border-coral/30" },
};

interface ToastCardProps {
	item: ToastItem;
	index: number;
	total: number;
	isHovered: boolean;
	expandedOffsetY: number;
	onHeight: (id: string, height: number) => void;
}

function ToastCard({ item, index, total, isHovered, expandedOffsetY, onHeight }: ToastCardProps): JSX.Element {
	const ref = useRef<HTMLDivElement>(null);
	const entered = useSignal(false);

	useEffect(() => {
		const rafId = requestAnimationFrame(() => {
			entered.value = true;
		});
		return () => cancelAnimationFrame(rafId);
	}, []);

	useEffect(() => {
		if (ref.current) {
			onHeight(item.id, ref.current.offsetHeight);
		}
	});

	const config = TYPE_CONFIG[item.type];
	const isHiddenCollapsed = !isHovered && index >= MAX_VISIBLE_COLLAPSED;

	const scale = isHovered ? 1 : Math.max(0.88, 1 - index * STACK_SCALE_STEP);
	const translateY = isHovered ? expandedOffsetY : index * STACK_PEEK_Y;
	const enterTranslateY = entered.value && !item.removing ? 0 : -16;

	let opacity = 1;
	if (!entered.value || item.removing || isHiddenCollapsed) opacity = 0;

	return (
		<div
			ref={ref}
			style={{
				position: "absolute",
				top: 0,
				left: 0,
				right: 0,
				transform: `translateY(calc(${translateY}px + ${enterTranslateY}px)) scale(${scale})`,
				transformOrigin: "top center",
				zIndex: total - index,
				opacity,
				transition: `transform ${DISMISS_DURATION}ms cubic-bezier(0.16, 1, 0.3, 1), opacity ${DISMISS_DURATION}ms ease`,
				pointerEvents: isHiddenCollapsed ? "none" : "auto",
			}}
		>
			<div class={`bg-bg0 border ${config.border} rounded-xl px-4 py-3 shadow-lg`}>
				<div class="flex items-start gap-3">
					<span class={`mt-[3px] w-1.5 h-1.5 rounded-full shrink-0 ${config.dot}`} />
					<div class="flex-1 min-w-0">
						<p class="text-[12px] font-medium text-text0 leading-snug">{item.title}</p>
						{item.description && <p class="text-[11px] text-text2 mt-0.5 leading-snug">{item.description}</p>}
					</div>
					<button
						type="button"
						onClick={() => dismissToast(item.id)}
						class="text-text2 hover:text-text0 transition-colors shrink-0 cursor-pointer border-none bg-transparent p-0 leading-none text-base"
						aria-label="Close"
					>
						×
					</button>
				</div>
			</div>
		</div>
	);
}

export function Toaster(): JSX.Element | null {
	const isHovered = useSignal(false);
	const heights = useSignal<Record<string, number>>({});
	const timersRef = useRef<Map<string, TimerEntry>>(new Map());

	const startTimer = (id: string, remainingMs: number): void => {
		const timeoutId = setTimeout(() => dismissToast(id), remainingMs);
		timersRef.current.set(id, { timeoutId, remainingMs, endsAt: Date.now() + remainingMs });
	};

	useSignalEffect(() => {
		const items = toasts.value;

		for (const [id, entry] of timersRef.current) {
			if (!items.find((item) => item.id === id)) {
				if (entry.timeoutId !== undefined) clearTimeout(entry.timeoutId);
				timersRef.current.delete(id);
			}
		}

		for (const item of items) {
			if (item.delay > 0 && !item.removing && !timersRef.current.has(item.id)) {
				if (!isHovered.peek()) {
					startTimer(item.id, item.delay);
				} else {
					timersRef.current.set(item.id, { timeoutId: undefined, remainingMs: item.delay, endsAt: undefined });
				}
			}
		}
	});

	useEffect(() => {
		return () => {
			for (const [, entry] of timersRef.current) {
				if (entry.timeoutId !== undefined) clearTimeout(entry.timeoutId);
			}
			timersRef.current.clear();
		};
	}, []);

	const handleMouseEnter = (): void => {
		isHovered.value = true;
		for (const [id, entry] of timersRef.current) {
			if (entry.timeoutId !== undefined && entry.endsAt !== undefined) {
				clearTimeout(entry.timeoutId);
				const remainingMs = Math.max(0, entry.endsAt - Date.now());
				timersRef.current.set(id, { timeoutId: undefined, remainingMs, endsAt: undefined });
			}
		}
	};

	const handleMouseLeave = (): void => {
		isHovered.value = false;
		const items = toasts.peek();
		for (const [id, entry] of timersRef.current) {
			const item = items.find((toastItem) => toastItem.id === id);
			if (item && !item.removing && entry.remainingMs > 0 && entry.timeoutId === undefined) {
				startTimer(id, entry.remainingMs);
			}
		}
	};

	const handleHeight = (id: string, h: number): void => {
		if (heights.peek()[id] !== h) {
			heights.value = { ...heights.peek(), [id]: h };
		}
	};

	const items = toasts.value;
	if (items.length === 0) return null;

	const expandedOffsets: number[] = [];
	let accumulated = 0;
	for (const item of items) {
		expandedOffsets.push(accumulated);
		accumulated += (heights.value[item.id] ?? 56) + EXPANDED_GAP;
	}

	const firstHeight = heights.value[items[0]?.id ?? ""] ?? 56;
	const visiblePeekLevels = Math.min(items.length - 1, MAX_VISIBLE_COLLAPSED - 1);
	const collapsedHeight = firstHeight + STACK_PEEK_Y * visiblePeekLevels;
	const containerHeight = isHovered.value ? accumulated : collapsedHeight;

	return (
		<section
			aria-label="Notifications"
			style={{
				position: "fixed",
				top: "16px",
				left: "50%",
				transform: "translateX(-50%)",
				width: `${TOAST_WIDTH}px`,
				height: `${containerHeight}px`,
				zIndex: 9999,
				transition: `height ${DISMISS_DURATION}ms cubic-bezier(0.16, 1, 0.3, 1)`,
			}}
			onMouseEnter={handleMouseEnter}
			onMouseLeave={handleMouseLeave}
		>
			{items.map((item, index) => (
				<ToastCard
					key={item.id}
					item={item}
					index={index}
					total={items.length}
					isHovered={isHovered.value}
					expandedOffsetY={expandedOffsets[index] ?? 0}
					onHeight={handleHeight}
				/>
			))}
		</section>
	);
}
