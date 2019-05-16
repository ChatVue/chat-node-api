const jwt = require('jsonwebtoken');
const config = require('../config');

function decodeToken(token, headers) {
    return jwt.verify(token, prepareSecret(headers));
}

function parseBearer(bearer, headers) {
    if (bearer.startsWith('Bearer ')) {
        token = bearer.slice(7, bearer.length);
    }
    return decodeToken(token, headers);
}

function prepareToken(user, headers) {
    const tokenData = {
        id: user._id,
        nick: user.nick
    };
    return jwt.sign(tokenData, prepareSecret(headers), { expiresIn: config.tokenExpires });
}

function prepareRefreshToken(user, headers) {
    const tokenData = {
        id: user._id,
        nick: user.nick
    };
    return jwt.sign(tokenData, prepareSecret(headers), { expiresIn: config.refreshTokenExpires });
}

function prepareSecret(headers) {
    return config.tokenKey + headers['user-agent'] + headers['accept-language'];
}

module.exports = { parseBearer, decodeToken, prepareToken, prepareRefreshToken };
