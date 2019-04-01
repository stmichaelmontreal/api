const express = require('express');
const router = express.Router();
const event = require('../mysql/models/event');

router.use(function timeLog(req, res, next) {
    //console.log('Event Midleware => Time: ', Date.now());
    next();
});

router.get('/events', (req, res) => {
    event.selectAll(res);
});

router.get('/events/:id', (req, res) => {
    event.selectOne(req.params['id'], res);
});


router.post('/events', (req, res) => {
    event.add(req, res);
});

router.put('/events/:action', (req, res) => {
    switch (req.params['action']) {
        case 'update-text':
            event.updateText(req, res);
            break;
        case 'update-img':
            event.updateImg(req, res);
            break;
    }
});

router.delete('/events/:id', (req, res) => {
    event.deleteOne(req.params['id'], res);
});

module.exports = router;
