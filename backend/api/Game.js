const express = require('express');
const router = express.Router();
const Lobby = require('../models/Lobby');
const User = require('../models/User');

const { spawn } = require('child_process');
const {  sendEventsToAll: sendEventsToAll } = require('./Lobby');

// In-memory store for libraries (this could also be on a per-lobby basis)
let gameSessions = {};

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
router.post('/start', async (req, res) => {
    const { lobbyId } = req.body;

    try {
        const lobby = await Lobby.findById(lobbyId);
        if (!lobby) {
            return res.json({ status: 'FAILED', message: 'Lobby not found' });
        }

        const participants = lobby.participants;
        const users = await User.find({ name: { $in: participants } });
        const userCount = await User.countDocuments({ name: { $in: participants } });
        const rounds = userCount*3;
        console.log('User count:', userCount);

        // Create an object to temporarily store the libraries for each participant in memory
        const userLibraries = {};

        // Loop over each user and fetch their library using their token
        
        for (const user of users) {
            const token = user.authenticatorToken;  // No need to parse, it's already an object
           
            // Log token details (for debugging, if needed)
            

            const library = await fetchUserLibrary(token);  // Fetch the library from Python
            userLibraries[user.name] = library;  // Associate library with the user
        }

        // Store the user libraries in memory associated with the lobby ID
        gameSessions[lobbyId] = {
            userLibraries,
            rounds: [],  // Add additional game state data here as needed
        };
        //console.log('Game session data:', JSON.stringify(gameSessions, null, 2));
        console.log('User1 Library:', userLibraries[users[0].name]);

        // Mark the game as started
        lobby.gameStarted = true;
        await lobby.save();  // Only save the `gameStarted` state to the database
        
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
