const express = require('express');
const http = require('http');
const { createRoomId, rooms } = require('./rooms');
const { createSocketIOServer } = require('./server');
const cors = require('cors')

const app = express();

app.use(express.json());

app.use(cors({
    origin: "*",
    methods: ["GET", "POST", "PATCH", "OPTIONS", "PUT", "OPTIONS"]
}))

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.get("/room", (req, res) => {
    console.log("req.query;", req.query)
    const { roomId } = req.query;

    if (rooms.get(roomId)) {
        return res.json({ roomId });
    }

    return res.status(400).json({ error: "Room doesn't exist." });
})

app.post('/room', (req, res) => {
    const { type, team } = req.body;

    if (!["TSHIRT", "FIBONACCI", "POWEROF2", "SEQUENTIAL", "TSHIRT_HALF"].includes(type)) {
        return res.status(400).json({ error: "Invalid room type" });
    }

    const roomId = createRoomId();
    const formattedTeam = (team || 'NFS').trim().charAt(0).toUpperCase() + (team || 'NFS').slice(1).toLowerCase();

    const roomData = {
        team: formattedTeam,
        cards: [],
        state: 'waiting',
        userStory: ''
    };

    switch (type) {
        case "TSHIRT":
            roomData.cards = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
            break;
        case "FIBONACCI":
            roomData.cards = ["1", "2", "3", "5", "8", "13", "21"];
            break;
        case "POWEROF2":
            roomData.cards = ["1", "2", "4", "8", "16", "32"];
            break;
        case "SEQUENTIAL":
            roomData.cards = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
            break;
        case "TSHIRT_HALF":
            roomData.cards = ['XS', 'S', 'M', 'M/L', 'L', 'XL'];
            break;
        default:
            return res.status(400).json({ error: "Unknown room type" });
    }

    rooms.set(roomId, { initialisation: true, data: roomData });
    console.log("NEW ROOM CREATED", rooms);

    res.json({ roomId });
});

const server = http.createServer(app);

createSocketIOServer(server, rooms);

const PORT = 5876;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
