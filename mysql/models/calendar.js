const CONFIG = require('../../config/config')
const logger = CONFIG.logger
const rx = require('rxjs')
const rxO = require('rxjs/operators')
const fdb = require('../../fdb-lib/fdb')
const db = require('../db')
const uuidV4 = require('uuid/v4')

class CalendarItem {

    constructor(obj) {
        if (!obj) {
            return
        }
        if (obj.id) {
            this.id = obj.id
        }
        if (obj.calendar_date) {
            this.calendar_date = obj.calendar_date
        }
        if (obj.description) {
            this.description = obj.description
        }
        if (obj.when_created) {
            this.when_created = obj.when_created
        }
    }

    static selectLimit(startIndex, numberOfRecords) {
        const sql = 'SELECT * FROM t_calendar ORDER BY calendar_date LIMIT ?, ?'
        return db.query(sql, [startIndex, numberOfRecords])
    }

    selectOne() {
        const sql = 'SELECT * FROM t_calendar WHERE id=?'
        return db.query(sql, [this.id])
    }

    add() {
        const sql = 'INSERT INTO t_calendar(id, calendar_date, description, when_created) VALUES (?, ?, ?, ?)'
        return db.query(sql, [this.id, this.calendar_date, this.description, this.when_created])
    }

    update() {
        const sql = 'UPDATE t_calendar SET calendar_date=?, description=? WHERE id=?'
        return db.query(sql, [this.calendar_date, this.description, this.id])
    }

    deleteOne() {
        const sql = 'DELETE FROM t_calendar WHERE id=?'
        return db.query(sql, [this.id])
    }

}

selectLimit = function (startIndex, numberOfRecords, res) {
    CalendarItem.selectLimit(startIndex, numberOfRecords).pipe(
        rxO.catchError(error => {
            logger.error({action: 'Calendar.selectLimit', error: error})
            res.status(500).send(false)
            return rx.EMPTY
        })
    ).subscribe(records => res.status(200).send(records))
}

selectOne = function (id, res) {
    const item = new CalendarItem({id: id})
    item.selectOne().pipe(
        rxO.catchError(error => {
            logger.error({action: 'Calendar.selectOne', error: error})
            res.status(500).send(false)
            return rx.EMPTY
        })
    ).subscribe(record => res.status(200).send(record))
}

add = function (req, res) {
    const item = new CalendarItem(req.body)
    item.when_created = new Date()
    item.id = uuidV4()
    item.add().pipe(
        rxO.catchError(error => {
            logger.error({action: 'Calendar.add', error: error})
            res.status(500).send(false)
            return rx.EMPTY
        })
    ).subscribe(() => res.status(200).send({id: item.id}))
}

update = function (req, res) {
    const item = new CalendarItem(req.body)
    item.update().pipe(
        rxO.catchError(error => {
            logger.error({action: 'Calendar.update', error: error})
            res.status(500).send(false)
            return rx.EMPTY
        })
    ).subscribe(() => res.status(200).send(true))
}

deleteOne = function (id, res) {
    let item = new CalendarItem({id: id})
    item.deleteOne().pipe(
        rxO.catchError(error => {
            logger.error({action: 'Calendar.deleteOne', error: error})
            res.status(500).send(false)
            return rx.EMPTY
        })
    ).subscribe(() => res.status(200).send(true))
}

module.exports.CalendarItem = CalendarItem
module.exports.selectLimit = selectLimit
module.exports.selectOne = selectOne
module.exports.add = add
module.exports.update = update
module.exports.deleteOne = deleteOne
