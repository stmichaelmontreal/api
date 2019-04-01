const CONFIG = require('../config/config')
const logger = CONFIG.logger;
const mysql = require('mysql')
const rx = require('rxjs')
const rxO = require('rxjs/operators')

const pool = mysql.createPool({
    host: CONFIG.db_host,
    user: CONFIG.db_user,
    password: CONFIG.db_password,
    database: CONFIG.db_name
})

const getConnection = function (callback) {
    pool.getConnection(function (err, connection) {
        callback(err, connection)
    })
}

const queryFP = function query(conn, sql, values, callback) {
    conn.query(sql, values, function (err, results, fields) {
        conn.release();
        callback(err, {rows: results, fields: fields})
    })
}

function query(queryStr, values) {
    return rx.bindNodeCallback(getConnection)().pipe(
        rxO.switchMap(conn => conn ? rx.bindNodeCallback(queryFP)(conn, queryStr, values) : rx.EMPTY),
        rxO.catchError(error => {
            logger.error({action: 'DB query', error: error});
            return rx.throwError(error)
        })
    )
}

exports.query = query
