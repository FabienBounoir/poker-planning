const { UserRole } = require('../utils/roles');
const { arraysAreEqual } = require('../utils/utils');
const { updateCardsForRoomType } = require('../helpers/roomHelpers');

/**
 * Gère la suppression d'une room par le manager
 */
function handleDeleteRoom(room, player, rooms, roomId) {
    if (player.role === UserRole.MANAGER) {
        rooms.delete(roomId);
        room.emitDeleteRoom();
    }
}

/**
 * Gère la mise à jour de la configuration d'une room
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
