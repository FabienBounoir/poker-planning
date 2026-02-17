const { roomDeleted } = require('../utils/statistics');
const { validateAvatar, generateUserId } = require('../utils/utils');
const { isValidRole, GameState, UserRole } = require('../utils/constants');
const { formatName } = require('../helpers/roomHelpers');

/**
 * Handles user connection to a room
 */
function handleJoin(socket, room, { roomId, name, avatar, role = "player", userId = null }) {
    console.log(roomId, name, role, "userId:", userId);

    if (!name) {
        console.warn("User without name");
        return socket.disconnect(true);
    }

    if (!isValidRole(role)) {
        console.warn("Invalid role");
        return socket.disconnect(true);
    }

    console.log('New connection with ID:', socket.id);

    if (room.timeout) {
        clearTimeout(room.timeout);
        delete room.timeout;
        console.log("Timeout removed for room", roomId, "because user", socket.id, "reconnected.");
    }
    
    // Check if a disconnected player with the same userId exists
    let reconnectedPlayer = null;
    if (userId) {
        const disconnectedPlayer = room.findDisconnectedPlayer(userId);
        if (disconnectedPlayer) {
            // Reconnect the existing player with updated name and avatar
            
            console.log(`Reconnecting player ${name} (userId: ${userId}) with new socket ${socket.id}`);
            reconnectedPlayer = room.reconnectPlayer(
                disconnectedPlayer.id, 
                socket.id, 
                socket, 
                { name: formatName(name), avatar: validateAvatar(avatar), role }
            );
            
            if (reconnectedPlayer) {
                socket.emit("game-update", room.data);
                socket.emit("user-id", { userId: reconnectedPlayer.userId });
                
                // Send the player's current state (including their vote)
                socket.emit("player-state", {
                    selectedCard: reconnectedPlayer.selectedCard,
                    voteCount: reconnectedPlayer.voteCount,
                    firstVoter: reconnectedPlayer.firstVoter,
                    slowest: reconnectedPlayer.slowest,
                    mostChanging: reconnectedPlayer.mostChanging
                });
                
                room.emitPlayers();
                console.log(`Player ${name} successfully reconnected (name updated to: ${name}, vote: ${reconnectedPlayer.selectedCard || 'none'})`);
                return;
            }
        }
    }
    
    // No disconnected player found or reconnection failed, create new player
    const newUserId = userId || generateUserId();
    
    socket.emit("game-update", room.data);
    socket.emit("user-id", { userId: newUserId });

    const player = {
        id: socket.id,
        socket,
        name: formatName(name),
        selectedCard: null,
        role,
        avatar: validateAvatar(avatar),
        voteCount: 0,
        disconnected: false,
        userId: newUserId
    };

    room.addPlayer(socket.id, player);
    room.emitPlayers();
}

/**
 * Handles user disconnection
 */
function handleDisconnect(socket, rooms, roomId) {
    console.log(`User ${socket.id} disconnected`);
    
    const room = rooms.get(roomId);
    if (!room) return;
    
    if (room?.data?.state === GameState.DELETED) {
        return; // Don't do anything if the room is already deleted
    }

    const player = room.getPlayer(socket.id);
    
    // Only use soft disconnect for players - remove managers and observers immediately
    if (player && (player.role === UserRole.PLAYER)) {
        console.log(`Soft disconnecting player ${player.name} (socket: ${socket.id})`);
        // Mark player as disconnected instead of removing
        room.markPlayerAsDisconnected(socket.id);
    } else {
        room.removePlayer(socket.id);
    }

    // Count active (non-disconnected) players
    const activePlayers = Array.from(room.players.values()).filter(p => !p.disconnected);

    if (activePlayers.length > 0) {
        room.emitPlayers();
    } else {
        console.log("Setup Timeout 1 hour to delete inactive room");

        if ([GameState.RESULT].includes(room?.data?.state)) {
            room.data.state = GameState.WAITING;
            room.data.userStory = '';
            room.history = [];
        }

        room.timeout = setTimeout(() => {
            if (room.isEmpty()) {
                room.stopCleanupInterval();
                rooms.delete(roomId);
                console.log(`Room ${roomId} deleted after inactivity.`);
                roomDeleted(room.data);
            }
        }, 3600000); // 1 hour
    }
}

module.exports = {
    handleJoin,
    handleDisconnect
};
