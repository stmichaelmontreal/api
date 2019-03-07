const events = require('./schema/events');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const corsOptions = {
    origin: 'http://stmichaelmontreal.ca',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

const app = express();
app.use(bodyParser.json());
app.use(cors(corsOptions));
app.use('/api', events);

app.listen(5050, () => {
    console.log('Server started! port:5050');
});

module.exports = app; // for testing
