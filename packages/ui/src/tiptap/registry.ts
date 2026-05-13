import { BlockNode } from "./nodes/BlockNode";
import { BlockquoteNode } from "./nodes/BlockquoteNode";
import { BulletListNode } from "./nodes/BulletListNode";
import { CodeBlockNode } from "./nodes/CodeBlockNode";
import { DocNode } from "./nodes/DocNode";
import { HardBreakNode } from "./nodes/HardBreakNode";
import { HeadingNode } from "./nodes/HeadingNode";
import { HorizontalRuleNode } from "./nodes/HorizontalRuleNode";
import { ImageNode } from "./nodes/ImageNode";
import { ListItemNode } from "./nodes/ListItemNode";
import { OrderedListNode } from "./nodes/OrderedListNode";
import { ParagraphNode } from "./nodes/ParagraphNode";
import { TextNode } from "./nodes/TextNode";
import { YoutubeNode } from "./nodes/YoutubeNode";
import type { NodeRegistry } from "./types";

export const defaultRegistry: NodeRegistry = {
	doc: DocNode,
	paragraph: ParagraphNode,
	heading: HeadingNode,
	text: TextNode,
	bulletList: BulletListNode,
	orderedList: OrderedListNode,
	listItem: ListItemNode,
	blockquote: BlockquoteNode,
	codeBlock: CodeBlockNode,
	hardBreak: HardBreakNode,
	horizontalRule: HorizontalRuleNode,
	image: ImageNode,
	youtube: YoutubeNode,
	block: BlockNode,
};
