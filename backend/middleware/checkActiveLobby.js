// middleware/checkActiveLobby.js
const User = require('../models/User');

const checkActiveLobby = async (req, res, next) => {
    const { host } = req.body;

    const user = await User.findOne({ name: host });
    if (user && user.activeLobby) {
        return res.json({ status: 'FAILED', message: 'You are already hosting another lobby' });
    }

    next();
};

module.exports = checkActiveLobby;
