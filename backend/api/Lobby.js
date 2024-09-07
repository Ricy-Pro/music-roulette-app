const express = require('express');
const router = express.Router();
const Lobby = require('../models/Lobby');
const User = require('../models/User');

let clients = [];

const addClient = (clientId, res) => {
    clients.push({ id: clientId, res });
};

const removeClient = (clientId) => {
    clients = clients.filter(client => client.id !== clientId);
};

const sendEventsToAll = (newData) => {
    clients.forEach(client => {
        client.res.json(newData);
        client.res.end(); // Close the connection after sending the data
    });
    clients = []; // Clear the clients after sending the data
    console.log('Broadcasting data:', newData);
};

router.get('/events', (req, res) => {
    const clientId = Date.now();
    addClient(clientId, res);

    req.on('close', () => {
        console.log(`Client ${clientId} disconnected`);
        removeClient(clientId);
    });
});

const generateShortId = async () => {
    const { nanoid } = await import('nanoid');
    return nanoid(4);
};

router.post('/create', async (req, res) => {
    const { host } = req.body;
    if (!host) {
        return res.json({ status: 'FAILED', message: 'Host is required' });
    }

    try {
        const existingUser = await User.findOne({ name: host });
        if (existingUser && existingUser.activeLobby) {
            return res.json({ status: 'FAILED', message: 'User already hosting a lobby' });
        }

        const lobbyId = await generateShortId();
        const newLobby = new Lobby({ _id: lobbyId, host, participants: [host] });
        const lobby = await newLobby.save();

        await User.findOneAndUpdate({ name: host }, { activeLobby: lobby._id });

        const data = { status: 'SUCCESS', message: 'Lobby created', lobby };
        sendEventsToAll(data);
        res.json(data);
    } catch (err) {
        console.error('Error creating lobby:', err);
        res.json({ status: 'FAILED', message: 'An error occurred', err });
    }
});

router.post('/join', async (req, res) => {
    const { lobbyId, participant } = req.body;
    try {
        const lobby = await Lobby.findById(lobbyId);
        if (!lobby) return res.json({ status: 'FAILED', message: 'Lobby not found' });

        if (lobby.participants.includes(participant)) {
            return res.json({ status: 'FAILED', message: 'Participant already in the lobby' });
        }

        lobby.participants.push(participant);
        const updatedLobby = await lobby.save();

        const data = { status: 'SUCCESS', message: 'Participant joined', updatedLobby };
        sendEventsToAll(data);
        res.json(data);
    } catch (err) {
        console.error('Error joining lobby:', err);
        res.json({ status: 'FAILED', message: 'An error occurred', err });
    }
});

router.post('/leave', async (req, res) => {
    const { lobbyId, participant } = req.body;

    console.log('Leave request:', { lobbyId, participant }); // Debug log

    if (!participant) {
        return res.json({ status: 'FAILED', message: 'Participant name is required' });
    }

    try {
        const lobby = await Lobby.findById(lobbyId);
        if (!lobby) {
            console.log(`Lobby ${lobbyId} not found`);
            return res.json({ status: 'FAILED', message: 'Lobby not found' });
        }

        console.log(`Lobby fetched: ${JSON.stringify(lobby)}`);

        const index = lobby.participants.indexOf(participant);
        if (index === -1) {
            console.log(`Participant ${participant} not found in lobby ${lobbyId}`);
            return res.json({ status: 'FAILED', message: 'Participant not found in lobby' });
        }

        lobby.participants.splice(index, 1);

        if (lobby.host === participant) {
            if (lobby.participants.length === 0) {
                // Use findByIdAndDelete to delete the lobby
                await Lobby.findByIdAndDelete(lobbyId);
                await User.findOneAndUpdate({ name: participant }, { activeLobby: null });
                console.log(`Lobby ${lobbyId} deleted as host left`);
                sendEventsToAll({ status: 'SUCCESS', message: 'Lobby deleted as host left', lobbyId });
                return res.json({ status: 'SUCCESS', message: 'Lobby deleted', lobbyId });
            } else {
                const newHost = lobby.participants[0];
                lobby.host = newHost;
                await lobby.save();
                await User.findOneAndUpdate({ name: participant }, { activeLobby: null });
                await User.findOneAndUpdate({ name: newHost }, { activeLobby: lobby._id });
                sendEventsToAll({ status: 'SUCCESS', message: 'Host left, new host assigned', updatedLobby: lobby });
                return res.json({ status: 'SUCCESS', message: 'New host assigned', updatedLobby: lobby });
            }
        } else {
            await lobby.save();
            await User.findOneAndUpdate({ name: participant }, { activeLobby: null });
            sendEventsToAll({ status: 'SUCCESS', message: 'Participant left', updatedLobby: lobby });
            return res.json({ status: 'SUCCESS', message: 'Participant left', updatedLobby: lobby });
        }
    } catch (err) {
        console.error('Error leaving lobby:', err);
        res.json({ status: 'FAILED', message: 'An error occurred', err });
    }
});

router.post('/delete', async (req, res) => {
    const { host } = req.body;

    try {
        const lobby = await Lobby.findOneAndDelete({ host });
        if (lobby) {
            await User.findOneAndUpdate({ name: host }, { activeLobby: null });

            const data = { status: 'SUCCESS', message: 'Lobby deleted' };
            sendEventsToAll(data);
            res.json(data);
        } else {
            res.json({ status: 'FAILED', message: 'Lobby not found or already deleted' });
        }
    } catch (err) {
        console.error('Error deleting lobby:', err);
        res.json({ status: 'FAILED', message: 'An error occurred', err });
    }
});

router.get('/:lobbyId', async (req, res) => {
    const { lobbyId } = req.params;

    try {
        const lobby = await Lobby.findById(lobbyId);
        if (!lobby) {
            return res.json({ status: 'FAILED', message: 'Lobby not found' });
        }
        res.json({ status: 'SUCCESS', lobby });
    } catch (err) {
        console.error('Error fetching lobby details:', err);
        res.json({ status: 'FAILED', message: 'An error occurred', err });
    }
});

module.exports = router;
