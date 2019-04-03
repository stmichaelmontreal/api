const rx = require('rxjs/index')
const rxO = require('rxjs/operators/index')
const express = require('express')
const router = express.Router()
const fdb = require('./fdb')
const uuidV4 = require('uuid/v4')
const winston = require('winston/index')
const logger = winston.loggers.get('log')

const eventsDir = 'events'
const imgDir = 'img'

class Event {
    constructor(obj) {
        if (obj.id) {
            this.id = obj.id
        }
        if (obj.date) {
            this.date = obj.date
        }
        if (obj.title) {
            this.title = obj.title
        }
        if (obj.thumbnail) {
            this.thumbnail = obj.thumbnail
        }
        if (obj.img) {
            this.img = obj.img
        }
        if (obj.description) {
            this.description = obj.description
        }
        if (obj.timestamp) {
            this.timestamp = obj.timestamp
        }
    }
}


selectEvents = function (req, res) {
    const filter = req.body
    logger.info('Event selectEvents filter: ', filter)
    if (filter) {
        fdb.select(eventsDir, filter).pipe(
            rxO.catchError(error => {
                logger.error('Event selectEvents ERROR', error)
                res.status(500).send(false)
                return rx.EMPTY
            })
        ).subscribe(event => res.status(200).send(event))
    }
}

addEvent = function (req, res) {
    const event = new Event(req.body)
    event.timestamp = new Date()
    event.id = uuidV4()
    let img
    let thumbnail
    if (event.img) {
        img = fdb.getImage(event.img)
        event.img = uuidV4() + '.' + img.ext
    }
    if (event.thumbnail) {
        thumbnail = event.thumbnail
        event.thumbnail = uuidV4() + '.' + thumbnail.ext
    }
    logger.info('Event addEvent', event)
    fdb.writeFile(imgDir, event.img, img.content, 'base64').pipe(
        rxO.switchMap(() => thumbnail ?
            fdb.writeFile(imgDir, event.thumbnail, thumbnail.content, 'base64') : rx.of(true)),
        rxO.switchMap(() =>
            fdb.writeFile(eventsDir, event.id, JSON.stringify(event))),
        rxO.catchError(error => {
            logger.error('Event addEvent ERROR', event, error)
            res.status(500).send(false)
            return rx.EMPTY
        })
    ).subscribe(() => res.status(200).send({id: event.id}))
}

updateEvent = function (req, res) {
    const event = new Event(req.body)
    console.log('Event updateEvent', event)

    fdb.updateFile(eventsDir, event.id, event).pipe(
        rxO.catchError(error => {
            console.log('Event updateEvent ERROR', event, error)
            res.status(500).send(false)
            return rx.EMPTY
        })
    ).subscribe(() => res.status(200).send(true))
}

deleteEvent = function (req, res) {
    let event = new Event(req.body)
    console.log('Event deleteEvent', event.id)

    fdb.readFile(eventsDir, event.id).pipe(
        rxO.switchMap((data) => {
            event = data
            return event ? rx.of(true) : rx.EMPTY
        }),
        rxO.switchMap(() => event.thumbnail ? fdb.deleteFile(imgDir, event.thumbnail) : rx.of(true)),
        rxO.switchMap(() => event.img ? fdb.deleteFile(imgDir, event.img) : rx.of(true)),
        rxO.switchMap(() => event.id ? fdb.deleteFile(eventsDir, event.id) : rx.of(true)),
        rxO.catchError(error => {
            console.log('Event deleteEvent ERROR', event.id, error)
            res.status(500).send(false)
            return rx.EMPTY
        })
    ).subscribe(() => res.status(200).send(true))
}

router.use(function timeLog(req, res, next) {
    console.log('Event Midleware => Time: ', Date.now())
    next()
})

router.post('/events/:action', (req, res) => {
    console.log('Event POST', Date.now())
    switch (req.params['action']) {
        case 'select':
            selectEvents(req, res)
            break
        case 'add':
            addEvent(req, res)
            break
        case 'update':
            updateEvent(req, res)
            break
        case 'delete':
            deleteEvent(req, res)
            break
    }
})

module.exports = router

// const path = require('path')
// const db = require(path.join(__dirname, 'db'))
//
// function selectEvents() {
//     return db.query("SELECT * FROM test.tbl_events WHERE event_id = ?", ['1111'])
// }
//
// function addEvents(sql, values) {
//     return db.query(sql, values)
// }
//
// module.exports.selectEvents = selectEvents
// module.exports.addEvents = addEvents
//
// // INSERT INTO `test`.`tbl_events` (`event_id`, `event_title`, `event_date`, `event_desc`, `event_count`)
// // VALUES ('sdsa', 'sdf', '2010-01-01', 'sdf', 'sdfsdf')
