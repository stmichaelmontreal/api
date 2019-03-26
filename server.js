require('loggers');
const winston = require('winston');
const log = winston.loggers.get('log');

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const events = require('./schema/events');

const corsOptions = {
    origin: 'http://stmichaelmontreal.ca',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

const port = process.env.PORT || '5050';

const app = express();
app.use(morgan('combined', {stream: combinedLogStream}));
app.use(bodyParser.json());
app.use(cors(corsOptions));
app.use('/api', events);

app.listen(port, () => {
    log.info('Server started! port:' + port);
});

module.exports = app; // for testing
