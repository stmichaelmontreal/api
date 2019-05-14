const express = require('express')
const router = express.Router()
const users = require('../mysql/models/users')

router.get('/users/all', (req, res) => {
    users.selectAll(res)
})

router.get('/users/one/:id', (req, res) => {
    users.selectOne(req.params['id'], res)
})

router.post('/users/add', (req, res) => {
    users.add(req, res)
})

module.exports = router
