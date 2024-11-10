require('dotenv').config();
require('./config/db.js');

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const cors = require('cors');
const bodyParser = require('express').json();

const UserRouter = require('./api/User.js');
const {router:LobbyRouter} = require('./api/Lobby.js');
const YTMusicAuthRouter = require('./api/ytmusicauth.js');
const GameRouter = require('./api/Game.js');

app.use(cors());
app.use(bodyParser);

app.use('/user', UserRouter);
app.use('/lobby', LobbyRouter);
app.use('/ytmusic', YTMusicAuthRouter);
app.use('/game', GameRouter);

const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

server.on('upgrade', (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, socket => {
        wss.emit('connection', socket, request);
    });
});
