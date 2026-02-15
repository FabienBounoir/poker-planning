const { roomDeleted } = require('../utils/statistics');
const { validateAvatar } = require('../utils/utils');
const { isValidRole } = require('../utils/roles');
const { formatName } = require('../helpers/roomHelpers');

/**
 * Gère la connexion d'un utilisateur à une room
 */
function handleJoin(socket, room, { roomId, name, avatar, role = "player" }) {
    console.log(roomId, name, role);

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
    
    socket.emit("game-update", room.data);

    const player = {
        id: socket.id,
        socket,
        name: formatName(name),
        selectedCard: null,
        role,
        avatar: validateAvatar(avatar),
        voteCount: 0
    };

    room.addPlayer(socket.id, player);
    room.emitPlayers(room.data.state !== "waiting");
}

/**
 * Gère la déconnexion d'un utilisateur
 */
function handleDisconnect(socket, rooms, roomId) {
    console.log(`User ${socket.id} disconnected`);
    
    const room = rooms.get(roomId);
    if (!room) return;
    
    if (room?.data?.state === "deleted") {
        return; // Don't do anything if the room is already deleted
    }

    room.removePlayer(socket.id);

    if (room.players.size) {
        room.emitPlayers(room.data.state !== "waiting");
    } else {
        console.log("Setup Timeout 1 hour to delete inactive room");

        if (['result'].includes(room?.data?.state)) {
            room.data.state = 'waiting';
            room.data.userStory = '';
        }

        room.timeout = setTimeout(() => {
            if (room.isEmpty()) {
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
