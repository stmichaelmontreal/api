const envFile = process.env.NODE_ENV ? `.env.${process.env.NODE_ENV}` : '.env'
require('dotenv').config({path: envFile})

const path = require('path')
const winston = require('winston')
const logger = winston.loggers.get('log')

// Make this global to use all over the application
let CONFIG = {}

CONFIG.app = process.env.APP || 'dev'
CONFIG.port = process.env.PORT || '3000'

CONFIG.db_dialect = process.env.DB_DIALECT || 'mysql'
CONFIG.db_host = process.env.DB_HOST || 'localhost'
CONFIG.db_port = process.env.DB_PORT || '3306'
CONFIG.db_name = process.env.DB_NAME || 'test'
CONFIG.db_user = process.env.DB_USER || 'root'
CONFIG.db_password = process.env.DB_PASSWORD || 'Qweasd12'

CONFIG.fdb_root = process.env.FDB_ROOT || path.resolve(process.cwd(), 'fdb')
CONFIG.fdb_img = process.env.FDB_IMG || 'img'
CONFIG.logger = logger

module.exports = CONFIG
