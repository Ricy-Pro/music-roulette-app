const express = require('express');
const router = express.Router();
const Lobby = require('../models/Lobby.js');

// Dynamically import nanoid
let nanoid;
(async () => {
  nanoid = (await import('nanoid')).nanoid;
})();

// Create a new lobby
router.post('/create', async (req, res) => {
    const { host } = req.body;
    if (!host) {
        return res.json({ status: 'FAILED', message: 'Host is required' });
    }

    const lobbyId = nanoid(5);  // Generate a short ID with a length of 10 characters
    const newLobby = new Lobby({ _id: lobbyId, host, participants: [host] });
    
    newLobby.save()
        .then(lobby => res.json({ status: 'SUCCESS', message: 'Lobby created', lobby }))
        .catch(err => res.json({ status: 'FAILED', message: 'An error occurred', err }));
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

module.exports = router;
