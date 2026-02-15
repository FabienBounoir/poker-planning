const { UserRole } = require('../utils/constants');

/**
 * Traite les résultats du vote et met à jour l'historique
 */
function processResultState(room, element) {
    let resultsByItem = new Map();
    let totalPlayers = 0;

    if (!room.history) {
        room.history = [];
    }

    let historyEntry = {
        story: room?.data?.userStory || null,
        winner: null,
        results: [],
    };

    room.players.forEach((player) => {
        const selectedCard = player?.selectedCard?.toUpperCase?.();
        if (player.role === UserRole.PLAYER && selectedCard) {
            totalPlayers++;
            if (!resultsByItem.has(selectedCard)) {
                resultsByItem.set(selectedCard, []);
            }
            resultsByItem.get(selectedCard).push({ name: player.name, avatar: player.avatar });

            historyEntry.results.push({ name: player.name, card: selectedCard });
        }
    });

    if (resultsByItem.size > 0) {
        try {
            const result = Array.from(resultsByItem).map(([item, players]) => ({
                item,
                players,
                pourcentage: Math.round((players.length / totalPlayers) * 100).toFixed(0)
            })).sort((a, b) => b.players.length - a.players.length);

            room.data.result = element.result = result;
            historyEntry.winner = result[0].item;

            if (resultsByItem.size > 1) {
                const lastItem = result[result.length - 1];
                const userSelected = lastItem.players[Math.floor(Math.random() * lastItem.players.length)];
                room.data.defender = element.defender = { ...userSelected, item: lastItem.item };
            }
            else {
                room.data.defender = element.defender = null;
            }
        } catch (e) {
            console.error("ERROR WHEN PROCESSING RESULT", e);
        }
    }

    // update story history if exists, otherwise add it
    const existingHistoryIndex = room.history.findIndex(h => h.story === historyEntry.story);
    if (existingHistoryIndex !== -1) {
        room.history[existingHistoryIndex] = historyEntry;
    } else {
        room.history.push(historyEntry);
    }

    element.history = room.history;
}

/**
 * Formate un nom en mettant la première lettre de chaque segment en majuscule
 */
function formatName(name) {
    return name
        .trim()
        .split(/[\s.]+/)
        .map(segment =>
            segment.charAt(0).toUpperCase() + segment.slice(1)
        )
        .join(' ');
}

/**
 * Updates cards based on room type
 */
function updateCardsForRoomType(room) {
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
            if (!room?.data?.cards || room?.data?.cards?.length === 0) {
                throw new Error("No cards defined for unknown room type");
            }
    }
}

module.exports = {
    processResultState,
    formatName,
    updateCardsForRoomType
};
