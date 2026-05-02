import node from '@astrojs/node';
import preact from '@astrojs/preact';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = (p) => path.resolve(__dirname, 'src', p);

// https://astro.build/config
export default defineConfig({
	output: 'server',
	adapter: node({ mode: 'standalone' }),
	integrations: [preact({ include: ['**/islands/**', '**/features/**', '**/widgets/**', '**/entities/**'] })],
	vite: {
		plugins: [tailwindcss()],
		resolve: {
			alias: {
				'@app': src('app'),
				'@layouts': src('layouts/index.ts'),
				'@widgets': src('widgets'),
				'@features': src('features'),
				'@entities': src('entities'),
				'@shared': src('shared'),
			},
		},
	},
});
