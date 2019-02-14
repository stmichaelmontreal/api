const express = require('express');
const router = express.Router();
const fdb = require('./fdb');
const uuidV4 = require('uuid/v4');

const eventsDir = 'events';

class Event {
    constructor(id, date, title, img, description, timestamp) {
        this.id = id;
        this.date = date;
        this.title = title;
        this.img = img;
        this.description = description;
        this.timestamp = timestamp;
    }
}


selectEvents = function (req, res) {
    const filter = !!req.body && !!req.body.filter ? req.body.filter : undefined;
    console.log('Event selectEvents filter: ', filter);
    const events = [];
    fdb.readDir(eventsDir)
        .then(files => {
            files.forEach((item) => {
                events.push(JSON.parse(item.contents));
            });
            console.log('Event length', events.length);
            res.status(200).send(events);
        });
};

addEvent = function (req, res) {
    const event = JSON.parse(req.body);
    event['timestamp'] = new Date();
    const id = uuidV4();
    event['id'] = id;
    fdb.writeFile(eventsDir, id, event);
    // save to log db
    console.log('Event addEvent', id, event);
    res.status(200).send(id);
};

updateEvent = function (req, res) {
    const event = JSON.parse(req.body);
    const id = event.id;
    fdb.writeFile(eventsDir, id, event);
    // save to log db
    console.log('Event updateEvent', id, event);
    res.status(200).send(id);
};

deleteEvent = function (req, res) {
    const event = JSON.parse(req.body);
    const id = event.id;
    fdb.deleteFile(eventsDir, id);
    console.log('Event deleteEvent', id);
    res.status(200).send('OK');
};

router.use(function timeLog(req, res, next) {
    console.log('Event Midleware => Time: ', Date.now());
    next();
});

router.post('/events/:action', (req, res) => {
    console.log('Event POST', Date.now());
    switch (req.params['action']) {
        case 'select':
            selectEvents(req, res);
            break;
        case 'add':
            addEvent(req, res);
            break;
        case 'update':
            updateEvent(req, res);
            break;
        case 'delete':
            deleteEvent(req, res);
            break;
    }
});

module.exports = router;
