const express = require('express');
const router = express.Router();
const Lobby = require('../models/Lobby');
const User = require('../models/User');

const { spawn } = require('child_process');
const {  sendEventsToAll: sendEventsToAll } = require('./Lobby');

// In-memory store for libraries (this could also be on a per-lobby basis)

let gameSessions = {};  // Store session data in memory

// Initialize game session data
const initializeGameSession = (lobbyId, users) => {
    const userLibraries = {};
    users.forEach(user => {
        userLibraries[user.name] = { songs: [], count: 3 };  // Fill with songs from fetchUserLibrary
    });

    gameSessions[lobbyId] = {
        currentRound: 0,
        totalRounds: users.length * 3,
        userLibraries,
        scores: {},  // Track scores per player
        roundData: [],  // History of rounds
    };
};

// Function to fetch library using Python script
const fetchUserLibrary = (token) => {
    return new Promise((resolve, reject) => {
        // Remove the _id field from the token object if it exists
        // Convert the Mongoose document to a plain JavaScript object
        const plainToken = token.toObject();

        // Now you can safely delete the _id field
        delete plainToken._id;

        console.log('Token type:', typeof plainToken);
        console.log('Token:', plainToken);

        // Pass the token to your Python process or use it as needed

        // Pass the token object directly to the Python script
        const pythonProcess = spawn('python3', ['ytmusic_service.py', JSON.stringify(plainToken)]);

        let dataString = '';

        // Capture the data coming from the Python process
        pythonProcess.stdout.on('data', (data) => {
            dataString += data.toString();
        });

        pythonProcess.stderr.on('data', (data) => {
            console.error(`Python error: ${data}`);
            reject(data);
        });

        // When the Python process exits, resolve the library data
        pythonProcess.on('close', (code) => {
            try {
                const library = JSON.parse(dataString);  // Parse the received library data
                resolve(library);
            } catch (error) {
                reject('Error parsing library data');
            }
        });
    });
};

// Route to start the game
// Route to start the game
router.post('/start', async (req, res) => {
    const { lobbyId } = req.body;

    try {
        const lobby = await Lobby.findById(lobbyId);
        if (!lobby) {
            return res.json({ status: 'FAILED', message: 'Lobby not found' });
        }

        const participants = lobby.participants;
        const users = await User.find({ name: { $in: participants } });
        initializeGameSession(lobbyId, users);

        // Populate the user libraries
        for (const user of users) {
            const library = await fetchUserLibrary(user.authenticatorToken);
            gameSessions[lobbyId].userLibraries[user.name].songs = library;
        }

        lobby.gameStarted = true;
        await lobby.save();

        const gameStartData = {
            status: 'SUCCESS',
            message: 'Game started',
            lobby
        };
        sendEventsToAll(gameStartData); 
        
        res.json(gameStartData);
        } catch (err) {
        console.error('Error starting game:', err);
        res.json({ status: 'FAILED', message: 'An error occurred', err });
        }
});

router.get('/nextRound', async (req, res) => {
    const { lobbyId } = req.query;
    const session = gameSessions[lobbyId];

    if (!session) return res.json({ status: 'FAILED', message: 'Session not found' });
    if (session.currentRound >= session.totalRounds) return res.json({ status: 'COMPLETE', message: 'Game has ended' });

    let chosenPlayer, chosenSong;
    do {
        chosenPlayer = Object.keys(session.userLibraries)[Math.floor(Math.random() * Object.keys(session.userLibraries).length)];
        const playerLibrary = session.userLibraries[chosenPlayer];
        chosenSong = playerLibrary.songs[Math.floor(Math.random() * playerLibrary.songs.length)];
    } while (session.userLibraries[chosenPlayer].count <= 0);

    session.userLibraries[chosenPlayer].count -= 1;
    session.currentRound += 1;

    const roundData = {
        roundNumber: session.currentRound,
        song: chosenSong,
        players: Object.keys(session.userLibraries),
        correctPlayer: chosenPlayer,
    };
    session.roundData.push(roundData);

    res.json({ status: 'SUCCESS', roundData });
});

router.post('/vote', async (req, res) => {
    const { lobbyId, player, voter } = req.body;
    const session = gameSessions[lobbyId];
    const roundData = session.roundData[session.currentRound - 1];  // Get latest round

    if (roundData.correctPlayer === player) {
        session.scores[voter] = (session.scores[voter] || 0) + 1;  // Award point
        res.json({ status: 'SUCCESS', message: 'Correct guess!', score: session.scores[voter] });
    } else {
        res.json({ status: 'FAILED', message: 'Incorrect guess' });
    }
});



router.post('/end', async (req, res) => {
    const { lobbyId } = req.body;

    try {
        const lobby = await Lobby.findById(lobbyId);
        if (!lobby) {
            return res.json({ status: 'FAILED', message: 'Lobby not found' });
        }

        // Game logic for ending the game can be added here
        // For example, you could calculate final scores, etc.

        // Clean up the game session data from memory
        delete gameSessions[lobbyId];

        res.json({ status: 'SUCCESS', message: 'Game ended and session data cleared' });
    } catch (err) {
        console.error('Error ending game:', err);
        res.json({ status: 'FAILED', message: 'An error occurred', err });
    }
});


module.exports = router;
