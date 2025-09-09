const express = require('express');
const http = require('http');
const { createRoomId, rooms, getTotalUsers } = require('./rooms');
const { createSocketIOServer } = require('./server');
const cors = require('cors');
const { newPokerPlanningCreated, sendFeedback } = require('./utils/statistics');
const { securityHeaders } = require('./utils/security');
const { sanitizeInput, isValidRoomId } = require('./utils/utils');
const packageJson = require('../package.json');
require('dotenv').config();

const app = express();

app.use(express.json({ limit: '1mb' })); // Limit payload size
app.use(securityHeaders); // Add security headers

// Configure CORS with proper origin restrictions
const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:4173', 
    'https://anotherpp.vercel.app',
    process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true
}));

app.get("/room", (req, res) => {
    const { roomId } = req.query;

    // Validate room ID format
    if (!isValidRoomId(roomId)) {
        return res.status(400).json({ error: "Invalid room ID format." });
    }

    const room = rooms.get(roomId);
    if (room) {
        return res.json(room?.data || {});
    }

    return res.status(404).json({ error: "Room doesn't exist." });
})

app.post('/feedback', (req, res) => {
    const { email, feedback, feeling } = req.body;

    // Validate and sanitize inputs
    const sanitizedEmail = sanitizeInput(email, 100);
    const sanitizedFeedback = sanitizeInput(feedback, 1000);
    const sanitizedFeeling = sanitizeInput(feeling, 50);

    if (!sanitizedEmail || !sanitizedFeedback || !sanitizedFeeling) {
        return res.status(400).json({ error: "Missing or invalid fields." });
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(sanitizedEmail)) {
        return res.status(400).json({ error: "Invalid email format." });
    }

    sendFeedback(sanitizedEmail, sanitizedFeedback, sanitizedFeeling)

    res.json({ success: true });
});

app.post('/room', (req, res) => {
    const { type, team, hexcode, avatar, autoReveal, cards, voteOnResults } = req.body;

    const roomId = createRoomId();
    
    // Sanitize team name
    const sanitizedTeam = sanitizeInput(team || 'NFS', 30);
    const formattedTeam = sanitizedTeam.charAt(0).toUpperCase() + sanitizedTeam.slice(1).toLowerCase();

    const roomData = {
        roomId,
        team: formattedTeam,
        cards: [],
        state: 'waiting',
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
            // Validate custom cards if provided
            if (!cards || !Array.isArray(cards) || cards.length === 0 || cards.length > 15) {
                return res.status(400).json({ error: "Invalid cards configuration" });
            }
            // Sanitize custom cards
            roomData.cards = cards.map(card => sanitizeInput(card, 10)).filter(Boolean);
    }

    // Validate hexcode
    if (hexcode) {
        if (/^#[0-9A-F]{6}$/i.test(hexcode)) {
            roomData.hexcode = hexcode;
        }
    }

    // Validate avatar URL
    if (avatar) {
        try {
            const avatarUrl = new URL(avatar);
            if (avatarUrl.protocol === 'https:' && 
                (avatarUrl.hostname === 'api.dicebear.com' || avatarUrl.hostname === 'i.imgur.com')) {
                roomData.avatar = avatar;
            }
        } catch (e) {
            // Invalid URL, ignore
        }
    }

    if (typeof autoReveal === 'boolean') {
        roomData.autoReveal = autoReveal;
    }

    if (typeof voteOnResults === 'boolean') {
        roomData.voteOnResults = voteOnResults;
    }

    rooms.set(roomId, { initialisation: true, data: roomData });
    console.log("NEW ROOM CREATED", roomId);

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

const PORT = process.env.PORT || 5876;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});

process.on("unhandledRejection", async (reason, promise) => {
    console.error(`[UncaughtException_Logs]`, `[REASON] ${reason}`, `[PROMISE REJECT] ${promise}`, reason.stack);
});

process.on("uncaughtException", async (err, origin) => {
    console.error(`[UncaughtException_Logs] ${err}`, `Exception origin: ${origin}`, err.stack);
});