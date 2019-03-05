const jwt = require('jsonwebtoken');
const config = require('../config');

function parseBearer(bearer, headers) {
    if (bearer.startsWith('Bearer ')) {
        token = bearer.slice(7, bearer.length);
    }
    const decoded = jwt.verify(token, prepareSecret(headers));
    return decoded;
}

function prepareToken(data, headers) {
    return jwt.sign(data, prepareSecret(headers), { expiresIn: config.tokenExpires });
}

function prepareSecret(headers) {
    return config.tokenKey + headers['user-agent'] + headers['accept-language'];
}

module.exports = { parseBearer, prepareToken };
