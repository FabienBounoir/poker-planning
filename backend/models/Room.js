const { UserRole } = require('../utils/constants');
const { GameState } = require('../utils/constants');
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
            state: GameState.WAITING,
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
        this.cleanupInterval = null;
        
        // Start periodic cleanup of disconnected players (every 30 seconds)
        this.startCleanupInterval();
    }

    /**
     * Starts an interval to periodically clean up disconnected players
     */
    startCleanupInterval() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
        
        this.cleanupInterval = setInterval(() => {
            const hasRemovedPlayers = this.cleanupDisconnectedPlayers();
            if (hasRemovedPlayers) {
                this.emitPlayers(this.data.state !== GameState.WAITING);
            }
        }, 30000); // Check every 30 seconds
    }

    /**
     * Stops the cleanup interval (should be called when room is deleted)
     */
    stopCleanupInterval() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
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
        const playersForManager = [];
        const observersForManager = [];
        
        this.players.forEach((player, id) => {
            const playerData = { ...player, id, socket: undefined };
            
            if (player.role === UserRole.PLAYER) {
                playersForManager.push(playerData);
                // Only include non-disconnected players for non-manager view
                if (!player.disconnected) {
                    players.push(playerData);
                }
            }
            else if (player.role === UserRole.OBSERVER) {
                observersForManager.push(playerData);
                // Only include non-disconnected observers for non-manager view
                if (!player.disconnected) {
                    observers.push(playerData);
                }
            }
        });

        this.players.forEach((player) => {
            if (manager) {
                if (player.role === UserRole.MANAGER) {
                    player.socket.emit("players", { players: playersForManager, observers: observersForManager });
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

        if (state === GameState.RESULT) {
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
        this.stopCleanupInterval();
        this.emit('delete-room');
        console.log(`Room ${this.roomId} deleted by manager.`);
        this.data.state = GameState.DELETED;
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
                console.log("Check player", player.name, player.selectedCard, "disconnected:", player.disconnected);
                // Ignore disconnected players
                if (player.role === UserRole.PLAYER && !player.disconnected) {
                    hasActivePlayer = true;
                    if (!player.selectedCard) {
                        console.log("Not all players have selected a card");
                        return;
                    }
                }
            }

            if (!hasActivePlayer) return;

            this.data.state = GameState.RESULT;
            this.emitUpdateGame(GameState.RESULT);
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
     * Marks a player as disconnected instead of removing them
     */
    markPlayerAsDisconnected(socketId) {
        const player = this.players.get(socketId);
        if (player) {
            player.disconnected = true;
            player.disconnectedAt = Date.now();
            this.players.set(socketId, player);
            this.floatingReactions = this.floatingReactions.filter(r => !r.id.startsWith(socketId));
        }
    }

    /**
     * Finds a disconnected player by userId
     */
    findDisconnectedPlayer(userId) {
        for (const [id, player] of this.players.entries()) {
            if (player.userId === userId && player.disconnected) {
                return { id, player };
            }
        }
        return null;
    }

    /**
     * Reconnects a player by updating their socket and removing disconnected status
     */
    reconnectPlayer(oldSocketId, newSocketId, newSocket, newName = null, newAvatar = null) {
        const player = this.players.get(oldSocketId);
        if (player) {
            // Remove old entry
            this.players.delete(oldSocketId);
            
            // Update player with new socket info
            player.id = newSocketId;
            player.socket = newSocket;
            player.disconnected = false;
            delete player.disconnectedAt;
            
            // Update name and avatar if provided
            if (newName) {
                player.name = newName;
            }
            if (newAvatar !== null) {
                player.avatar = newAvatar;
            }
            
            // Add with new socket ID
            this.players.set(newSocketId, player);
            
            // Check if all players have voted now (in case auto-reveal is enabled)
            if (this.data.state === GameState.PLAYING && player.role === UserRole.PLAYER) {
                this.checkAllPlayersSelected();
            }
            
            return player;
        }
        return null;
    }

    /**
     * Cleans up players that have been disconnected for too long (> 2 minutes)
     */
    cleanupDisconnectedPlayers() {
        const now = Date.now();
        const timeout = 2 * 60 * 1000; // 2 minutes
        
        let hasRemovedPlayers = false;
        
        for (const [id, player] of this.players.entries()) {
            if (player.disconnected && player.disconnectedAt) {
                if (now - player.disconnectedAt > timeout) {
                    console.log(`Removing player ${player.name} after ${timeout/1000}s of disconnection`);
                    this.players.delete(id);
                    hasRemovedPlayers = true;
                }
            }
        }
        
        return hasRemovedPlayers;
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
        // A room is empty if there are no active (non-disconnected) players
        const activePlayers = Array.from(this.players.values()).filter(p => !p.disconnected);
        return activePlayers.length === 0;
    }
}

module.exports = Room;
