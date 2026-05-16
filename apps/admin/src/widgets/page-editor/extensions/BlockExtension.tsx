// @ts-nocheck
import { BlockNode, blockRegistry } from "@repo/ui";
import { mergeAttributes, Node } from "@tiptap/core";
import { NodeViewWrapper, ReactNodeViewRenderer } from "@tiptap/react";
import { AlignCenter, AlignLeft, Link as LinkIcon, Settings } from "lucide-preact";
import { useEffect, useRef, useState } from "preact/hooks";
import { MediaSelect } from "../../../shared/MediaSelect";

interface BlockNodeViewProps {
	node: {
		attrs: {
			blockType: string;
			// biome-ignore lint/suspicious/noExplicitAny: TipTap attributes are dynamic
			blockData: Record<string, any>;
		};
	};
	// biome-ignore lint/suspicious/noExplicitAny: TipTap attributes are dynamic
	updateAttributes: (attrs: Record<string, any>) => void;
}

const BlockNodeView = (props: BlockNodeViewProps) => {
	const [showSettings, setShowSettings] = useState(false);
	const settingsRef = useRef<HTMLDivElement>(null);
	const blockType = props.node.attrs.blockType;
	const definition = blockRegistry[blockType];

	useEffect(() => {
		if (!showSettings) return;

		const handleClickOutside = (event: MouseEvent) => {
			if (settingsRef.current && !settingsRef.current.contains(event.target as Node)) {
				setShowSettings(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, [showSettings]);

	// biome-ignore lint/suspicious/noExplicitAny: TipTap attributes are dynamic
	const handleUpdateAttrs = (newAttrs: Record<string, any>) => {
		props.updateAttributes({
			blockData: {
				...props.node.attrs.blockData,
				...newAttrs,
			},
		});
	};

	const attrs = props.node.attrs.blockData || {};

	return (
		<NodeViewWrapper className="block-node group/node">
			<div className="relative border-2 border-transparent hover:border-accent/20 rounded-xl transition-all overflow-visible">
				{/* ── Block Content ────────────────────────── */}
				<BlockNode node={props.node} isEditing={true} updateAttrs={handleUpdateAttrs} />

				{/* ── Quick Actions ─────────────────────────── */}
				<div className="absolute top-4 right-4 flex gap-1 opacity-0 group-hover/node:opacity-100 transition-opacity z-30">
					<button
						type="button"
						onClick={() => setShowSettings(!showSettings)}
						className={`flex items-center justify-center w-8 h-8 rounded-full border shadow-sm transition-all ${showSettings ? "bg-accent text-white border-accent" : "bg-bg0 text-text1 border-ui-border hover:border-accent hover:text-accent"}`}
					>
						<Settings size={14} />
					</button>
				</div>

				{/* ── Settings Panel (Overlay) ─────────────── */}
				{showSettings && (
					<div
						ref={settingsRef}
						className="absolute top-14 right-4 w-72 bg-bg0 border border-ui-border rounded-xl shadow-2xl p-4 z-40 animate-in fade-in zoom-in duration-150"
					>
						<div className="flex items-center justify-between mb-4">
							<span className="text-[11px] font-bold text-text0 uppercase tracking-wider">
								{definition?.label || blockType} Settings
							</span>
							<button
								type="button"
								onClick={() => setShowSettings(false)}
								className="text-text2 hover:text-text0 border-none bg-transparent cursor-pointer"
							>
								✕
							</button>
						</div>

						<div className="flex flex-col gap-4">
							{/* Background Image (if supported) */}
							{"bgImage" in (definition?.defaultAttrs || {}) && (
								<MediaSelect
									label="Background Image"
									value={attrs.bgImage}
									onChange={(id) => {
										if (!id) {
											handleUpdateAttrs({ bgImage: "" });
											return;
										}
										const API_URL = import.meta.env.PUBLIC_API_URL ?? "http://localhost:3000";
										import("@shared/api/client").then(({ api }) => {
											api
												.media({ id })
												.get()
												.then((res) => {
													if (res.data && "url" in res.data) {
														handleUpdateAttrs({ bgImage: `${API_URL}${res.data.url}` });
													}
												});
										});
									}}
								/>
							)}

							{/* CTA Link (if supported) */}
							{"buttonHref" in (definition?.defaultAttrs || {}) && (
								<div className="flex flex-col gap-1.5">
									<label htmlFor="cta-url" className="flex items-center gap-2 text-[11px] text-text1">
										<LinkIcon size={12} /> Button URL
									</label>
									<input
										id="cta-url"
										type="text"
										value={attrs.buttonHref || ""}
										onChange={(e) => handleUpdateAttrs({ buttonHref: e.currentTarget.value })}
										placeholder="https://..."
										className="w-full bg-bg2 border border-ui-border rounded px-2 py-1.5 text-[11px] text-text0 outline-none focus:border-accent"
									/>
								</div>
							)}

							{/* Alignment (if supported) */}
							{"align" in (definition?.defaultAttrs || {}) && (
								<fieldset className="flex flex-col gap-1.5 border-none p-0 m-0">
									<legend className="text-[11px] text-text1 mb-1.5">Alignment</legend>
									<div className="flex gap-1">
										<button
											type="button"
											onClick={() => handleUpdateAttrs({ align: "left" })}
											className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded border text-[10px] transition-colors cursor-pointer ${attrs.align === "left" ? "bg-accent/10 border-accent text-accent" : "bg-bg2 border-ui-border text-text2 hover:text-text1"}`}
										>
											<AlignLeft size={12} /> Left
										</button>
										<button
											type="button"
											onClick={() => handleUpdateAttrs({ align: "center" })}
											className={`flex-1 flex items-center justify-center gap-2 py-1.5 rounded border text-[10px] transition-colors cursor-pointer ${attrs.align === "center" ? "bg-accent/10 border-accent text-accent" : "bg-bg2 border-ui-border text-text2 hover:text-text1"}`}
										>
											<AlignCenter size={12} /> Center
										</button>
									</div>
								</fieldset>
							)}
						</div>
					</div>
				)}
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
