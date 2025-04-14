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

const getTotalUsers = () => {
    let totalUsers = 0;
    rooms.forEach((room) => {
        totalUsers += room?.players?.size || 0;
    });
    return totalUsers;
}


module.exports = {
    rooms,
    roomExist,
    createRoomId,
    getTotalUsers
}