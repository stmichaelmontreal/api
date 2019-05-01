const CONFIG = require('../../config/config')
const logger = CONFIG.logger
const rx = require('rxjs')
const rxO = require('rxjs/operators')
const fdb = require('../../fdb-lib/fdb')
const db = require('../db')
const uuidV4 = require('uuid/v4')

class CalendarEvent {

    constructor(obj) {
        if (!obj) {
            return
        }
        if (obj.id) {
            this.id = obj.id
        }
        if (obj.when_created) {
            this.when_created = obj.when_created
        }
    }

    static selectAll() {
        const sql = 'SELECT * FROM t_calendar'
        return db.query(sql)
    }

    selectOne() {
        const sql = 'SELECT * FROM t_calendar WHERE id=?'
        return db.query(sql, [this.id])
    }

    add() {
        const sql = 'INSERT INTO t_calendar(id, when_created) VALUES (?, ?)'
        return db.query(sql, [this.id, this.when_created])
    }

    deleteOne() {
        const sql = 'DELETE FROM t_calendar WHERE id=?'
        return db.query(sql, [this.id])
    }

}

add = function (req, res) {
    const user = new CalendarEvent(req.body)
    user.when_created = new Date()
    user.id = uuidV4()
    user.add().pipe(
        rxO.catchError(error => {
            logger.error({action: 'User.add', error: error})
            res.status(500).send(false)
            return rx.EMPTY
        })
    ).subscribe(events => res.status(200).send({id: user.id}))
}

selectAll = function (res) {
    User.selectAll().pipe(
        rxO.catchError(error => {
            logger.error({action: 'User.selectAll', error: error})
            res.status(500).send(false)
            return rx.EMPTY
        })
    ).subscribe(events => res.status(200).send(events))
}

selectOne = function (id, res) {
    const user = new User({id: id})
    user.selectOne().pipe(
        rxO.catchError(error => {
            logger.error({action: 'User.selectOne', error: error})
            res.status(500).send(false)
            return rx.EMPTY
        })
    ).subscribe(record => res.status(200).send(record))
}

module.exports.User = User
module.exports.selectAll = selectAll
module.exports.selectOne = selectOne
module.exports.add = add