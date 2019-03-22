const rfs = require('rotating-file-stream');
const winston = require('winston');
const {format} = winston;
const {combine, timestamp, printf, prettyPrint, json} = format;
const path = require('path');

console.log('log __dirname', path.join(__dirname, 'log'));

const combinedLogStream = rfs('combined.log', {
    interval: '1d', // rotate daily
    path: path.join(__dirname, 'log')
});

const errorLogStream = rfs('error.log', {
    interval: '1d', // rotate daily
    path: path.join(__dirname, 'log')
});

const fdbLogStream = rfs('fdb.log', {
    interval: '1m', // rotate monthly
    path: path.join(__dirname, 'log')
});

const fdbErrorLogStream = rfs('fdb_error.log', {
    interval: '1m', // rotate monthly
    path: path.join(__dirname, 'log')
});

const fdbSillyLogStream = rfs('fdb_silly.log', {
    interval: '1m', // rotate monthly
    path: path.join(__dirname, 'log')
});

const myFormat = printf(({ level, message, timestamp }) => {
    return `${timestamp} ${level}: ${message}`;
});

const fdbFormat = printf(({ level, message, timestamp }) => {
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

winston.loggers.add('fdb', {
    level: 'silly',
    format: combine(
        timestamp(),
        fdbFormat
    ),
    defaultMeta: {service: 'fdb'},
    transports: [
        new winston.transports.Stream({stream: fdbLogStream}),
        new winston.transports.Stream({stream: fdbErrorLogStream, level: 'error'}),
        new winston.transports.Stream({stream: fdbSillyLogStream, level: 'info'}),
    ]
});

const log = winston.loggers.get('log');
const fdb = winston.loggers.get('fdb');
if (process.env.NODE_ENV !== 'production') {
    log.add(new winston.transports.Console({level: 'silly'}));
    fdb.add(new winston.transports.Console({level: 'silly'}));
}

module.exports.combinedLogStream = combinedLogStream;