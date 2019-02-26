const rx = require('rxjs');
const rxO = require('rxjs/operators');
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
    const filter = req.body;
    console.log('Event selectEvents filter: ', filter);
    if (filter) {
        fdb.selectData(eventsDir, filter).pipe(
            rxO.switchMap((event) => {
                res.status(200).send(event);
                return rx.EMPTY;
            })
        ).subscribe();
    }
};

addEvent = function (req, res) {
    let id = uuidV4();
    const imgId = uuidV4();
    const event = new Event(req.body);
    if (event.hasOwnProperty('id')) {
        id = event.id;
    }
    event.timestamp = new Date();
    event.id = id;
    let img;
    if (event.img) {
        img = event.img;
        event.img = imgId;
    }

    fdb.writeFile(eventsDir, event.id, JSON.stringify(event)).pipe(
        rxO.switchMap((res) => res && img ? fdb.addImage(imgId, img) : rx.EMPTY),
        rxO.switchMap(() => {
            console.log('Event addEvent', event.id, event);
            res.status(200).send({id: event.id});
            return rx.EMPTY;
        }),
        rxO.catchError(error => {
            console.log('Event addEvent Error', event.id, event);
            res.status(500).send(event.id);
        })
    ).subscribe();
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
