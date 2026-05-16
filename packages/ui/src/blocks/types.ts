import type { ComponentType } from "preact";

export interface BlockAttrs {
	[key: string]: string | number | boolean | undefined;
}

export interface BlockComponentProps<T extends BlockAttrs = BlockAttrs> {
	attrs: T;
	isEditing?: boolean;
	updateAttrs?: (newAttrs: Partial<T>) => void;
}

export interface BlockDefinition<T extends BlockAttrs = BlockAttrs> {
	type: string;
	label: string;
	description: string;
	defaultAttrs: T;
	Component: ComponentType<BlockComponentProps<T>>;
}

export type AnyBlockDefinition = BlockDefinition<BlockAttrs>;

export type BlockRegistry = Record<string, AnyBlockDefinition>;
