const rfs = require('rotating-file-stream');
const path = require('path');
const winston = require('winston');
const {format} = winston;
const {combine, timestamp, printf, prettyPrint, json} = format;

const combinedLogStream = rfs('combined.log', {
    interval: '1d', // rotate daily
    path: path.join(__dirname, 'log')
});

const errorLogStream = rfs('error.log', {
    interval: '1d', // rotate daily
    path: path.join(__dirname, 'log')
});

const myFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
});

winston.loggers.add('log', {
    level: 'silly',
    format: combine(
        timestamp(),
        myFormat
    ),
    defaultMeta: {service: 'api'},
    transports: [
        new winston.transports.Stream({stream: errorLogStream, level: 'error'}),
        new winston.transports.Stream({stream: combinedLogStream})
    ]
});

const logger = winston.loggers.get('log');
if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({level: 'silly'}));
}

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');
const events = require('./schema/events');

const corsOptions = {
    origin: 'http://stmichaelmontreal.ca',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};




const app = express();
app.use(morgan('combined', {stream: combinedLogStream}));
app.use(bodyParser.json());
app.use(cors(corsOptions));
app.use('/api', events);

app.listen(5050, () => {
    logger.info('Server started! port:5050');
});

module.exports = app; // for testing
