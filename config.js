module.exports = {
    port: '',
    mongoURI: '',

    tokenKey: 'Our Token Key',
    tokenExpires: '5m',
    refreshTokenExpires: '20d',
    loginCountLimit: 5,

    // max count of loaded messages per time,
    // messages with same time (ms) will be added over.
    loadCountLimit: 20
};
