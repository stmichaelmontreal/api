const CONFIG = require('../config/config')
const logger = CONFIG.logger
const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const auth = require('../mysql/models/auth')

router.post('/', function (req, res) {
    res.status(200).send({message: 'Welcome to the coolest API on earth!'})
})

router.post('/login', (req, res) => {
    const authObj = new auth.Auth(req.body)
    auth.checkLogin(authObj)
        .subscribe((data) => {
            if (data.status === 0) {
                res.status(200).send(data)
            } else {
                res.status(401).send(data)
            }
        })
})

router.post('/auth', (req, res) => {
    const authObj = new auth.Auth(req.body)
    auth.checkPassword(authObj)
        .subscribe(isAuth=> {
            if (!isAuth) {
                res.status(401).send({auth: false, message: 'Error auth!'})
                return
            }
            const payload = {
                id: authObj.login
            }
            const token = jwt.sign(payload, CONFIG.token_secret, {
                expiresIn: 60000 // expires in 24 hours
            })
            res.status(200).send({auth: true, token: token})
        })
})

router.put('/users/reset-password', (req, res) => {
    auth.resetPassword(req, res)
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
