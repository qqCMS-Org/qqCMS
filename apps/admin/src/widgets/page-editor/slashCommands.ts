// @ts-nocheck -- Novel v1 is built against TipTap v2; admin uses TipTap v3. Types are incompatible but runtime works.

import { blockRegistry } from "@repo/ui";
import { Command, createSuggestionItems, renderItems } from "novel";

const blockSuggestions = Object.values(blockRegistry).map((definition) => ({
	title: definition.label,
	description: definition.description,
	searchTerms: ["block", definition.type],
	// biome-ignore lint/suspicious/noExplicitAny: createSuggestionItems provides the correct types at runtime
	command: ({ editor, range }: { editor: any; range: any }) => {
		editor
			.chain()
			.focus()
			.deleteRange(range)
			.insertContent({
				type: "block",
				attrs: {
					blockType: definition.type,
					blockData: definition.defaultAttrs,
				},
			})
			.run();
	},
}));

export const suggestionItems = createSuggestionItems([
	{
		title: "Text",
		description: "Just start writing with plain text.",
		searchTerms: ["p", "paragraph"],
		command: ({ editor, range }) => {
			editor.chain().focus().deleteRange(range).toggleNode("paragraph", "paragraph").run();
		},
	},
	{
		title: "Heading 1",
		description: "Big section heading.",
		searchTerms: ["title", "h1", "big", "large"],
		command: ({ editor, range }) => {
			editor.chain().focus().deleteRange(range).setNode("heading", { level: 1 }).run();
		},
	},
	{
		title: "Heading 2",
		description: "Medium section heading.",
		searchTerms: ["subtitle", "h2", "medium"],
		command: ({ editor, range }) => {
			editor.chain().focus().deleteRange(range).setNode("heading", { level: 2 }).run();
		},
	},
	{
		title: "Heading 3",
		description: "Small section heading.",
		searchTerms: ["h3", "small"],
		command: ({ editor, range }) => {
			editor.chain().focus().deleteRange(range).setNode("heading", { level: 3 }).run();
		},
	},
	{
		title: "Bullet List",
		description: "Create a simple unordered list.",
		searchTerms: ["unordered", "point", "ul"],
		command: ({ editor, range }) => {
			editor.chain().focus().deleteRange(range).toggleBulletList().run();
		},
	},
	{
		title: "Ordered List",
		description: "Create a numbered list.",
		searchTerms: ["ordered", "point", "number", "ol"],
		command: ({ editor, range }) => {
			editor.chain().focus().deleteRange(range).toggleOrderedList().run();
		},
	},
	{
		title: "Quote",
		description: "Capture a quote.",
		searchTerms: ["blockquote"],
		command: ({ editor, range }) => {
			editor.chain().focus().deleteRange(range).toggleBlockquote().run();
		},
	},
	{
		title: "Code Block",
		description: "Capture a code snippet.",
		searchTerms: ["codeblock", "pre"],
		command: ({ editor, range }) => {
			editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
		},
	},
	{
		title: "Divider",
		description: "Insert a horizontal rule.",
		searchTerms: ["hr", "rule", "line", "divider"],
		command: ({ editor, range }) => {
			editor.chain().focus().deleteRange(range).setHorizontalRule().run();
		},
	},
	...blockSuggestions,
]);

export const slashCommand = Command.configure({
	suggestion: {
		items: () => suggestionItems,
		render: renderItems,
	},
});
