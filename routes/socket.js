const mongoose = require('mongoose');
const Message = require('../models/message');
const { parseBearer } = require('../utils/token');

function run(server) {
    const io = require('socket.io')(server);
    io.on('connection', (client) => {
        client.on('NEW', (bearer, msg, tmpId) => {
            let userData = {};
            try {
                userData = parseBearer(bearer, client.request.headers);
            } catch (err) {
                client.emit('LOGOUT');
                return;
            }
            const message = new Message({
                _id: new mongoose.Types.ObjectId(),
                message: msg,
                author: userData.id
            });
            message
                .save()
                .then((result) => {
                    Message.findOne({ _id: result._id }).populate('author', 'nick').exec(function(err, message) {
                        // TODO: Broadcast only for logged in users
                        client.broadcast.emit('ADD', message);
                        client.emit('UPDATE', { message, tmpId });
                    });
                })
                .catch();
        });
        client.on('TYPING', (bearer) => {
            let userData = {};
            try {
                userData = parseBearer(bearer, client.request.headers);
            } catch (err) {
                client.emit('LOGOUT');
                return;
            }
            // TODO: Broadcast only for logged in users
            client.broadcast.emit('TYPING', userData.nick);
        });
    });
    return io;
}

module.exports = {
    run
};
