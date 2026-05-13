export type { HeroAttrs } from "./HeroBlock";
export { HeroBlock } from "./HeroBlock";
export type {
	AnyBlockDefinition,
	BlockAttrs,
	BlockDefinition,
	BlockRegistry,
} from "./types";

import { HeroBlock } from "./HeroBlock";
import type { BlockRegistry } from "./types";

export const blockRegistry: BlockRegistry = {
	[HeroBlock.type]: HeroBlock as unknown as BlockRegistry[string],
};
