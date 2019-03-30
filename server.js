const CONFIG = require('./config/config')

const loggers = require('./loggers')
const winston = require('winston')
const log = winston.loggers.get('log')

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')
const morgan = require('morgan')
const router_events = require('./router/events')


const app = express()
app.use(morgan('combined', {stream: loggers.combinedLogStream}))
app.use(bodyParser.json())
app.use(cors())
app.use('/api', router_events)

app.listen(CONFIG.port, () => {
    log.info('Server started! port:' + CONFIG.port)
})

module.exports = app // for testing1
