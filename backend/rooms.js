const rooms = new Map()
const uuidToRoomId = new Map()

const createRoomId = () => {
    let newId;
    do {
        const part1 = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const part2 = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        newId = `${part1}-${part2}`;
    } while (rooms.has(newId));

    return newId;
};

const generateUUID = () => {
    // Génère un UUID v4 simple
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};

const createUUIDForRoom = (roomId) => {
    const room = rooms.get(roomId);

    // Si la room a déjà un UUID, le retourner
    if (room?.uuid) {
        return room.uuid;
    }

    // Sinon, créer un nouveau UUID
    const uuid = generateUUID();

    // L'associer dans la map de résolution
    uuidToRoomId.set(uuid, roomId);

    // Stocker l'UUID dans les données de la room
    if (room) {
        room.uuid = uuid;
    }

    return uuid;
};

const getRoomIdFromUUID = (uuid) => {
    // Si l'UUID existe, retourner le roomId associé
    if (uuidToRoomId.has(uuid)) {
        return uuidToRoomId.get(uuid);
    }

    // L'UUID n'existe pas - retourner null
    // La room doit être créée via POST /room d'abord
    return null;
};

const roomExist = (roomId) => {
    return rooms.has(roomId)
}

const getTotalUsers = () => {
    let totalUsers = 0;
    rooms.forEach((room) => {
        totalUsers += room?.players?.size || 0;
    });
    return totalUsers;
}

const cleanupUUIDMappings = (roomId) => {
    // Nettoyer les mappings UUID quand une room est supprimée
    const room = rooms.get(roomId);
    if (room?.uuid) {
        uuidToRoomId.delete(room.uuid);
    }
};


module.exports = {
    rooms,
    roomExist,
    createRoomId,
    getTotalUsers,
    generateUUID,
    createUUIDForRoom,
    getRoomIdFromUUID,
    cleanupUUIDMappings,
    uuidToRoomId
}