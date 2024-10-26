import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { createWSSGlobalInstance } from './ws.js';

export default defineConfig({
	plugins: [sveltekit(),
	{
		name: 'Websocket-server',
		configureServer(server) {
			const wss = createWSSGlobalInstance();
			server.httpServer?.on('upgrade', (req, socket, headers) => {
				const [pathname, query] = req.url.split('?');
				if (pathname === '/websocket' && wss) {
					wss.handleUpgrade(req, socket, headers, (client, req) => {
						const params = new URLSearchParams(query);
						const roomId = params.get('roomId');
						const username = params.get('username');
						wss.emit('connection', client, roomId, username);
					});
				}
			});
		}
	}],
	optimizeDeps: {
		include: ['svelte-sonner']
	}
});
