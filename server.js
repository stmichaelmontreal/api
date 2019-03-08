const rfs = require('rotating-file-stream');
const path = require('path');
const winston = require('winston');
const {format} = winston;
const {combine, label, json} = format;

const combinedLogStream = rfs('combined.log', {
    interval: '1d', // rotate daily
    path: path.join(__dirname, 'log')
});

const errorLogStream = rfs('error.log', {
    interval: '1d', // rotate daily
    path: path.join(__dirname, 'log')
});

winston.loggers.add('log', {
    level: 'silly',
    format: winston.format.json(),
    defaultMeta: {service: 'user-service'},
    transports: [
        //
        // - Write to all logs with level `info` and below to `combined.log`
        // - Write all logs error (and below) to `error.log`.
        //
        new winston.transports.Stream({stream: errorLogStream, level: 'error'}),
        new winston.transports.Stream({stream: combinedLogStream})
    ]
});

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const events = require('./schema/events');

const corsOptions = {
    origin: 'http://stmichaelmontreal.ca',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};



if (process.env.NODE_ENV !== 'production') {
    // winston.loggers.add('console', {
    //     format: combine(
    //         label({ label: 'category one' }),
    //         json()
    //     ),
    //     transports: [
    //         new winston.transports.Console({ level: 'silly' })
    //     ]
    // });
}

const logger = winston.loggers.get('log');
const app = express();
// app.use(morgan('combined', {stream: accessLogStream}));
app.use(bodyParser.json());
app.use(cors(corsOptions));
app.use('/api', events);

app.listen(5050, () => {
    logger.info('INFO again distributed logs');
    logger.silly('SILLY again distributed logs');
    logger.error('ERROR again distributed logs');
});

module.exports = app; // for testing
