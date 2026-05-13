import { blockRegistry } from "../../blocks";
import type { BlockAttrs } from "../../blocks/types";
import type { TipTapNode } from "../types";

export function BlockNode({ node }: { node: TipTapNode }) {
	const blockType = node.attrs?.blockType as string | undefined;

	if (!blockType) {
		return null;
	}

	const definition = blockRegistry[blockType];

	if (!definition) {
		return <div data-block-type={blockType} />;
	}

	const attrs = (node.attrs?.blockData ??
		definition.defaultAttrs) as BlockAttrs;
	const { Component } = definition;

	return <Component attrs={attrs} />;
}
