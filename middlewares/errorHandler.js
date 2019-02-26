const _associations = {
    'Path `nick` is required': 'Nick is required',
    'index: nick_1 dup key': 'User with such nick is already registered',
    'Path `email` is required': 'Email is required',
    'Path `email` is invalid': 'Email is not in correct format',
    'index: email_1 dup key': 'User with such email is already registered',
    'Path `password` is required': 'Password is required'
};

const _defaultMsg = 'Action failed';

function _handler(err, defaultMsg = _defaultMsg, overwriteAssoc = {}) {
    associations = _associations;
    Object.assign(associations, overwriteAssoc);

    if (!err || !err.message) return defaultMsg;
    console.log('Error', err);
    const message = err.message;
    for (key in associations) {
        if (message.includes(key)) {
            return associations[key];
        }
    }
    return defaultMsg;
}

function login(err) {
    return _handler(err, 'Auth failed');
}

function signup(err) {
    return _handler(err, 'Signup failed');
}

module.exports = {
    login,
    signup
};
