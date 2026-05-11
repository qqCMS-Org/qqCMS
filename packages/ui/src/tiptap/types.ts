import type { ComponentType } from "preact";

export interface TipTapMark {
	type: string;
	attrs?: Record<string, unknown>;
}

export interface TipTapNode {
	type: string;
	text?: string;
	marks?: TipTapMark[];
	attrs?: Record<string, unknown>;
	content?: TipTapNode[];
}

export type NodeRegistry = Record<string, ComponentType<{ node: TipTapNode }>>;
