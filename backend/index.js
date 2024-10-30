const express = require('express');
const http = require('http');
const { createRoomId, rooms } = require('./rooms');
const { createSocketIOServer } = require('./server');
const cors = require('cors')

// Créez une instance Express pour les routes API
const app = express();

// Middleware pour interpréter le JSON dans les requêtes
app.use(express.json());

app.use(cors())

app.get("/api/room", (req, res) => {
    console.log("req.query;", req.query)
    const { roomId } = req.query;

    if (rooms.get(roomId)) {
        return res.json({ roomId });
    }

    return res.status(400).json({ error: "Room doesn't exist." });
})

// Route API pour créer une nouvelle salle
app.post('/api/room', (req, res) => {
    const { type, team } = req.body;

    if (!["TSHIRT", "FIBONACCI", "POWEROF2", "SEQUENTIAL", "TSHIRT_HALF"].includes(type)) {
        return res.status(400).json({ error: "Invalid room type" });
    }

    const roomId = createRoomId();
    const formattedTeam = (team || 'NFS').trim().charAt(0).toUpperCase() + (team || 'NFS').slice(1).toLowerCase();

    // Initialisation des données de la salle
    const roomData = {
        team: formattedTeam,
        cards: [],
        state: 'waiting',
        userStory: ''
    };

    // Associer les cartes en fonction du type de salle
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

    // Ajouter la nouvelle salle à la liste des salles
    rooms.set(roomId, { initialisation: true, data: roomData });
    console.log("NEW ROOM CREATED", rooms);

    // Répondre avec l'ID de la salle
    res.json({ roomId });
});

// Création du serveur HTTP et intégration d'Express
const server = http.createServer(app);

// Créez le serveur Socket.IO en l'associant au serveur HTTP
createSocketIOServer(server, rooms);

// Démarrez le serveur
const PORT = 5876;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
