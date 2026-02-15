const { UserRole } = require('../utils/roles');

/**
 * Handles player voting
 */
function handleVote(room, socket, data, callback) {
    try {
        const player = room.getPlayer(socket.id);
        if (!room?.data?.cards?.includes?.(data.card) && data.card != null) return;

        if (room.data.state !== "result") {
            player.voteCount = (player.voteCount || 0) + 1;

            const index = room.data.votingOrder.indexOf(player.name);
            if (index > -1) {
                room.data.votingOrder.splice(index, 1);
            }

            if (data.card !== null) {
                room.data.votingOrder.push(player.name);
            }

            room.updatePlayerBadges();
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
}

/**
 * Handles game state changes
 */
function handleState(room, data) {
    room.data.state = data.state;
    if (data.userStory) {
        room.data.userStory = data.userStory;
    }

    if (data.state === "playing") {
        room.resetChoose();
    }

    room.emitUpdateGame(data.state);
}

/**
 * Handles color changes
 */
function handleHexcode(room, data) {
    room.data.hexcode = data.hexcode;
    room.emit("hexcode", { hexcode: data.hexcode }, false);
}

/**
 * Handles role changes (player <-> observer)
 */
function handleToggleRole(room, socket, callback) {
    const player = room.getPlayer(socket.id);
    let change = false;

    if (player.role === UserRole.OBSERVER) {
        player.role = UserRole.PLAYER;
        change = true;
    }
    else if (player.role === UserRole.PLAYER) {
        player.role = UserRole.OBSERVER;
        player.selectedCard = null;

        const index = room.data.votingOrder.indexOf(player.name);
        if (index > -1) {
            room.data.votingOrder.splice(index, 1);
        }
        change = true;
    }

    if (change) {
        room.updatePlayerBadges();
        room.players.set(socket.id, player);
        room.emitPlayers();

        callback({ success: true, role: player.role });
        room.checkAllPlayersSelected();
    }
    else {
        callback({ success: false, error: "Role not changed" });
    }
}

/**
 * Handles reaction sending
 */
function handleReaction(room, socket, data, callback) {
    try {
        const { emoji } = data;
        if (!emoji || typeof emoji !== 'string') {
            return callback({ success: false, error: "Invalid emoji" });
        }

        const player = room.getPlayer(socket.id);
        room.cleanupExpiredReactions();
        room.floatingReactions = room.floatingReactions.filter(r => !r.id.startsWith(socket.id));

        const x = Math.random() * 70 + 10;
        const y = Math.random() * 60 + 20;

        const reaction = {
            id: `${socket.id}`,
            emoji,
            userName: player.name,
            userAvatar: player.avatar || room.data.avatar + `?seed=${player.name}`,
            x,
            y,
            timestamp: Date.now()
        };

        room.floatingReactions.push(reaction);
        room.emitFloatingReaction(reaction);

        callback({ success: true });
    } catch (e) {
        console.error("Error when handling reaction", e);
        callback({ success: false, error: e.message });
    }
}

module.exports = {
    handleVote,
    handleState,
    handleHexcode,
    handleToggleRole,
    handleReaction
};
