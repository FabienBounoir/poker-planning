const { Server } = require('socket.io');
const { newUserJoined, roomDeleted, userLeft, stateUpdate } = require('./utils/statistics');

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
                    color: '#FF7F00',
                    avatar: 'https://api.dicebear.com/9.x/dylan/svg',
                    autoReveal: false,
                    date: new Date().toISOString(),
                },
                history: [],
                timeout: null,
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

                    if (this.timeout) {
                        clearTimeout(this.timeout);
                        delete this.timeout;
                    }

                    stateUpdate(element, roomId, state);

                    if (state == "result") {
                        let resultsByItem = new Map();
                        let totalPlayers = 0;

                        if (!object.history) {
                            object.history = [];
                        }

                        let history = {
                            story: "",
                            winner: null,
                            results: [],
                        }

                        object.players.forEach((player) => {
                            const selectedCard = player?.selectedCard?.toUpperCase?.();
                            if (!player.manager && selectedCard) {
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
                            } catch (e) {
                                console.error("ERROR WHEN PROCESSING RESULT", e);
                            }
                        }

                        object.history.push(history);
                        element.history = object.history;
                    } else {
                        object.data.result = object.data.defender = null;
                    }

                    object.emit('game-update', element);
                },
                resetChoose() {
                    object.players.forEach((player) => {
                        object.players.set(player.socket.id, { ...player, selectedCard: null });
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
                        for (let player of object.players.values()) {
                            console.log("Check player", player.name, player.selectedCard);
                            if (!player.manager && !player.selectedCard) {
                                console.log("Not all players have selected a card");
                                return;
                            }
                        }

                        console.log("All players have selected a card");
                        console.log("Timeout to reveal result");
                        this.data.state = "result";
                        this.emitUpdateGame("result");
                    }, 3000);
                }
            };

            if (object.data) {
                object.data = { ...object.data, ...room.data };
            }

            rooms.set(roomId, (room = object));
        }

        return room;
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
                manager,
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

            socket.on('message', ({ type, data }) => {
                switch (type) {
                    case 'vote': {
                        const player = room.players.get(socket.id);
                        if (!room?.data?.cards?.includes?.(data.card)) return;

                        player.selectedCard = data.card;
                        room.players.set(socket.id, player);
                        room.emitPlayers(true);
                        socket.emit("success", { success: true });
                        room.checkAllPlayersSelected();
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