import node from "@astrojs/node";
import preact from "@astrojs/preact";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = (p) => path.resolve(__dirname, "src", p);

// https://astro.build/config
export default defineConfig({
	output: "server",
	adapter: node({ mode: "standalone" }),
	integrations: [
		preact({ compat: true, include: ["**/islands/**", "**/features/**", "**/widgets/**", "**/entities/**", "**/shared/**"] }),
	],
	vite: {
		plugins: [
			tailwindcss(),
			{
				name: "astro-ssr-hmr",
				handleHotUpdate({ file, server }) {
					if (!file.includes("node_modules") && /\.(astro|tsx?|jsx?|css|scss)$/.test(file)) {
						server.hot.send({ type: "full-reload" });
						return [];
					}
				},
			},
		],
		resolve: {
			alias: {
				"@app": src("app"),
				"@layouts": src("layouts/index.ts"),
				"@widgets": src("widgets"),
				"@features": src("features"),
				"@entities": src("entities"),
				"@shared": src("shared"),
			},
		},
	},
});
