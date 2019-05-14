const CONFIG = require('../../config/config')
const logger = CONFIG.logger
const rx = require('rxjs')
const rxO = require('rxjs/operators')
const fdb = require('../../fdb-lib/fdb')
const db = require('../db')
const uuidV4 = require('uuid/v4')
const bcrypt = require('bcryptjs')

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
            this.login = obj.login.toLowerCase()
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

    static checkLogin(login) {
        const sql = 'SELECT login FROM t_users WHERE login=?'
        return db.query(sql, [login])
    }

    static checkPassword(login) {
        const sql = 'SELECT password FROM t_users WHERE login=?'
        return db.query(sql, [login])
    }

    static resetPassword(login, newPassword) {
        const newHashedPassword = bcrypt.hashSync(newPassword, 8)
        const sql = 'UPDATE t_users SET password=? WHERE login=?'
        return db.query(sql, [newHashedPassword, login])
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
        const hashedPassword = bcrypt.hashSync(this.password, 8)
        const sql = 'INSERT INTO t_users(id, parent_id, login, password, email, when_created) VALUES (?, ?, ?, ?, ?, ?)'
        return db.query(sql, [this.id, this.parent_id, this.login, hashedPassword, this.email, this.when_created])
    }

    deleteOne() {
        const sql = 'DELETE FROM t_users WHERE id=?'
        return db.query(sql, [this.id])
    }

}

checkLogin = function (login) {
    return User.checkLogin(login).pipe(
        rxO.map(data => data.rows.length > 0
            ? {status: 0, login: data.rows[0].login}
            : {status: 1, login: login, error: 'Can\'t find login!'}
        ),
        rxO.catchError(error => {
            logger.error({action: 'User.checkLogin', error: error})
            return rx.of({status: 3, login: login, error: error})
        })
    )
}

checkPassword = function (login, password) {
    return User.checkPassword(login).pipe(
        rxO.map(data =>
            data.rows.length > 0
                ? bcrypt.compareSync(password, data.rows[0].password)
                : false
        ),
        rxO.catchError(error => {
            logger.error({action: 'User.checkPassword', error: error})
            return rx.of(false)
        })
    )
}

resetPassword = function (login, oldPassword, newPassword) {
    return User.checkPassword(login, oldPassword).pipe(
        rxO.map(isChecked => {
                return isChecked
                    ? User.resetPassword(login, newPassword)
                    : rx.of(false)
            }
        ),
        rxO.catchError(error => {
            logger.error({action: 'User.resetPassword', error: error})
            return rx.of(false)
        })
    ).subscribe(() => res.status(200).send(true))
}

selectAll = function (res) {
    User.selectAll().pipe(
        rxO.catchError(error => {
            logger.error({action: 'User.selectAll', error: error})
            res.status(500).send(false)
            return rx.EMPTY
        })
    ).subscribe(records => res.status(200).send(records))
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
    ).subscribe(() => res.status(200).send({id: user.id}))
}

module.exports.User = User
module.exports.checkLogin = checkLogin
module.exports.checkPassword = checkPassword
module.exports.resetPassword = resetPassword
module.exports.selectAll = selectAll
module.exports.selectOne = selectOne
module.exports.add = add
