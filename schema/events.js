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
    const imgId = uuidV4();
    const event = new Event(req.body);
    console.log('addEvent', event);
    event.timestamp = new Date();
    event.id = uuidV4();
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
    const event = new Event(req.body);
    console.log('Event updateEvent', event.id);
    fdb.updateFile(eventsDir, event.id, event).pipe(
        rxO.switchMap(() => res.status(200).send(true)),
        rxO.catchError(error => {
            console.log('Event updateEvent ERROR', event, error);
            res.status(500).send(false);
        })
    ).subscribe();
};

deleteEvent = function (req, res) {
    const event = new Event(req.body);
    console.log('Event deleteEvent', event.id);
    fdb.deleteFile(eventsDir, event.id).pipe(
        rxO.switchMap(() => res.status(200).send(true)),
        rxO.catchError(error => {
            console.log('Event deleteEvent ERROR', event.id, event);
            res.status(500).send(false);
        })
    ).subscribe();
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
