require('dotenv').config();
require('./config/db.js');

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const cors = require('cors');
const bodyParser = require('express').json();

// Import routes
const UserRouter = require('./api/User.js');
const LobbyRouter = require('./api/Lobby.js');
const YTMusicAuthRouter = require('./api/ytmusicauth.js'); // Import the YTMusicAuth routes

// Middleware
app.use(cors());
app.use(bodyParser);

// Use routes
app.use('/user', UserRouter);
app.use('/lobby', LobbyRouter);
app.use('/ytmusic', YTMusicAuthRouter); // Use the YTMusicAuth routes

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
