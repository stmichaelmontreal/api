const CONFIG = require('../../config/config')
const logger = CONFIG.logger
const rx = require('rxjs')
const rxO = require('rxjs/operators')
const db = require('../db')
const bcrypt = require('bcryptjs')

class Auth {

    constructor(obj) {
        if (!obj) {
            return
        }
        if (obj.login) {
            this.login = obj.login.toLowerCase()
        }
        if (obj.password) {
            this.password = obj.password
        }
        if (obj.new_password) {
            this.new_password = obj.new_password
        }
    }

    checkLogin() {
        const sql = 'SELECT login FROM t_users WHERE login=?'
        return db.query(sql, [this.login])
    }

    getPassword() {
        const sql = 'SELECT password FROM t_users WHERE login=?'
        return db.query(sql, [this.login])
    }

    resetPassword() {
        const newHashedPassword = bcrypt.hashSync(this.new_password, 8)
        const sql = 'UPDATE t_users SET password=? WHERE login=?'
        return db.query(sql, [newHashedPassword, this.login])
    }

}

checkLogin = function (obj) {
    return obj.checkLogin().pipe(
        rxO.map(data => data.rows.length > 0
            ? {status: 0, login: data.rows[0].login}
            : {status: 1, login: obj.login, error: 'Can\'t find login!'}
        ),
        rxO.catchError(error => {
            logger.error({action: 'Auth.checkLogin', error: error})
            return rx.of({status: 3, login: obj.login, error: error})
        })
    )
}

checkPassword = function (obj) {
    return obj.getPassword().pipe(
        rxO.map(data => data.rows.length > 0
            ? bcrypt.compareSync(obj.password, data.rows[0].password)
            : false
        ),
        rxO.catchError(error => {
            logger.error({action: 'Auth.checkPassword', error: error})
            return rx.of(false)
        })
    )
}

resetPassword = function (req, res) {
    const authObj = new Auth(req.body)
    return checkPassword(authObj).pipe(
        rxO.switchMap(isChecked => isChecked
            ? authObj.resetPassword()
            : rx.of(false)
        ),
        rxO.catchError(error => {
            logger.error({action: 'Auth.resetPassword', error: error})
            res.status(500).send({reset: false})
            return rx.EMPTY
        })
    ).subscribe((data) => {
        if (data && data.rows && data.rows.changedRows === 1) {
            res.status(200).send({reset: true})
        } else {
            res.status(401).send({reset: false})
        }
    })
}

module.exports.Auth = Auth
module.exports.checkLogin = checkLogin
module.exports.checkPassword = checkPassword
module.exports.resetPassword = resetPassword
