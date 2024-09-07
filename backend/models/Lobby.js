const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const LobbySchema = new Schema({
    _id: { type: String, required: true },  // Ensure the _id field is a string
    host: { type: String, required: true },
    participants: { type: [String], required: true },
    gameStarted: { type: Boolean, default: false },
    
});

const Lobby = mongoose.model('Lobby', LobbySchema);
module.exports = Lobby;
