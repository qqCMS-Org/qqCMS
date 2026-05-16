import type { JSX } from "preact";
import { Editable } from "./Editable";
import type { BlockComponentProps, BlockDefinition } from "./types";

export interface HeroAttrs {
	[key: string]: string | number | boolean | undefined;
	heading: string;
	subheading: string;
	buttonLabel: string;
	buttonHref: string;
	align: "left" | "center";
	bgImage?: string;
}

function HeroComponent({
	attrs,
	isEditing,
	updateAttrs,
}: BlockComponentProps<HeroAttrs>): JSX.Element {
	const isCenter = attrs.align === "center";
	const alignClass = isCenter
		? "text-center items-center"
		: "text-left items-start";

	const handleUpdate = (key: keyof HeroAttrs, value: string) => {
		if (updateAttrs) {
			updateAttrs({ [key]: value });
		}
	};

	return (
		<section
			class={`w-full py-24 px-6 flex flex-col gap-6 relative min-h-[400px] justify-center overflow-hidden ${alignClass}`}
		>
			{attrs.bgImage && (
				<div
					class="absolute inset-0 z-0 bg-cover bg-center transition-transform duration-700"
					style={{ backgroundImage: `url(${attrs.bgImage})` }}
				>
					<div class="absolute inset-0 bg-black/40" />
				</div>
			)}

			<div
				class={`relative z-10 w-full flex flex-col gap-6 ${isCenter ? "items-center" : "items-start"}`}
			>
				<Editable
					tag="h1"
					value={attrs.heading}
					onChange={(val) => handleUpdate("heading", val)}
					isEditing={isEditing}
					className={`text-5xl font-bold leading-tight tracking-tight ${attrs.bgImage ? "text-white" : "text-text0"}`}
					placeholder="Welcome Title"
				/>
				<Editable
					tag="p"
					value={attrs.subheading}
					onChange={(val) => handleUpdate("subheading", val)}
					isEditing={isEditing}
					className={`text-xl max-w-2xl ${attrs.bgImage ? "text-white/80" : "text-base-content/70"}`}
					placeholder="Add a short description here."
					multiline
				/>
				{(attrs.buttonLabel || isEditing) && (
					<div
						class={`flex flex-col gap-2 ${isCenter ? "items-center" : "items-start"}`}
					>
						<Editable
							tag="div"
							value={attrs.buttonLabel}
							onChange={(val) => handleUpdate("buttonLabel", val)}
							isEditing={isEditing}
							className="inline-flex items-center px-8 py-4 rounded-lg bg-primary text-primary-content font-bold hover:opacity-90 transition-all w-fit shadow-lg active:scale-95"
							placeholder="Button Label"
						/>
					</div>
				)}
			</div>
		</section>
	);
}

export const HeroBlock: BlockDefinition<HeroAttrs> = {
	type: "hero",
	label: "Hero",
	description:
		"Large heading section with optional subheading and call-to-action button",
	defaultAttrs: {
		heading: "Welcome to our platform",
		subheading: "The best place to build your digital presence with ease.",
		buttonLabel: "Get started",
		buttonHref: "#",
		align: "center",
		bgImage: "",
	},
	Component: HeroComponent,
};
