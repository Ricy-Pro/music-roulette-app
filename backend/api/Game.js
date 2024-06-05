const express = require('express');
const router = express.Router();
const Lobby = require('../models/Lobby');
const User = require('../models/User');

// Start a game in a lobby
router.post('/start', async (req, res) => {
    const { lobbyId } = req.body;

    try {
        const lobby = await Lobby.findById(lobbyId);
        if (!lobby) {
            return res.json({ status: 'FAILED', message: 'Lobby not found' });
        }

        // Add logic to initialize the game state here
        lobby.gameStarted = true;
        await lobby.save();

        res.json({ status: 'SUCCESS', message: 'Game started', lobby });
    } catch (err) {
        res.json({ status: 'FAILED', message: 'An error occurred', err });
    }
});

// Example route to handle player actions
router.post('/action', async (req, res) => {
    const { lobbyId, playerId, action } = req.body;

    try {
        const lobby = await Lobby.findById(lobbyId);
        if (!lobby) {
            return res.json({ status: 'FAILED', message: 'Lobby not found' });
        }

        // Process the player's action
        // For example, if it's a turn-based game, update the game state accordingly
        // This is a placeholder for actual game logic

        res.json({ status: 'SUCCESS', message: 'Action processed', lobby });
    } catch (err) {
        res.json({ status: 'FAILED', message: 'An error occurred', err });
    }
});

module.exports = router;
