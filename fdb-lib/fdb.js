const path = require('path')

// const rootFDB = path.resolve(process.cwd(), 'fdb')
// const imgFDB = path.resolve(rootFDB, 'img')

const wrud = require(path.join(__dirname, 'wrud'))
const select = require(path.join(__dirname, 'select'))
const helper = require(path.join(__dirname, 'helper'))

module.exports.writeFile = wrud.writeFile
module.exports.readDir = wrud.readDir
module.exports.readFile = wrud.readFile
module.exports.updateFile = wrud.updateFile
module.exports.deleteFile = wrud.deleteFile

module.exports.getImage = helper.getImage

module.exports.select = select.select
module.exports.Where = select.Where
