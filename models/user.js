const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        nick: { type: String, required: true, unique: true },
        email: {
            type: String,
            required: true,
            unique: true,
            match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
        },
        password: { type: String, required: true },
        refreshTokens: [ { type: String } ]
    },
    { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
