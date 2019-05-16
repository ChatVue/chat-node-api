const mongoose = require('mongoose');
const Message = require('../models/message');
const { parseBearer } = require('../utils/token');

function run(server) {
    const io = require('socket.io')(server);
    io.on('connection', (client) => {
        client.on('NEW', (bearer, msg, tmpId, retry) => {
            let userData = {};
            try {
                userData = parseBearer(bearer, client.request.headers);
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
            } catch (err) {
                if (!retry) {
                    client.emit('REFRESH', [ 'NEW', bearer, msg, tmpId ]);
                } else {
                    client.emit('LOGOUT');
                }
                return;
            }
        });
        client.on('TYPING', (bearer, retry) => {
            let userData = {};
            try {
                userData = parseBearer(bearer, client.request.headers);
                client.broadcast.emit('TYPING', userData.nick);
            } catch (err) {
                if (!retry) {
                    client.emit('REFRESH', [ 'TYPING', bearer ]);
                } else {
                    client.emit('LOGOUT');
                }
                return;
            }
        });
    });
    return io;
}

module.exports = {
    run
};
