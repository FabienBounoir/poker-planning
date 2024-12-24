import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import packageJson from './package.json';


export default defineConfig({
	plugins: [sveltekit()],
	optimizeDeps: {
		include: ['svelte-sonner']
	},
	server: {
		port: 34568,
	},
	define: {
		PACKAGE_JSON: packageJson
	}
});
