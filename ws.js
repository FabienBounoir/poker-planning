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

                    object.players.forEach((player) => {
                        if (player.manager) {
                            player.socket.send(JSON.stringify({ type: "players", data: players }));
                        }
                    });
                },
                emitUpdateGame(state) {
                    let element = { ...object.data }


                    if (state == "result") {
                        let results = new Map()
                        let itemsName = []
                        object.players.forEach((player, id) => {
                            if (!player.manager && player.selectedCard) {
                                let item = results.get(player?.selectedCard?.toUpperCase?.())

                                if (!item) {
                                    itemsName.push(player?.selectedCard?.toUpperCase?.())
                                    item = []
                                }

                                item.push(player.name)

                                results.set(player?.selectedCard?.toUpperCase?.(), item)
                            }
                        });

                        if (itemsName.length > 0) {
                            try {
                                const item = itemsName[Math.floor(Math.random() * itemsName.length)]
                                const itemUsers = results.get(item)
                                const userSelected = itemUsers[Math.floor(Math.random() * itemUsers.length)]

                                element.defender = {
                                    name: userSelected,
                                    item
                                }

                                let resultArray = Array.from(results).sort((a, b) => b[1].length - a[1].length)

                                element.result = resultArray
                            }
                            catch (e) {
                                console.error("ERROR WHEN PROCESS RESULT", e)
                            }
                        }
                    }

                    object.emit('game-update', element);
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

    function formatName(name) {
        const trimmedName = name.trim();
        return trimmedName.charAt(0).toUpperCase() + trimmedName.slice(1).toLowerCase();
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
            const room = getRooms(roomId)
            console.log("> Room", room)

            if (!room) {
                console.warn("Want to join room doesn't exist")
                return ws.close(1000, "Room doesn't exist");
            }

            if (!name) {
                console.warn("User without name")
                return ws.close(1000, "Can't join without name");
            }

            const userId = uuidv4();
            console.log('New connection with ID:', userId);

            ws.userId = userId;

            ws.send(JSON.stringify({ type: "game-update", data: room.data }));

            const player = {
                socket: ws,
                name: formatName(name),
                selectedCard: null,
                manager
            };

            room.players.set(userId, player);
            room.emitPlayers();

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
                        if (!room?.data?.cards?.includes?.(data.card)) {
                            return
                        }

                        player.selectedCard = data.card
                        room.players.set(userId, player)
                        room.emitPlayers()
                        ws.send(JSON.stringify({ type: "success", success: true }));

                    }
                        break;
                    case 'state': {
                        room.data.state = data.state
                        if (data.userStory) {
                            room.data.userStory = data.userStory
                        }

                        if (data.state == "playing") {
                            room.resetChoose()
                        }

                        room.emitUpdateGame(data.state)
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
            /** @type {string} */ team,
        ) => {
            if (type && !["TSHIRT", "FIBONACCI", "POWEROF2"].includes(type)) {
                console.warn(`Error: want to create room with type: ${type}`)
                return ws.close(1000, "Type doesn't exist");
            }

            const roomId = createRoomId()
            rooms.set(roomId, { reserved: true });

            let object = {
                team: formatName(team || 'NFS'),
                cards: [],
                state: 'waiting',
                userStory: ''
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


            rooms.set(roomId, { initialisation: true, data: object });
            console.log("NEW ROOM CREATE", rooms)

            ws.send(JSON.stringify({ type: "created", data: { roomId } }));
        })

    return wss;
};
