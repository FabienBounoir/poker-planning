const rooms = new Map()

const createRoomId = () => {
    let newId;
    do {
        const part1 = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        const part2 = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        newId = `${part1}-${part2}`;
    } while (rooms.has(newId));

    return newId;
};

const roomExist = (roomId) => {
    return rooms.has(roomId)
}

module.exports = {
    rooms,
    roomExist,
    createRoomId
}