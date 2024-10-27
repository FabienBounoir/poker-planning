import { WebSocket, WebSocketServer } from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { createRoomId } from './src/lib/rooms';

/**
 * @type {WebSocketServer}
 */
let wss;

export const createWSSGlobalInstance = (rooms) => {
    if (wss) return wss;

    /**
     * @param {string} id
     */
    function getRooms(roomId) {
        let room = rooms.get(roomId)

        console.log("room", room)

        if (!room) {
            return null
        }

        if (room?.initialisation) {
            const object = {
                players: new Map(),
                data: {
                    cards: [],
                    state: 'waiting',
                    userStory: '',
                },
                emit(type, data, manager) {
                    object.players.forEach((player) => {
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
                    object.players.forEach((player, id) => {
                        if (!player.manager) {
                            players.push({ ...player, id, socket: undefined });
                        }
                    });
                    console.log("emit", players)

                    object.players.forEach((player) => {
                        if (player.manager) {
                            player.socket.send(JSON.stringify({ type: "players", data: players }));
                        }
                    });
                },
                emitUpdateGame() {
                    object.emit('game-update', object.data);
                },
                resetChoose() {
                    object.players.forEach((player) => {
                        object.players.set(player.socket.userId, { ...player, selectedCard: null })
                    })
                    this.emitPlayers()
                }
            };

            if (object.data) {
                object.data = { ...object.data, ...room.data }
            }

            rooms.set(roomId, (room = object));
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
            console.log("CONNECTION ROOMS", rooms)
            const room = getRooms(roomId)
            console.log("room", room)

            if (!room) {
                console.warn("Want to join room doesn't exist")
                return ws.close(1000, "Room doesn't exist");
            }

            const userId = uuidv4();
            console.log('New connection with ID:', userId);

            ws.userId = userId;

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

    wss.on(
        'create',
        (
			/** @type {WebSocket} */ ws,
            /** @type {string} */ type,
        ) => {
            if (type && !["TSHIRT", "FIBONACCI", "POWEROF2"].includes(type)) {
                console.warn(`Want to create room with type: ${type}`)
                return ws.close(1000, "Type doesn't exist");
            }

            const roomId = createRoomId()
            console.log("ROOM ID CREATE", roomId)
            rooms.set(roomId, { reserved: true });

            console.log("rooms", rooms)

            let object = {
                team: 'NFS',
                cards: [],
                state: 'waiting',
                userStory: 'Faire un planning poker'
            }

            switch (type) {
                case "TSHIRT":
                    object.cards = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
                    break;

                case "FIBONACCI":
                    object.cards = ["1", "2", "3", "5", "8", "13", "21"];
                    break;

                case "POWEROF2":
                    object.cards = ["1", "2", "4", "8", "16", "32"];
                    break;

                default:
                    console.warn(`Unknown type: ${type}`);
                    break;
            }

            console.log("OBEJCT CREATE", object)


            rooms.set(roomId, { initialisation: true, data: object });
            console.log(rooms)

            ws.send(JSON.stringify({ type: "created", data: { roomId } }));
        })

    return wss;
};
