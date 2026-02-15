const { UserRole } = require('../utils/roles');
const { stateUpdate, roomDeleted } = require('../utils/statistics');
const { processResultState } = require('../helpers/roomHelpers');

/**
 * Class representing a poker planning room
 */
class Room {
    constructor(roomId, roomData = {}) {
        this.roomId = roomId;
        this.players = new Map();
        this.data = {
            cards: [],
            state: 'waiting',
            userStory: '',
            hexcode: '#FF7F00',
            avatar: 'https://api.dicebear.com/9.x/dylan/svg',
            autoReveal: false,
            voteOnResults: false,
            date: new Date().toISOString(),
            votingOrder: [],
            ...roomData
        };
        this.history = [];
        this.timeout = null;
        this.floatingReactions = [];
    }

    /**
     * Emits an event to all players
     */
    emit(type, data, manager = false) {
        this.players.forEach((player) => {
            if (manager) {
                if (player.role === UserRole.MANAGER) {
                    player.socket.emit(type, data);
                }
            } else {
                player.socket.emit(type, data);
            }
        });
    }

    /**
     * Emits the list of players and observers
     */
    emitPlayers(manager = false) {
        const players = [];
        const observers = [];
        
        this.players.forEach((player, id) => {
            if (player.role === UserRole.PLAYER) {
                players.push({ ...player, id, socket: undefined });
            }
            else if (player.role === UserRole.OBSERVER) {
                observers.push({ ...player, id, socket: undefined });
            }
        });

        this.players.forEach((player) => {
            if (manager) {
                if (player.role === UserRole.MANAGER) {
                    player.socket.emit("players", { players, observers });
                }
                else {
                    player.socket.emit("players", { observers });
                }
            }
            else {
                player.socket.emit("players", { players, observers });
            }
        });
    }

    /**
     * Updates game state and emits changes
     */
    emitUpdateGame(state, configUpdate = false) {
        let element = { ...this.data };

        if (!configUpdate) {
            if (this.timeout) {
                clearTimeout(this.timeout);
                delete this.timeout;
            }

            stateUpdate(element, this.roomId, state);
        }

        if (state === "result") {
            processResultState(this, element);
        } else {
            this.data.result = this.data.defender = null;
        }

        this.emit('game-update', element);
    }

    /**
     * Emits a message to all players
     */
    emitMessage(message, type = "info") {
        this.emit('message', { message, type });
    }

    /**
     * Deletes the room
     */
    emitDeleteRoom() {
        this.emit('delete-room');
        console.log(`Room ${this.roomId} deleted by manager.`);
        this.data.state = "deleted";
        roomDeleted(this.data);
    }

    /**
     * Emits a floating reaction
     */
    emitFloatingReaction(reaction) {
        this.emit('floating-reaction', { reaction });
    }

    /**
     * Cleans up expired reactions (> 5 seconds)
     */
    cleanupExpiredReactions() {
        const now = Date.now();
        this.floatingReactions = this.floatingReactions.filter(reaction =>
            now - reaction.timestamp < 5000
        );
    }

    /**
     * Resets all votes
     */
    resetChoose() {
        this.data.votingOrder = [];
        this.players.forEach((player) => {
            this.players.set(player.socket.id, {
                ...player,
                selectedCard: null,
                firstVoter: false,
                slowest: false,
                mostChanging: false,
                voteCount: 0
            });
        });
        this.emitPlayers();
    }

    /**
     * Checks if all players have voted and auto-reveals if enabled
     */
    checkAllPlayersSelected() {
        console.log("Check all players selected");
        if (!this.data.autoReveal) return false;
        console.log("Auto reveal is enabled");

        if (this.timeout) {
            clearTimeout(this.timeout);
            delete this.timeout;
        }

        this.timeout = setTimeout(() => {
            let hasActivePlayer = false;

            for (const player of this.players.values()) {
                console.log("Check player", player.name, player.selectedCard);
                if (player.role === UserRole.PLAYER) {
                    hasActivePlayer = true;
                    if (!player.selectedCard) {
                        console.log("Not all players have selected a card");
                        return;
                    }
                }
            }

            if (!hasActivePlayer) return;

            this.data.state = "result";
            this.emitUpdateGame("result");
        }, 2000);
    }

    /**
     * Updates player badges (first voter, slowest, most changing)
     */
    updatePlayerBadges() {
        let mostChangingPlayer = null;
        let mostVotes = 0;

        this.players.forEach((p) => {
            const count = p.voteCount || 0;
            if (count >= 3 && count > mostVotes) {
                mostVotes = count;
                mostChangingPlayer = p.name;
            }
        });

        this.players.forEach((p) => {
            p.firstVoter = p.name === this.data.votingOrder[0];
            p.slowest = p.name === this.data.votingOrder[this.data.votingOrder.length - 1] && this.data.votingOrder.length > 2;
            p.mostChanging = p.name === mostChangingPlayer && mostVotes >= 3;
            this.players.set(p.socket.id, p);
        });
    }

    /**
     * Adds a player to the room
     */
    addPlayer(socketId, player) {
        this.players.set(socketId, player);
    }

    /**
     * Removes a player from the room
     */
    removePlayer(socketId) {
        this.players.delete(socketId);
        this.floatingReactions = this.floatingReactions.filter(r => !r.id.startsWith(socketId));
    }

    /**
     * Gets a player by their ID
     */
    getPlayer(socketId) {
        return this.players.get(socketId);
    }

    /**
     * Checks if the room is empty
     */
    isEmpty() {
        return this.players.size === 0;
    }
}

module.exports = Room;
