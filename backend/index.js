const express = require('express');
const http = require('http');
const { createRoomId, rooms, getTotalUsers } = require('./rooms');
const { createSocketIOServer } = require('./server');
const cors = require('cors');
const { newPokerPlanningCreated, sendFeedback } = require('./utils/statistics');
const { GameState } = require('./utils/constants');
const packageJson = require('../package.json');
require('dotenv').config();

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
    const { roomId } = req.query;

    const room = rooms.get(roomId);
    if (room) {
        return res.json(room?.data || {});
    }

    return res.status(400).json({ error: "Room doesn't exist." });
})

app.post('/feedback', (req, res) => {
    const { email, feedback, feeling } = req.body;

    if (!email || !feedback || !feeling) {
        return res.status(400).json({ error: "Missing fields." });
    }

    sendFeedback(email, feedback, feeling)

    res.json({ success: true });
});

app.post('/room', (req, res) => {
    const { type, team, hexcode, avatar, autoReveal, cards, voteOnResults } = req.body;

    const roomId = createRoomId();
    const formattedTeam = (team || 'NFS').trim().charAt(0).toUpperCase() + (team || 'NFS').slice(1).toLowerCase();

    const roomData = {
        roomId,
        team: formattedTeam,
        cards: [],
        state: GameState.WAITING,
        userStory: '',
        voteOnResults: false,
        type: type || "TSHIRT",
    };

    switch (type) {
        case "TSHIRT":
            roomData.cards = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
            break;
        case "FIBONACCI":
            roomData.cards = ["0", "1", "2", "3", "5", "8", "13", "21"];
            break;
        case "POWEROF2":
            roomData.cards = ["1", "2", "4", "8", "16", "32", "64"];
            break;
        case "SEQUENTIAL":
            roomData.cards = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"];
            break;
        case "TSHIRT_HALF":
            roomData.cards = ['XS', 'S', 'M', 'M/L', 'L', 'XL'];
            break;
        default:
            console.log("Unknown room type", cards);
            if (!cards || cards?.length === 0) return res.status(400).json({ error: "Unknown room type" });
            roomData.cards = cards;
    }

    if (hexcode) {
        roomData.hexcode = hexcode;
    }

    if (avatar) {
        roomData.avatar = avatar;
    }

    if (autoReveal) {
        roomData.autoReveal = autoReveal;
    }

    if (voteOnResults) {
        roomData.voteOnResults = voteOnResults;
    }

    rooms.set(roomId, { initialisation: true, data: roomData });
    console.log("NEW ROOM CREATED", rooms);

    newPokerPlanningCreated(roomData)

    res.json({ roomId });
});

app.get("/health", (req, res) => {
    let body = {
        status: "ok",
        version: packageJson.version || "0.0.0",

        rooms: {
            count: rooms.size,
            users: getTotalUsers(),
        },
        uptime: process.uptime()
    }

    res.status(200).json(body);
})

const server = http.createServer(app);

createSocketIOServer(server, rooms);

const PORT = 5876;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

process.on("unhandledRejection", async (reason, promise) => {
    console.error(`[UncaughtException_Logs]`, `[REASON] ${reason}`, `[PROMISE REJECT] ${promise}`, reason.stack);
});

process.on("uncaughtException", async (err, origin) => {
    console.error(`[UncaughtException_Logs] ${err}`, `Exception origin: ${origin}`, err.stack);
});