// server.js
require('dotenv').config();
require('./config/db.js');

const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const UserRouter = require('./api/User.js');
const LobbyRouter = require('./api/Lobby.js');
const bodyParser = require('express').json();
const cors = require('cors');

app.use(cors());
app.use(bodyParser);

app.use('/user', UserRouter);
app.use('/lobby', LobbyRouter);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
