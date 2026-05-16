// @ts-nocheck
import { BlockNode } from "@repo/ui";
import { mergeAttributes, Node } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";

const BlockNodeView = (props: any) => {
	return (
		<NodeViewWrapper className="block-node">
			<div className="relative group min-h-[50px] border border-transparent hover:border-accent/30 rounded-lg transition-colors">
				<BlockNode {...props} />
				<div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-bg3 border border-ui-border rounded px-2 py-1 text-[10px] text-text2 pointer-events-none z-10">
					Block: {props.node.attrs.blockType}
				</div>
			</div>
		</NodeViewWrapper>
	);
};

export const BlockExtension = Node.create({
	name: "block",
	group: "block",
	atom: true,
	draggable: true,

	addAttributes() {
		return {
			blockType: {
				default: null,
			},
			blockData: {
				default: {},
			},
		};
	},

	parseHTML() {
		return [
			{
				tag: "div[data-block-type]",
			},
		];
	},

	renderHTML({ HTMLAttributes }) {
		return ["div", mergeAttributes(HTMLAttributes, { "data-block-type": HTMLAttributes.blockType })];
	},

	addNodeView() {
		return ReactNodeViewRenderer(BlockNodeView);
	},
});
