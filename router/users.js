const express = require('express')
const router = express.Router()
const users = require('../mysql/models/users')

// select all
router.get('/users', (req, res) => {
    users.selectAll(res)
})

// select one
router.get('/users/one/:id', (req, res) => {
    users.selectOne(req.params['id'], res)
})

// add
router.post('/users', (req, res) => {
    users.add(req, res)
})

module.exports = router
