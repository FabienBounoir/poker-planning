import { WebSocket, WebSocketServer } from 'ws';

/**
 * @type {WebSocketServer}
 */
let wss;

let pokerObject = {
    roomId: "123456",
    customUrl: "nfs",
    cards: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    state: "INIT",
    userStory: "Create a poker planning",
}

export const createWSSGlobalInstance = () => {
    if (wss) return wss;

    /**
     * @type {Map<string, import('$lib/@types').Channel>}
     */
    const channels = new Map();

    /**
     * @param {string} id
     */
    function getChannel(id) {
        let channel = channels.get(id);
        if (!channel) {
            /**
             * @type {import('$lib/@types').Channel}
             */
            const c = {
                players: new Map(),
                emit(type, data) {
                    c.players.forEach((player) => {
                        player.socket.send(JSON.stringify({ type, data }));
                    });
                },
                emitPlayers() {
                    /** @type {any[]} */
                    const players = [];
                    c.players.forEach((player, id) => {
                        players.push({ ...player, id, socket: undefined });
                    });
                    c.emit('players', players);
                },
                updateGame() {
                    if (c.game) {
                        c.game.players.forEach((player) => (player.gameUpdated = false));
                        c.emit('game-updated', c.game);
                    }
                }
            };

            channels.set(id, (channel = c));
        }

        return channel;
    }

    wss = new WebSocketServer({ noServer: true });
    wss.on(
        'connection',
        (
			/** @type {WebSocket} */ ws,
			/** @type {string} */ roomId,
			/** @type {string} */ username
        ) => {
            // const channel = getChannel(roomId);
            console.log("room", roomId)
            console.log("username", username)

            ws.on('close', () => {

            });


            ws.on('message', async (raw) => {

            });
        }
    );

    return wss;
};
