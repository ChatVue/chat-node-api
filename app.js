const app = require('express')();
const bodyParser = require('body-parser');
const config = require('./config');
const cors = require('cors');
const parseBearer = require('./utils/token');

const mongoose = require('mongoose');

mongoose.connect(config.mongoURI);

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    next();
});

app.use((req, res, next) => {
    const openPathes = [ '/login', '/signup' ];
    if (!openPathes.includes(req.path)) {
        try {
            req.user = parseBearer(req.headers.authorization);
        } catch (err) {
            return res.status(401).json({ result: 'Access Denied' });
        }
    }
    next();
});

app.use(require('./routes/messages'));
app.use(require('./routes/users'));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500);
    res.json({ error: err.message });
});

const server = app.listen(config.port, () => {
    console.log(`Server is running on PORT ${config.port}`);
});

app.io = require('./routes/socket').run(server);
