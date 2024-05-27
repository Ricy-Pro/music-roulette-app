const express = require('express');
const router = express.Router();
const Lobby = require('../models/Lobby.js');
const User = require('../models/User');
const checkActiveLobby = require('../middleware/checkActiveLobby');

// Utility function to generate a short ID using nanoid
async function generateShortId() {
    const { nanoid } = await import('nanoid');
    return nanoid(4); // Generate a 6-character ID
}

// Create a new lobby
router.post('/create', checkActiveLobby, async (req, res) => {
    const { host } = req.body;
    if (!host) {
        return res.json({ status: 'FAILED', message: 'Host is required' });
    }

    try {
        const lobbyId = await generateShortId();
        const newLobby = new Lobby({ _id: lobbyId, host, participants: [host] });
        const lobby = await newLobby.save();

        // Update the host's activeLobby field
        await User.findOneAndUpdate({ name: host }, { activeLobby: lobby._id });

        res.json({ status: 'SUCCESS', message: 'Lobby created', lobby });
    } catch (err) {
        res.json({ status: 'FAILED', message: 'An error occurred', err });
    }
});

// Join an existing lobby
router.post('/join', (req, res) => {
    const { lobbyId, participant } = req.body;
    Lobby.findById(lobbyId)
        .then(lobby => {
            if (!lobby) return res.json({ status: 'FAILED', message: 'Lobby not found' });
            lobby.participants.push(participant);
            lobby.save()
                .then(updatedLobby => res.json({ status: 'SUCCESS', message: 'Joined lobby', updatedLobby }))
                .catch(err => res.json({ status: 'FAILED', message: 'An error occurred', err }));
        })
        .catch(err => res.json({ status: 'FAILED', message: 'An error occurred', err }));
});

// Delete a lobby
router.post('/delete', async (req, res) => {
    const { host } = req.body;

    try {
        const lobby = await Lobby.findOneAndDelete({ host });
        if (lobby) {
            // Update the host's activeLobby field
            await User.findOneAndUpdate({ name: host }, { activeLobby: null });

            res.json({ status: 'SUCCESS', message: 'Lobby deleted' });
        } else {
            res.json({ status: 'FAILED', message: 'Lobby not found or already deleted' });
        }
    } catch (err) {
        res.json({ status: 'FAILED', message: 'An error occurred', err });
    }
});

module.exports = router;
