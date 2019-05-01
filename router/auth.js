const CONFIG = require('../config/config')
const logger = CONFIG.logger
const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')

router.post('/', function (req, res) {
    res.status(200).send({message: 'Welcome to the coolest API on earth!'})
})

router.post('/auth', (req, res) => {
    const user = req.body.user;
    const pwd = req.body.pwd;
    const payload = {
        id: 'sv'
    }
    const token = jwt.sign(payload, CONFIG.token_secret, {
        expiresIn: 60000 // expires in 24 hours
    })
    res.status(200).send({ auth: true, token: token })
})

router.use(function (req, res, next) {
    const token = req.body.token || req.params['token'] || req.headers['x-access-token']
    logger.info(`Check token: ${token}`)
    if (CONFIG.app === 'test') {
        logger.info('Do not check token in test env.')
        next()
        return
    }
    // check token
    jwt.verify(token, CONFIG.token_secret, function (err, decoded) {
        if (err) {
            return res.json({success: false, message: 'Failed to authenticate token.'})
        } else {
            logger.info('Checked ok')
            // if everything is good, save to request for use in other routes
            req.decoded = decoded
            next()
        }
    })
})

module.exports = router
