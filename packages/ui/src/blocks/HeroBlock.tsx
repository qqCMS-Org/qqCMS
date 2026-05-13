import type { JSX } from "preact";
import type { BlockDefinition } from "./types";

export interface HeroAttrs {
	[key: string]: string | number | boolean | undefined;
	heading: string;
	subheading: string;
	buttonLabel: string;
	buttonHref: string;
	align: "left" | "center";
}

function HeroComponent({ attrs }: { attrs: HeroAttrs }): JSX.Element {
	const alignClass =
		attrs.align === "center"
			? "text-center items-center"
			: "text-left items-start";

	return (
		<section class={`w-full py-20 px-6 flex flex-col gap-6 ${alignClass}`}>
			{attrs.heading && (
				<h1 class="text-5xl font-bold leading-tight tracking-tight">
					{attrs.heading}
				</h1>
			)}
			{attrs.subheading && (
				<p class="text-xl text-base-content/70 max-w-2xl">{attrs.subheading}</p>
			)}
			{attrs.buttonLabel && attrs.buttonHref && (
				<a
					href={attrs.buttonHref}
					class="inline-flex items-center px-6 py-3 rounded-lg bg-primary text-primary-content font-medium hover:opacity-90 transition-opacity w-fit"
				>
					{attrs.buttonLabel}
				</a>
			)}
		</section>
	);
}

export const HeroBlock: BlockDefinition<HeroAttrs> = {
	type: "hero",
	label: "Hero",
	description:
		"Large heading section with optional subheading and call-to-action button",
	defaultAttrs: {
		heading: "Welcome",
		subheading: "Add a short description here.",
		buttonLabel: "Get started",
		buttonHref: "#",
		align: "center",
	},
	Component: HeroComponent,
};
