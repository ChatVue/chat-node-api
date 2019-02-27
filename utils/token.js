const jwt = require('jsonwebtoken');
const config = require('../config');

function parseBearer(bearer) {
    const token = bearer.split(' ')[1];
    const decoded = jwt.verify(token, config.tokenKey);
    return decoded;
}

module.exports = parseBearer;
