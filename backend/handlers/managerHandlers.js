const { UserRole } = require('../utils/roles');
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

module.exports = {
    handleDeleteRoom,
    handleUpdateRoom
};
