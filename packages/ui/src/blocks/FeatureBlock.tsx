import type { JSX } from "preact";
import { Editable } from "./Editable";
import type { BlockComponentProps, BlockDefinition } from "./types";

export interface FeatureAttrs {
	[key: string]: string | number | boolean | undefined;
	title: string;
	description: string;
	icon: string;
}

function FeatureComponent({
	attrs,
	isEditing,
	updateAttrs,
}: BlockComponentProps<FeatureAttrs>): JSX.Element {
	return (
		<div class="py-12 px-6 flex flex-col items-center text-center gap-4 bg-bg2/30 rounded-2xl border border-ui-border">
			<Editable
				tag="div"
				value={attrs.icon}
				onChange={(val) => updateAttrs?.({ icon: val })}
				isEditing={isEditing}
				className="text-4xl mb-2"
				placeholder="🚀"
			/>
			<Editable
				tag="h3"
				value={attrs.title}
				onChange={(val) => updateAttrs?.({ title: val })}
				isEditing={isEditing}
				className="text-2xl font-bold text-text0"
				placeholder="Feature Title"
			/>
			<Editable
				tag="p"
				value={attrs.description}
				onChange={(val) => updateAttrs?.({ description: val })}
				isEditing={isEditing}
				className="text-text1 max-w-md"
				placeholder="Feature description goes here..."
				multiline
			/>
		</div>
	);
}

export const FeatureBlock: BlockDefinition<FeatureAttrs> = {
	type: "feature",
	label: "Feature Card",
	description: "A centered card with an icon, title, and description",
	defaultAttrs: {
		title: "Innovative Feature",
		description:
			"This is a great feature that helps you do amazing things faster.",
		icon: "⚡",
	},
	Component: FeatureComponent,
};
