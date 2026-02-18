const { UserRole } = require('../utils/constants');
const { arraysAreEqual } = require('../utils/utils');
const { updateCardsForRoomType } = require('../helpers/roomHelpers');

/**
 * Handles room deletion by the manager
 */
function handleDeleteRoom(room, player, rooms, roomId) {
    if (player.role === UserRole.MANAGER) {
        rooms.delete(roomId);
        room.emitDeleteRoom();
    }
}

/**
 * Handles room configuration updates
 */
function handleUpdateRoom(room, player, data, callback) {
    if (player.role === UserRole.MANAGER) {
        try {
            const { cards, autoReveal } = room.data;
            room.data = { ...room.data, ...data };

            updateCardsForRoomType(room);

            if (!arraysAreEqual(cards, room.data.cards)) {
                room.resetChoose();
            }
            else if (autoReveal !== data?.autoReveal && data?.autoReveal) {
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
}

function handleForceDisconnection({ userId }, rooms, roomId) {
    const room = rooms.get(roomId);
    if (!room) {
        return;
    }
    
    const player = room.getPlayer(userId);
    if (!player) {
        console.warn("Player not found for disconnect with ID:", userId);
        return;
    }

    if (!player.disconnected) {
        console.warn("Player with ID:", userId, "is not marked as disconnected. Ignoring disconnect event.");
        return;
    }

    console.log("Handling disconnect for player with ID:", userId, "in room:", roomId);
    
    room.removePlayer(userId);
    room.emitPlayers();
}

module.exports = {
    handleDeleteRoom,
    handleUpdateRoom,
    handleForceDisconnection
};
