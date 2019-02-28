const rx = require('rxjs');
const rxO = require('rxjs/operators');
const express = require('express');
const router = express.Router();
const fdb = require('./fdb');
const uuidV4 = require('uuid/v4');

const eventsDir = 'events';
const imgDir = 'img';

class Event {
    constructor(obj) {
        if (obj.id) {
            this.id = obj.id;
        }
        if (obj.date) {
            this.date = obj.date;
        }
        if (obj.title) {
            this.title = obj.title;
        }
        if (obj.thumbnail) {
            this.thumbnail = obj.thumbnail;
        }
        if (obj.img) {
            this.img = obj.img;
        }
        if (obj.description) {
            this.description = obj.description;
        }
        if (obj.timestamp) {
            this.timestamp = obj.timestamp;
        }
    }
}


selectEvents = function (req, res) {
    const filter = req.body;
    console.log('Event selectEvents filter: ', filter);
    if (filter) {
        fdb.selectData(eventsDir, filter).pipe(
            rxO.catchError(error => {
                console.log('Event selectEvents ERROR', error);
                res.status(500).send(false);
                return rx.EMPTY;
            })
        ).subscribe(event => res.status(200).send(event));
    }
};

addEvent = function (req, res) {
    const event = new Event(req.body);
    event.timestamp = new Date();
    event.id = uuidV4();
    const imgId = uuidV4();
    const thumbnailId = uuidV4();
    let img;
    let thumbnail;
    if (event.img) {
        img = event.img;
        event.img = imgId;
    }
    if (event.thumbnail) {
        thumbnail = event.thumbnail;
        event.thumbnail = thumbnailId;
    }
    console.log('Event addEvent', event);

    fdb.writeFile(eventsDir, event.id, JSON.stringify(event)).pipe(
        rxO.switchMap(() => img ? fdb.addImage(imgId, img) : rx.of(true)),
        rxO.switchMap(() => thumbnail ? fdb.addImage(thumbnailId, thumbnail) : rx.of(true)),
        rxO.catchError(error => {
            console.log('Event addEvent ERROR', event, error);
            res.status(500).send(false);
            return rx.EMPTY;
        })
    ).subscribe(() => res.status(200).send({id: event.id}));
};

updateEvent = function (req, res) {
    const event = new Event(req.body);
    console.log('Event updateEvent', event);
    fdb.updateFile(eventsDir, event.id, event).pipe(
        rxO.catchError(error => {
            console.log('Event updateEvent ERROR', event, error);
            res.status(500).send(false);
            return rx.EMPTY;
        })
    ).subscribe(() => res.status(200).send(true));
};

deleteEvent = function (req, res) {
    let event = new Event(req.body);
    console.log('Event deleteEvent', event.id);
    fdb.readFile(eventsDir, event.id).pipe(
        rxO.switchMap((data) => {
            event = new Event(JSON.parse(data));
            return rx.of(true);
        }),
        rxO.switchMap(() => event.id ? fdb.deleteFile(eventsDir, event.id) : rx.of(true)),
        rxO.switchMap(() => event.img ? fdb.deleteFile(imgDir, event.img) : rx.of(true)),
        rxO.switchMap(() => event.thumbnail ? fdb.deleteFile(imgDir, event.thumbnail) : rx.of(true)),
        rxO.catchError(error => {
            console.log('Event deleteEvent ERROR', event.id, error);
            res.status(500).send(false);
            return rx.EMPTY;
        })
    ).subscribe(() => res.status(200).send(true));
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
