const CONFIG = require('../../config/config')
const logger = CONFIG.logger
const rx = require('rxjs')
const rxO = require('rxjs/operators')
const fdb = require('../../fdb-lib/fdb')
const db = require('../db')
const uuidV4 = require('uuid/v4')

class User {

    constructor(obj) {
        if (!obj) {
            return
        }
        if (obj.id) {
            this.id = obj.id
        }
        if (obj.parent_id) {
            this.parent_id = obj.parent_id
        }
        if (obj.login) {
            this.login = obj.login
        }
        if (obj.password) {
            this.password = obj.password
        }
        if (obj.email) {
            this.email = obj.email
        }
        if (obj.when_created) {
            this.when_created = obj.when_created
        }
    }

    static selectAll() {
        const sql = 'SELECT * FROM t_users'
        return db.query(sql)
    }

    selectOne() {
        const sql = 'SELECT * FROM t_users WHERE id=?'
        return db.query(sql, [this.id])
    }

    add() {
        const sql = 'INSERT INTO t_users(id, parent_id, login, password, email, when_created) VALUES (?, ?, ?, ?, ?, ?)'
        return db.query(sql, [this.id, this.parent_id, this.login, this.password, this.email, this.when_created])
    }

    deleteOne() {
        const sql = 'DELETE FROM t_users WHERE id=?'
        return db.query(sql, [this.id])
    }

}

add = function (req, res) {
    const user = new User(req.body)
    user.when_created = new Date()
    user.id = uuidV4()
    user.parent_id = user.id
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
