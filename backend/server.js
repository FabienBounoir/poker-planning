const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const { createRoomId } = require('./rooms');

/**
 * @type {Server}
 */
let io;

const createSocketIOServer = (server, rooms) => {
    if (io) return io;

    function getRooms(roomId) {
        let room = rooms.get(roomId);

        if (!room) {
            return null;
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
                                player.socket.emit(type, data);
                            }
                        } else {
                            player.socket.emit(type, data);
                        }
                    });
                },
                emitPlayers(manager = false) {
                    const players = [];
                    object.players.forEach((player, id) => {
                        if (!player.manager) {
                            players.push({ ...player, id, socket: undefined });
                        }
                    });

                    object.players.forEach((player) => {
                        if (manager) {
                            if (player.manager) {
                                player.socket.emit("players", players);
                            }
                        }
                        else {
                            player.socket.emit("players", players);
                        }
                    });
                },
                emitUpdateGame(state) {
                    let element = { ...object.data };

                    if (state == "result") {
                        let results = new Map();
                        let itemsName = [];
                        object.players.forEach((player, id) => {
                            if (!player.manager && player.selectedCard) {
                                let item = results.get(player?.selectedCard?.toUpperCase?.());

                                if (!item) {
                                    itemsName.push(player?.selectedCard?.toUpperCase?.());
                                    item = [];
                                }

                                item.push(player.name);
                                results.set(player?.selectedCard?.toUpperCase?.(), item);
                            }
                        });

                        if (itemsName.length > 0) {
                            try {
                                if (itemsName.length > 1) {
                                    const item = itemsName[Math.floor(Math.random() * itemsName.length)];
                                    const itemUsers = results.get(item);
                                    const userSelected = itemUsers[Math.floor(Math.random() * itemUsers.length)];

                                    object.data.defender = element.defender = {
                                        name: userSelected,
                                        item,
                                    };
                                }

                                let resultArray = Array.from(results).sort((a, b) => b[1].length - a[1].length);
                                object.data.result = element.result = resultArray;
                            } catch (e) {
                                console.error("ERROR WHEN PROCESS RESULT", e);
                            }
                        }
                    } else {
                        object.data.result = object.data.defender = null;
                    }

                    object.emit('game-update', element);
                },
                resetChoose() {
                    object.players.forEach((player) => {
                        object.players.set(player.socket.userId, { ...player, selectedCard: null });
                    });
                    this.emitPlayers();
                },
            };

            if (object.data) {
                object.data = { ...object.data, ...room.data };
            }

            rooms.set(roomId, (room = object));
        }

        return room;
    }

    function formatName(name) {
        const trimmedName = name.trim();
        return trimmedName.charAt(0).toUpperCase() + trimmedName.slice(1).toLowerCase();
    }

    io = new Server(server, { cors: { origin: "*" } });

    io.on('connection', (socket) => {
        socket.on('join', ({ roomId, name, manager }) => {
            const room = getRooms(roomId);

            console.log(roomId, name, manager)

            if (!room) {
                console.warn("Room doesn't exist");
                return socket.emit("error", { reason: "Room doesn't exist" });
            }

            if (!name) {
                console.warn("User without name");
                return socket.disconnect(true);
            }

            const userId = uuidv4();
            console.log('New connection with ID:', userId);

            if (room.timeout) {
                clearTimeout(room.timeout);
                delete room.timeout;
                console.log("Timeout removed for room", roomId, "because user", userId, "reconnected.");
            }

            socket.userId = userId;
            socket.emit("game-update", room.data);

            const player = {
                socket,
                name: formatName(name),
                selectedCard: null,
                manager,
            };

            room.players.set(userId, player);
            room.emitPlayers(room.data.state != "waiting");

            socket.on("leave-room", () => {
                console.log(`User leave room ${userId}`);
                room.players.delete(userId);

                if (room.players.size) {
                    room.emitPlayers(room.data.state != "waiting");
                } else {
                    room.timeout = setTimeout(() => {
                        if (!room.players.size) {
                            rooms.delete(roomId);
                            console.log(`Room ${roomId} deleted after inactivity.`);
                        }
                    }, 3600000);
                }
            })

            socket.on('disconnect', () => {
                console.log(`User ${userId} disconnected`);
                room.players.delete(userId);

                if (room.players.size) {
                    room.emitPlayers(room.data.state != "waiting");
                } else {
                    room.timeout = setTimeout(() => {
                        if (!room.players.size) {
                            rooms.delete(roomId);
                            console.log(`Room ${roomId} deleted after inactivity.`);
                        }
                    }, 3600000);
                }
            });

            socket.on('message', ({ type, data }) => {
                switch (type) {
                    case 'vote': {
                        const player = room.players.get(userId);
                        if (!room?.data?.cards?.includes?.(data.card)) return;

                        player.selectedCard = data.card;
                        room.players.set(userId, player);
                        room.emitPlayers(true);
                        socket.emit("success", { success: true });
                        break;
                    }
                    case 'state': {
                        room.data.state = data.state;
                        if (data.userStory) {
                            room.data.userStory = data.userStory;
                        }

                        if (data.state === "playing") {
                            room.resetChoose();
                        }

                        room.emitUpdateGame(data.state);
                        break;
                    }
                    case 'ping':
                        socket.emit("pong", { success: true });
                        break;
                    case 'hexcode':
                        room.data.hexcode = data.hexcode;
                        room.emit("hexcode", { hexcode: data.hexcode }, false);
                        break;
                    default:
                        console.log(`EVENT ${type} doesn't exist`);
                }
            });
        });

        socket.on('create', ({ type, team }) => {
            if (!["TSHIRT", "FIBONACCI", "POWEROF2", "SEQUENTIAL", "TSHIRT_HALF"].includes(type)) {
                console.warn(`Invalid room type: ${type}`);
                return socket.disconnect(true);
            }

            const roomId = createRoomId();
            rooms.set(roomId, { reserved: true });

            let object = {
                team: formatName(team || 'NFS'),
                cards: [],
                state: 'waiting',
                userStory: '',
            };

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
                case "SEQUENTIAL":
                    object.cards = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
                    break;
                case "TSHIRT_HALF":
                    object.cards = ['XS', 'S', 'M', 'M/L', 'L', 'XL'];
                    break;
                default:
                    console.warn(`Unknown type: ${type}`);
                    break;
            }

            rooms.set(roomId, { initialisation: true, data: object });
            console.log("NEW ROOM CREATED", rooms);

            socket.emit("created", { roomId });
        });
    });

    return io;
};


module.exports = {
    createSocketIOServer
}