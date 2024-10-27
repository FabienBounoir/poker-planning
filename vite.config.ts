import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { createWSSGlobalInstance } from './ws.js';
import { rooms } from './src/lib/rooms';

export default defineConfig({
	plugins: [sveltekit(),
	{
		name: 'Websocket-server',
		configureServer(server) {
			const wss = createWSSGlobalInstance(rooms);
			server.httpServer?.on('upgrade', (req, socket, headers) => {
				const [pathname, query] = req.url.split('?');
				if (pathname === '/websocket' && wss) {
					wss.handleUpgrade(req, socket, headers, (client, req) => {
						const params = new URLSearchParams(query);
						const roomId = params.get('roomId');
						const username = params.get('username');
						const manager = params.get('manager') || false
						wss.emit('connection', client, roomId, username, manager);
					});
				}

				if (pathname === '/create-room' && wss) {
					wss.handleUpgrade(req, socket, headers, (client, req) => {
						const params = new URLSearchParams(query);
						const type = params.get('type')
						wss.emit('create', client, type);
					});
				}
			});
		}
	}],
	optimizeDeps: {
		include: ['svelte-sonner']
	},
	server: {
		port: 34568,
	}
});
