const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    dateOfBirth: Date,
    activeLobby: {
        type: String, // Change the type to String
        default: null
    }
});

module.exports = mongoose.model('User', userSchema);
