const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        message: { type: String, required: true },
        author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
    },
    { timestamps: true }
);

module.exports = mongoose.model('Message', messageSchema);
