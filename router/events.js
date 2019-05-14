const express = require('express')
const router = express.Router()
const events = require('../mysql/models/events')

router.get('/events/all', (req, res) => {
    events.selectAll(res)
})

router.get('/events/limit/:startIndex/:numberOfRecords', (req, res) => {
    events.selectLimit(parseInt(req.params['startIndex']), parseInt(req.params['numberOfRecords']), res)
})

router.get('/events/one/:id', (req, res) => {
    events.selectOne(req.params['id'], res)
})

router.post('/events/add', (req, res) => {
    events.add(req, res)
})

router.put('/events/update/:action', (req, res) => {
    switch (req.params['action']) {
        case 'text':
            events.updateText(req, res)
            break
        case 'img':
            events.updateImg(req, res)
            break
    }
})

router.delete('/events/delete/:id', (req, res) => {
    events.deleteOne(req.params['id'], res)
})

module.exports = router
