const CONFIG = require('../../config/config')
const logger = CONFIG.logger
const rx = require('rxjs')
const rxO = require('rxjs/operators')
const fdb = require('../../fdb-lib/fdb')
const db = require('../db')
const uuidV4 = require('uuid/v4')

class Event {

    constructor(obj) {
        if (obj.e_id) {
            this.e_id = obj.e_id
        }
        if (obj.e_title) {
            this.e_title = obj.e_title
        }
        if (obj.e_date) {
            this.e_date = obj.e_date
        }
        if (obj.e_thumbnail) {
            this.e_thumbnail = obj.e_thumbnail
        }
        if (obj.e_img) {
            this.e_img = obj.e_img
        }
        if (obj.e_description) {
            this.e_description = obj.e_description
        }
        if (obj.e_timestamp) {
            this.e_timestamp = obj.e_timestamp
        }
    }

    static selectAll() {
        const sql = 'SELECT * FROM t_events'
        return db.query(sql)
    }

    static selectLimit(startIndex, numberOfRecords) {
        const sql = 'SELECT * FROM t_events ORDER BY e_date LIMIT ?, ?'
        return db.query(sql, [startIndex, numberOfRecords])
    }

    selectOne() {
        const sql = 'SELECT * FROM t_events WHERE e_id=?'
        return db.query(sql, [this.e_id])
    }

    add() {
        const sql = 'INSERT INTO t_events(e_id, e_title, e_date, e_thumbnail, e_img, e_description) VALUES (?, ?, ?, ?, ?, ?)'
        return db.query(sql, [this.e_id, this.e_title, this.e_date, this.e_thumbnail, this.e_img, this.e_description])
    }

    updateText() {
        const sql = 'UPDATE t_events SET e_title=?, e_date=?, e_description=? WHERE e_id=?'
        return db.query(sql, [this.e_title, this.e_date, this.e_description, this.e_id])
    }

    deleteOne() {
        const sql = 'DELETE FROM t_events WHERE e_id=?'
        return db.query(sql, [this.e_id])
    }

}

add = function (req, res) {
    const event = new Event(req.body)
    event.e_timestamp = new Date()
    event.e_id = uuidV4()
    let img
    let thumbnail
    if (event.e_img) {
        img = fdb.getImage(event.e_img)
        event.e_img = event.e_id + '.' + img.ext
    }
    if (event.e_thumbnail) {
        thumbnail = fdb.getImage(event.e_thumbnail)
        event.e_thumbnail = event.e_id + '-th.' + thumbnail.ext
    }
    fdb.writeFile(CONFIG.fdb_img, event.e_img, img.content, 'base64').pipe(
        rxO.switchMap(() => fdb.writeFile(CONFIG.fdb_img, event.e_thumbnail, thumbnail.content, 'base64')),
        rxO.switchMap(() => event.add()),
        rxO.catchError(error => {
            logger.error({action: 'addEvent', obj: event, error: error})
            res.status(500).send(false)
            return rx.EMPTY
        })
    ).subscribe(() => res.status(200).send({e_id: event.e_id}))
}

selectAll = function (res) {
    Event.selectAll().pipe(
        rxO.catchError(error => {
            logger.error({action: 'selectAll', error: error})
            res.status(500).send(false)
            return rx.EMPTY
        })
    ).subscribe(events => res.status(200).send(events))
}

selectLimit = function (startIndex, numberOfRecords, res) {
    Event.selectLimit(startIndex, numberOfRecords).pipe(
        rxO.catchError(error => {
            logger.error({action: 'selectLimit', error: error})
            res.status(500).send(false)
            return rx.EMPTY
        })
    ).subscribe(events => res.status(200).send(events))
}

selectOne = function (id, res) {
    const event = new Event({e_id: id})
    event.selectOne().pipe(
        rxO.catchError(error => {
            logger.error({action: 'selectOne', error: error})
            res.status(500).send(false)
            return rx.EMPTY
        })
    ).subscribe(events => res.status(200).send(events))
}

updateText = function (req, res) {
    const event = new Event(req.body)
    event.updateText().pipe(
        rxO.catchError(error => {
            logger.error({action: 'updateText', error: error})
            res.status(500).send(false)
            return rx.EMPTY
        })
    ).subscribe(() => res.status(200).send(true))
}

updateImg = function (req, res) {
    const event = new Event(req.body)
    event.updateText().pipe(
        rxO.catchError(error => {
            logger.error({action: 'updateImg', error: error})
            res.status(500).send(false)
            return rx.EMPTY
        })
    ).subscribe(events => res.status(200).send(events))
}

deleteOne = function (id, res) {
    let event = new Event({e_id: id})
    event.selectOne().pipe(
        rxO.switchMap((data) => {
            event = new Event(data.rows[0])
            return event.e_id && event.e_thumbnail && event.e_img ? rx.of(true) : rx.EMPTY
        }),
        rxO.switchMap(() => event.e_thumbnail ? fdb.deleteFile(CONFIG.fdb_img, event.e_thumbnail) : rx.EMPTY),
        rxO.switchMap(() => event.e_img ? fdb.deleteFile(CONFIG.fdb_img, event.e_img) : rx.EMPTY),
        rxO.switchMap(() => event.deleteOne()),
        rxO.catchError(error => {
            logger.error({action: 'deleteOne', error: error})
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
