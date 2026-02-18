const { Server } = require('socket.io');
const Room = require('./models/Room');
const { handleJoin, handleDisconnect } = require('./handlers/connectionHandler');
const { handleVote, handleState, handleHexcode, handleToggleRole, handleReaction } = require('./handlers/messageHandlers');
const { handleDeleteRoom, handleUpdateRoom, handleForceDisconnection } = require('./handlers/managerHandlers');

let io;

const createSocketIOServer = (server, rooms) => {
    if (io) return io;

    function getRooms(roomId) {
        let room = rooms.get(roomId);

        if (!room) {
            return null;
        }

        if (room?.initialisation) {
            const newRoom = new Room(roomId, room.data);
            rooms.set(roomId, newRoom);
            return newRoom;
        }

        return room;
    }

    io = new Server(server, { cors: { origin: "*" } });

    io.on('connection', (socket) => {
        socket.on('join', (joinData) => {
            const { roomId } = joinData;
            const room = getRooms(roomId);
            
            if (!room) {
                console.warn("Room doesn't exist");
                return socket.emit("error", { reason: "Room doesn't exist" });
            }
            
            handleJoin(socket, room, joinData);

            socket.on('disconnect', () => {
                handleDisconnect(socket, rooms, roomId);
            });

            socket.on('message', ({ type, data }, callback) => {
                const player = room.getPlayer(socket.id);

                switch (type) {
                    case 'vote':
                        handleVote(room, socket, data, callback);
                        break;
                    
                    case 'state':
                        handleState(room, data);
                        break;
                    
                    case 'hexcode':
                        handleHexcode(room, data);
                        break;
                    
                    case 'toggleRole':
                        handleToggleRole(room, socket, callback);
                        break;
                    
                    case 'reaction':
                        handleReaction(room, socket, data, callback);
                        break;
                    
                    case 'delete-room':
                        handleDeleteRoom(room, player, rooms, roomId);
                        break;
                    
                    case 'update-room':
                        handleUpdateRoom(room, player, data, callback);
                        break;
                    
                    case 'disconnect-user':
                        handleForceDisconnection(data, rooms, roomId);
                        break;
                    
                    default:
                        console.log("EVENT " + type + " doesn't exist");
                }
            });
        });
    });

    return io;
};

module.exports = {
    createSocketIOServer
};
