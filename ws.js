import { WebSocket, WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';

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

let rooms = new Map()


export const createWSSGlobalInstance = () => {
    if (wss) return wss;

    /**
     * @type {Map<string, import('$lib/@types').Channel>}
     */
    const channels = new Map();

    /**
     * @param {string} id
     */
    function getRooms(roomId) {
        let room = rooms.get(roomId)
        if (!room) {
            const c = {
                players: new Map(),
                data: {
                    cards: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
                    state: 'waiting',
                    userStory: 'Faire un planning poker',
                },
                emit(type, data, manager) {
                    c.players.forEach((player) => {
                        if (manager) {
                            if (player.manager) {
                                player.socket.send(JSON.stringify({ type, data }));
                            }
                        }
                        else {
                            player.socket.send(JSON.stringify({ type, data }));
                        }
                    });
                },
                emitPlayers() {
                    /** @type {any[]} */
                    const players = [];
                    c.players.forEach((player, id) => {
                        if (!player.manager) {
                            players.push({ ...player, id, socket: undefined });
                        }
                    });
                    console.log("emit", players)

                    c.players.forEach((player) => {
                        if (player.manager) {
                            player.socket.send(JSON.stringify({ type: "players", data: players }));
                        }
                    });
                },
                emitUpdateGame() {
                    c.emit('game-update', c.data);
                },
                resetChoose() {
                    c.players.forEach((player) => {
                        c.players.set(player.socket.userId, { ...player, selectedCard: null })
                    })
                    this.emitPlayers()
                }
            };

            rooms.set(roomId, (room = c));
        }

        return room;
    }

    wss = new WebSocketServer({ noServer: true });
    wss.on(
        'connection',
        (
			/** @type {WebSocket} */ ws,
			/** @type {string} */ roomId,
			/** @type {string} */ name,
            /** @type {boolean} */ manager,
        ) => {
            if (manager) {

            }

            const userId = uuidv4();
            console.log('New connection with ID:', userId);

            // Assigner l'ID à l'objet `socket` pour une référence future
            ws.userId = userId;

            const room = getRooms(roomId)
            ws.send(JSON.stringify({ type: "game-update", data: room.data }));

            const player = {
                socket: ws,
                name,
                status: 'playing',
                selectedCard: null,
                manager
            };


            room.players.set(userId, player);
            room.emitPlayers();


            console.log("room", roomId)
            console.log("name", name)

            ws.on('close', () => {
                room.players.delete(userId);
                if (room.players.size) {
                    room.emitPlayers();
                } else {
                    rooms.delete(roomId);
                }
            });


            ws.on('message', async (raw) => {
                const { type, data } = JSON.parse(raw.toString());

                switch (type) {
                    case 'vote': {
                        const player = room.players.get(userId);
                        player.selectedCard = data.card
                        room.players.set(userId, player)
                        room.emitPlayers(true)

                    }
                        break;
                    case 'state': {
                        console.log(" room.data.state", room.data.state)
                        console.log("data.state", data.state)
                        room.data.state = data.state
                        if (data.userStory) {
                            room.data.userStory = data.userStory
                        }

                        if (data.state == "playing") {
                            console.log("RESET USER VOTE")
                            room.resetChoose()
                        }

                        room.emitUpdateGame()
                    }
                        break;

                    default: {
                        console.log(`EVENT ${type} doesn't exist`)
                    }
                }
            });
        }
    );

    return wss;
};
