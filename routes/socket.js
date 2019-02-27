const mongoose = require('mongoose');
const Message = require('../models/message');
const parseBearer = require('../utils/token');

function run(server) {
    const io = require('socket.io')(server);
    io.on('connection', (client) => {
        client.on('NEW', (bearer, msg, tmpId) => {
            const userData = parseBearer(bearer);
            const message = new Message({
                _id: new mongoose.Types.ObjectId(),
                message: msg,
                author: userData.id
            });
            message
                .save()
                .then((result) => {
                    Message.findOne({ _id: result._id }).populate('author', 'nick').exec(function(err, message) {
                        client.broadcast.emit('ADD', message);
                        client.emit('UPDATE', { message, tmpId });
                    });
                })
                .catch();
        });
    });
    return io;
}

module.exports = {
    run
};
