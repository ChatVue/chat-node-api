const router = require('express').Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const errorHandler = require('../utils/errorHandler.js');
const { decodeToken, prepareToken, prepareRefreshToken } = require('../utils/token');
const config = require('../config');

const User = require('../models/user');

function getAndSaveNewRefreshToken(user, headers) {
    const refreshToken = prepareRefreshToken(user, headers);

    if (!user.refreshTokens || user.refreshTokens.length >= config.loginCountLimit) {
        user.refreshTokens = [];
    }
    user.refreshTokens.push(refreshToken);
    user.save();

    return refreshToken;
}

function getAndRenewRefreshToken(user, headers, prevRefreshToken) {
    const refreshToken = prepareRefreshToken(user, headers);

    const i = user.refreshTokens.findIndex((v) => v === prevRefreshToken);
    if (i === -1) throw Error(errorHandler.login());
    user.refreshTokens.set(i, refreshToken);
    user.save();

    return refreshToken;
}

router.post('/signup', (req, res) => {
    if (!/.{6,}/.test(req.body.password)) {
        return res.status(500).json({ error: 'Password must be 6 or more characters' });
    }
    bcrypt.hash(req.body.password, 10, (err, hash) => {
        if (err) {
            return res.status(500).json({ error: errorHandler.signup(err) });
        }
        const user = new User({
            _id: mongoose.Types.ObjectId(),
            nick: req.body.nick,
            email: req.body.email,
            password: hash
        });
        user
            .save()
            .then((result) => {
                return res.status(201).json({ result: 'Signuped successfully' });
            })
            .catch((err) => {
                return res.status(500).json({ error: errorHandler.signup(err) });
            });
    });
});

router.post('/login', (req, res) => {
    if (!req.body.email) {
        return res.status(401).json({ error: 'Email is required' });
    }
    if (!req.body.password) {
        return res.status(401).json({ error: 'Password is required' });
    }
    User.findOne({ email: req.body.email })
        .exec()
        .then((user) => {
            if (!user) {
                return res.status(401).json({ error: errorHandler.login() });
            }
            bcrypt.compare(req.body.password, user.password, (err, isSame) => {
                if (err) {
                    return res.status(401).json({ error: errorHandler.login(err) });
                }
                const refreshToken = getAndSaveNewRefreshToken(user, req.headers);
                return res.json({
                    result: 'Authorized',
                    token: prepareToken(user, req.headers),
                    refreshToken
                });
            });
        })
        .catch((err) => {
            return res.status(401).json({ error: errorHandler.login(err) });
        });
});

router.post('/refresh', (req, res) => {
    try {
        if (!req.body.refreshToken) throw errorHandler.login();
        let decodedToken;
        decodedToken = decodeToken(req.body.refreshToken, req.headers);
        return User.findOne({ _id: decodedToken.id }).exec().then((user) => {
            if (!user.refreshTokens.includes(req.body.refreshToken)) {
                return res.status(401).json({ error: errorHandler.login() });
            }
            const refreshToken = getAndRenewRefreshToken(user, req.headers, req.body.refreshToken);

            return res.json({
                result: 'Refreshed',
                token: prepareToken(user, req.headers),
                refreshToken
            });
        });
    } catch (err) {}
    return res.status(401).json({ error: errorHandler.login() });
});

router.post('/logout', (req, res) => {
    try {
        if (!req.body.refreshToken) throw errorHandler.login();
        let decodedToken = decodeToken(req.body.refreshToken, req.headers);
        return User.findOne({ _id: decodedToken.id }).exec().then((user) => {
            if (!user.refreshTokens.includes(req.body.refreshToken)) {
                return res.status(401).json({ error: errorHandler.login() });
            }
            user.refreshTokens.pull(req.body.refreshToken);
            user.save();
            return res.json({
                result: 'Logged out'
            });
        });
    } catch (err) {}
    return res.status(401).json({ error: errorHandler.login() });
});

module.exports = router;
