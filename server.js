const events = require('./schema/events');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

var corsOptions = {
    origin: 'http://example.com',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

const app = express();
app.use(bodyParser.json());
app.use(cors(corsOptions));
app.use('/api', events);

app.listen(8000, () => {
    console.log('Server started! port:8000');
});

module.exports = app; // for testing