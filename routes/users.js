const router = require('express').Router();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../config');
const errorHandler = require('../middlewares/errorHandler.js');

const User = require('../models/user');

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
    // TODO: Check === email
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
                const token = jwt.sign(
                    {
                        id: user._id,
                        nick: user.nick,
                        email: user.email
                    },
                    config.tokenKey,
                    { expiresIn: '1h' }
                );
                return res.json({
                    result: 'Authorized',
                    token
                });
            });
        })
        .catch((err) => {
            return res.status(401).json({ error: errorHandler.login(err) });
        });
});

module.exports = router;
