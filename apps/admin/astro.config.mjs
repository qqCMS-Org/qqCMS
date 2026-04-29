// @ts-check
import node from '@astrojs/node';
import preact from '@astrojs/preact';
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({
	output: 'server',
	adapter: node({ mode: 'standalone' }),
	integrations: [preact({ include: ['**/islands/**', '**/features/**', '**/widgets/**', '**/entities/**'] })],
});
