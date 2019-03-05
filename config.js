module.exports = {
    mongoURI: 'mongodb://localhost:27017/chat',
    port: '5009',
    tokenKey: 'Our Token Key',
    tokenExpires: '60m',

    // max count of loaded messages per time,
    // messages with same time (ms) will be added over.
    loadCountLimit: 20
};
