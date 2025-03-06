const { Server } = require('socket.io');
const { newUserJoined, roomDeleted, userLeft, stateUpdate } = require('./utils/statistics');
const { arraysAreEqual } = require('./utils/utils');
const { UserRole, isValidRole } = require('./utils/roles');

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
                    hexcode: '#FF7F00',
                    avatar: 'https://api.dicebear.com/9.x/dylan/svg',
                    autoReveal: false,
                    voteOnResults: false,
                    date: new Date().toISOString(),
                    firstVoter: null,
                },
                history: [],
                timeout: null,
                emit(type, data, manager) {
                    object.players.forEach((player) => {
                        if (manager) {
                            if (player.role === UserRole.MANAGER) {
                                player.socket.emit(type, data);
                            }
                        } else {
                            player.socket.emit(type, data);
                        }
                    });
                },
                emitPlayers(manager = false) {
                    const players = [];
                    const observers = [];
                    object.players.forEach((player, id) => {
                        if (player.role === UserRole.PLAYER) {
                            players.push({ ...player, id, socket: undefined });
                        }
                        else if (player.role === UserRole.OBSERVER) {
                            observers.push({ ...player, id, socket: undefined });
                        }
                    });

                    object.players.forEach((player) => {
                        if (manager) {
                            if (player.role === UserRole.MANAGER) {
                                player.socket.emit("players", { players, observers });
                            }
                        }
                        else {
                            player.socket.emit("players", { players, observers });
                        }
                    });
                },
                emitUpdateGame(state, configUpdate = false) {
                    let element = { ...object.data };

                    if (!configUpdate) {
                        if (this.timeout) {
                            clearTimeout(this.timeout);
                            delete this.timeout;
                        }

                        stateUpdate(element, roomId, state);
                    }

                    if (state == "result") {
                        processResultState(this, element, roomId);
                    } else {
                        object.data.result = object.data.defender = null;
                    }

                    object.emit('game-update', element);
                },
                emitMessage(message, type = "info") {
                    object.emit('message', {
                        message,
                        type
                    });
                },
                emitDeleteRoom() {
                    object.emit('delete-room');
                    console.log(`Room ${roomId} deleted by manager.`);
                    roomDeleted(room.data);
                },
                resetChoose() {
                    object.data.firstVoter = null;
                    object.players.forEach((player) => {
                        object.players.set(player.socket.id, { ...player, selectedCard: null, firstVoter: false });
                    });
                    this.emitPlayers();
                },
                checkAllPlayersSelected() {
                    console.log("Check all players selected");
                    if (!this.data.autoReveal) return false;
                    console.log("Auto reveal is enabled");


                    if (this.timeout) {
                        clearTimeout(this.timeout);
                        delete this.timeout;
                    }

                    this.timeout = setTimeout(() => {
                        for (const player of object.players.values()) {
                            console.log("Check player", player.name, player.selectedCard);
                            if (player.role === UserRole.PLAYER && !player.selectedCard) {
                                console.log("Not all players have selected a card");
                                return;
                            }
                        }
                        this.data.state = "result";
                        this.emitUpdateGame("result");
                    }, 2000);
                }
            };

            if (object.data) {
                object.data = { ...object.data, ...room.data };
            }

            rooms.set(roomId, (room = object));
        }

        return room;
    }

    function processResultState(object, element, roomId) {
        let resultsByItem = new Map();
        let totalPlayers = 0;

        if (!object.history) {
            object.history = [];
        }

        let history = {
            story: object?.data?.userStory || null,
            winner: null,
            results: [],
        };

        object.players.forEach((player) => {
            const selectedCard = player?.selectedCard?.toUpperCase?.();
            if (player.role !== UserRole.MANAGER && selectedCard) {
                totalPlayers++;
                if (!resultsByItem.has(selectedCard)) {
                    resultsByItem.set(selectedCard, []);
                }
                resultsByItem.get(selectedCard).push(player.name);

                history.results.push({ name: player.name, card: selectedCard });
            }
        });

        if (resultsByItem.size > 0) {
            try {
                const result = Array.from(resultsByItem).map(([item, players]) => ({
                    item,
                    players,
                    pourcentage: Math.round((players.length / totalPlayers) * 100).toFixed(0)
                })).sort((a, b) => b.players.length - a.players.length);

                object.data.result = element.result = result;
                history.winner = result[0].item;

                if (resultsByItem.size > 1) {
                    const lastItem = result[result.length - 1];
                    const userSelected = lastItem.players[Math.floor(Math.random() * lastItem.players.length)];
                    object.data.defender = element.defender = { name: userSelected, item: lastItem.item };
                }
                else {
                    object.data.defender = element.defender = null;
                }
            } catch (e) {
                console.error("ERROR WHEN PROCESSING RESULT", e);
            }
        }

        object.history.push(history);
        element.history = object.history;
    }

    function formatName(name) {
        return name
            .trim()
            .split(/[\s.]+/)
            .map(segment =>
                segment.charAt(0).toUpperCase() + segment.slice(1)
            )
            .join(' ');
    }

    io = new Server(server, { cors: { origin: "*" } });

    io.on('connection', (socket) => {
        socket.on('join', ({ roomId, name, role = "player" }) => {
            const room = getRooms(roomId);

            console.log(roomId, name, role)

            if (!room) {
                console.warn("Room doesn't exist");
                return socket.emit("error", { reason: "Room doesn't exist" });
            }

            if (!name) {
                console.warn("User without name");
                return socket.disconnect(true);
            }

            if (!isValidRole(role)) {
                console.warn("Invalid role");
                return socket.disconnect(true);
            }

            newUserJoined(name, room.data, roomId);

            console.log('New connection with ID:', socket.id);

            if (room.timeout) {
                clearTimeout(room.timeout);
                delete room.timeout;
                console.log("Timeout removed for room", roomId, "because user", socket.id, "reconnected.");
            }
            socket.emit("game-update", room.data);

            const player = {
                id: socket.id,
                socket,
                name: formatName(name),
                selectedCard: null,
                role
            };

            room.players.set(socket.id, player);
            room.emitPlayers(room.data.state != "waiting");

            socket.on('disconnect', () => {
                console.log(`User ${socket.id} disconnected`);

                userLeft(room.players.get(socket.id)?.name || "Unknown", room.data, roomId);
                room.players.delete(socket.id);

                if (room.players.size) {
                    room.emitPlayers(room.data.state != "waiting");
                } else {
                    console.log("Setup Timeout 1 hour to delete inactive room")

                    if (['result'].includes(room?.data?.state)) {
                        room.data.state = 'waiting';
                        room.data.userStory = ''
                    }

                    room.timeout = setTimeout(() => {
                        if (!room.players.size) {
                            rooms.delete(roomId);
                            console.log(`Room ${roomId} deleted after inactivity.`);
                            roomDeleted(room.data);
                        }
                    }, 3600000);
                }
            });

            socket.on('message', ({ type, data }, callback) => {
                switch (type) {
                    case 'vote': {
                        try {
                            const player = room.players.get(socket.id);
                            if (!room?.data?.cards?.includes?.(data.card) && data.card != null) return;

                            if (room.data.firstVoter === null) {
                                room.data.firstVoter = player.name;
                                player.firstVoter = true;
                            }

                            player.selectedCard = data.card;
                            room.players.set(socket.id, player);
                            room.emitPlayers(true);

                            callback({ success: true });
                            room.checkAllPlayersSelected();

                            if (room.data.state === "result" && room?.data?.voteOnResults) {
                                room.emitUpdateGame("result");
                            }
                        }
                        catch (e) {
                            console.error("Error when voting", e);
                            callback({ success: false, error: e.message });
                        }
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
                    case 'hexcode':
                        room.data.hexcode = data.hexcode;
                        room.emit("hexcode", { hexcode: data.hexcode }, false);
                        break;
                    case 'delete-room':
                        if (player.role === UserRole.MANAGER) {
                            rooms.delete(roomId);
                            room.emitDeleteRoom();
                        }
                        break;
                    case 'update-room':
                        if (player.role === UserRole.MANAGER) {
                            try {
                                const { cards, autoReveal } = room.data;
                                room.data = { ...room.data, ...data };

                                switch (room.data.type) {
                                    case "TSHIRT":
                                        room.data.cards = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
                                        break;
                                    case "FIBONACCI":
                                        room.data.cards = ["0", "1", "2", "3", "5", "8", "13", "21"];
                                        break;
                                    case "POWEROF2":
                                        room.data.cards = ["1", "2", "4", "8", "16", "32", "64"];
                                        break;
                                    case "SEQUENTIAL":
                                        room.data.cards = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
                                        break;
                                    case "TSHIRT_HALF":
                                        room.data.cards = ['XS', 'S', 'M', 'M/L', 'L', 'XL'];
                                        break;
                                    default:
                                        console.log("Unknown room type", room?.data?.type);
                                        if (!room?.data?.cards || room?.data?.cards?.length === 0) return
                                }

                                console.log("autoReveal", autoReveal)
                                console.log("data.autoReveal", data?.autoReveal)

                                if (!arraysAreEqual(cards, room.data.cards)) {
                                    room.resetChoose();
                                }
                                else if (autoReveal != data?.autoReveal && data?.autoReveal) {
                                    room.checkAllPlayersSelected();
                                }

                                room.emitUpdateGame(room?.data?.state, true);
                                callback({ success: true });
                            }
                            catch (e) {
                                console.error("Error when updating room", e);
                                callback({ success: false, error: e.message });
                            }
                        }
                        break
                    default:
                        console.log(`EVENT ${type} doesn't exist`);
                }
            });
        });
    });

    return io;
};


module.exports = {
    createSocketIOServer
}