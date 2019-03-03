const router = require('express').Router();
const config = require('../config');

const Message = require('../models/message');

router.get('/messages', async (req, res) => {
    const filter = {};
    const count =
        req.query.count && parseInt(req.query.count) > 0 ? parseInt(req.query.count) : config.loadCountLimit || 20;

    if (req.query.dateBefore) {
        filter.createdAt = { $lt: req.query.dateBefore };
    }

    // Get first message from count and over add messages with the same time
    const firstMsg = await Message.findOne(filter).sort({ createdAt: -1 }).skip(count - 1).limit(1).exec();
    if (firstMsg) {
        filter.createdAt = filter.createdAt || {};
        filter.createdAt.$gte = firstMsg.createdAt;
    }

    const messages = await Message.find(filter).populate('author', 'nick').sort({ createdAt: 1 }).exec();
    return res.json({ messages: messages });
});

module.exports = router;
