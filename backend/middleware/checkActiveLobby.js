const User = require('../models/User');

const checkActiveLobby = async (req, res, next) => {
    const { host } = req.body;

    const user = await User.findOne({ name: host });
    if (user && user.activeLobby) {
        return res.json({ status: 'FAILED', message: 'You are already hosting another lobby' });
    }
    if (user && user.authenticatorToken == null) {
        return res.json({ status: 'FAILED', message: 'You have already authenticated' });
    }

    next();
};

module.exports = checkActiveLobby;
