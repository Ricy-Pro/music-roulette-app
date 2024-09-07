const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    access_token: String,
    refresh_token: String,
    scope: String,
    token_type: String,
    expires_at: Number, // Store as a UNIX timestamp for easier comparison
    expires_in: Number  // Store the duration for when it was generated
});

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    dateOfBirth: Date,
    activeLobby: {
        type: String,
        default: null
    },
    authenticatorToken: {
        type: tokenSchema, // Nested schema to store OAuth tokens
        default: null
    }
});

module.exports = mongoose.model('User', userSchema);
