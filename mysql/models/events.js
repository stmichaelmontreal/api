const CONFIG = require('../../config/config')
const logger = CONFIG.logger
const rx = require('rxjs')
const rxO = require('rxjs/operators')
const fdb = require('../../fdb-lib/fdb')
const db = require('../db')
const uuidV4 = require('uuid/v4')

class Event {

    constructor(obj) {
        if (!obj) {
            return
        }
        if (obj.id) {
            this.id = obj.id
        }
        if (obj.title) {
            this.title = obj.title
        }
        if (obj.event_date) {
            this.event_date = obj.event_date
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
        if (obj.when_created) {
            this.when_created = obj.when_created
        }
    }

    static selectAll() {
        const sql = 'SELECT * FROM t_events'
        return db.query(sql)
    }

    static selectLimit(startIndex, numberOfRecords) {
        const sql = 'SELECT * FROM t_events ORDER BY event_date LIMIT ?, ?'
        return db.query(sql, [startIndex, numberOfRecords])
    }

    selectOne() {
        const sql = 'SELECT * FROM t_events WHERE id=?'
        return db.query(sql, [this.id])
    }

    add() {
        const sql = 'INSERT INTO t_events(id, title, event_date, thumbnail, img, description) VALUES (?, ?, ?, ?, ?, ?)'
        return db.query(sql, [this.id, this.title, this.event_date, this.thumbnail, this.img, this.description])
    }

    updateText() {
        const sql = 'UPDATE t_events SET title=?, event_date=?, description=? WHERE id=?'
        return db.query(sql, [this.title, this.event_date, this.description, this.id])
    }

    deleteOne() {
        const sql = 'DELETE FROM t_events WHERE id=?'
        return db.query(sql, [this.id])
    }

}

add = function (req, res) {
    const event = new Event(req.body)
    event.when_created = new Date()
    event.id = uuidV4()
    let img
    let thumbnail
    if (event.img) {
        img = fdb.getImage(event.img)
        event.img = event.id + '.' + img.ext
    }
    if (event.thumbnail) {
        thumbnail = fdb.getImage(event.thumbnail)
        event.thumbnail = event.id + '-th.' + thumbnail.ext
    }
    fdb.writeFile(CONFIG.fdb_img, event.img, img.content, 'base64').pipe(
        rxO.switchMap(() => fdb.writeFile(CONFIG.fdb_img, event.thumbnail, thumbnail.content, 'base64')),
        rxO.switchMap(() => event.add()),
        rxO.catchError(error => {
            logger.error({action: 'Event.add', obj: event, error: error})
            res.status(500).send(false)
            return rx.EMPTY
        })
    ).subscribe(() => res.status(200).send({id: event.id}))
}

selectAll = function (res) {
    Event.selectAll().pipe(
        rxO.catchError(error => {
            logger.error({action: 'Event.selectAll', error: error})
            res.status(500).send(false)
            return rx.EMPTY
        })
    ).subscribe(events => res.status(200).send(events))
}

selectLimit = function (startIndex, numberOfRecords, res) {
    Event.selectLimit(startIndex, numberOfRecords).pipe(
        rxO.catchError(error => {
            logger.error({action: 'Event.selectLimit', error: error})
            res.status(500).send(false)
            return rx.EMPTY
        })
    ).subscribe(events => res.status(200).send(events))
}

selectOne = function (id, res) {
    const event = new Event({id: id})
    event.selectOne().pipe(
        rxO.catchError(error => {
            logger.error({action: 'Event.selectOne', error: error})
            res.status(500).send(false)
            return rx.EMPTY
        })
    ).subscribe(events => res.status(200).send(events))
}

updateText = function (req, res) {
    const event = new Event(req.body)
    event.updateText().pipe(
        rxO.catchError(error => {
            logger.error({action: 'Event.updateText', error: error})
            res.status(500).send(false)
            return rx.EMPTY
        })
    ).subscribe(() => res.status(200).send(true))
}

updateImg = function (req, res) {
    const event = new Event(req.body)
    event.updateText().pipe(
        rxO.catchError(error => {
            logger.error({action: 'Event.updateImg', error: error})
            res.status(500).send(false)
            return rx.EMPTY
        })
    ).subscribe(events => res.status(200).send(events))
}

deleteOne = function (id, res) {
    let event = new Event({id: id})
    event.selectOne().pipe(
        rxO.switchMap((data) => {
            event = new Event(data.rows[0])
            return event.id && event.thumbnail && event.img ? rx.of(true) : rx.EMPTY
        }),
        rxO.switchMap(() => event.thumbnail ? fdb.deleteFile(CONFIG.fdb_img, event.thumbnail) : rx.EMPTY),
        rxO.switchMap(() => event.img ? fdb.deleteFile(CONFIG.fdb_img, event.img) : rx.EMPTY),
        rxO.switchMap(() => event.deleteOne()),
        rxO.catchError(error => {
            logger.error({action: 'Event.deleteOne', error: error})
            res.status(500).send(false)
            return rx.EMPTY
        })
    ).subscribe(() => res.status(200).send(true))
}

module.exports.Event = Event
module.exports.selectAll = selectAll
module.exports.selectLimit = selectLimit
module.exports.selectOne = selectOne
module.exports.add = add
module.exports.updateText = updateText
module.exports.updateImg = updateImg
module.exports.deleteOne = deleteOne
