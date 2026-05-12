// @ts-check
import preact from "@astrojs/preact";
import { defineConfig } from "astro/config";

// https://astro.build/config
export default defineConfig({
	output: "static",
	integrations: [preact({ include: ["**/islands/**", "**/features/**", "**/widgets/**", "**/entities/**"] })],
});
