const mysql = require('mysql')
const rx = require('rxjs')
const rxO = require('rxjs/operators')

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'MyPDBPassword',
    database: 'test'
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
            console.log('ERROR QUERY', error)
            return rx.throwError(error)
        })
    )
}

exports.query = query
