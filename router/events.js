const CONFIG = require('../config/config')
const logger = CONFIG.logger
const express = require('express')
const router = express.Router()
const events = require('../mysql/models/events')
const jwt = require('jsonwebtoken')
//
// router.use(function (req, res, next) {
//     const token = req.body.token || req.params['token'] || req.headers['x-access-token']
//     logger.info(`Check token: ${token}`)
//     if (CONFIG.app === 'test') {
//         logger.info('Do not check token in test env.')
//         next()
//         return
//     }
//     // check token
//     jwt.verify(token, CONFIG.token_secret, function (err, decoded) {
//         if (err) {
//             return res.json({success: false, message: 'Failed to authenticate token.'})
//         } else {
//             logger.info('Checked ok')
//             // if everything is good, save to request for use in other routes
//             req.decoded = decoded
//             next()
//         }
//     })
// })

router.get('/events', (req, res) => {
    events.selectAll(res)
})

router.get('/events/limit/:startIndex/:numberOfRecords', (req, res) => {
    events.selectLimit(parseInt(req.params['startIndex']), parseInt(req.params['numberOfRecords']), res)
})

router.get('/events/one/:id', (req, res) => {
    events.selectOne(req.params['id'], res)
})

// add
router.post('/events', (req, res) => {
    events.add(req, res)
})

// update
router.put('/events/:action', (req, res) => {
    switch (req.params['action']) {
        case 'update-text':
            events.updateText(req, res)
            break
        case 'update-img':
            events.updateImg(req, res)
            break
    }
})

router.delete('/events/:id', (req, res) => {
    events.deleteOne(req.params['id'], res)
})

module.exports = router
