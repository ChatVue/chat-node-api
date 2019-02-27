const router = require('express').Router();
const mongoose = require('mongoose');

const Message = require('../models/message');

router.get('/messages', (req, res) => {
    Message.find({}).populate('author', 'nick').exec(function(err, messages) {
        return res.json({ messages: messages });
    });
});

module.exports = router;
