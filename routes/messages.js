const router = require('express').Router();
const mongoose = require('mongoose');

const Message = require('../models/message');

router.get('/messages', (req, res) => {
    Message.find({}).populate('author', 'nick').exec(function(err, messages) {
        return res.json({ messages: messages });
    });
});

router.post('/messages', (req, res, next) => {
    const message = new Message({
        _id: new mongoose.Types.ObjectId(),
        message: req.body.message,
        author: req.user._id
    });
    message
        .save()
        .then((result) => {
            return res.status(201).json({ id: result._id });
        })
        .catch();
});

module.exports = router;
