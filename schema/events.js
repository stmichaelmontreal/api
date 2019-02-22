const express = require('express');
const router = express.Router();
const fdb = require('./fdb');
const uuidV4 = require('uuid/v4');

const eventsDir = 'events';

class Event {
    constructor(obj) {
        this.id = obj.id;
        this.date = obj.date;
        this.title = obj.title;
        this.img = obj.img;
        this.description = obj.description;
        this.timestamp = obj.timestamp;
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
    const event = new Event(req.body);
    event.timestamp = new Date();
    const id = uuidV4();

    fdb.addImage(event.img).pipe(
        map((imgID) => {
            event.img = imgID;
            fdb.writeFile(eventsDir, id, event);
        })
    ).subscribe();
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
