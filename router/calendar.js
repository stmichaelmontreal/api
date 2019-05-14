const express = require('express')
const router = express.Router()
const calendar = require('../mysql/models/calendar')

router.get('/calendar/limit/:startIndex/:numberOfRecords', (req, res) => {
    calendar.selectLimit(parseInt(req.params['startIndex']), parseInt(req.params['numberOfRecords']), res)
})

router.get('/calendar/one/:id', (req, res) => {
    calendar.selectOne(req.params['id'], res)
})

router.post('/calendar/add', (req, res) => {
    calendar.add(req, res)
})

router.put('/calendar/update', (req, res) => {
    calendar.update(req, res)
})

router.delete('/calendar/delete/:id', (req, res) => {
    calendar.deleteOne(req.params['id'], res)
})

module.exports = router
