const fs = require('fs')
const path = require('path')

const rx = require('rxjs')
const rxO = require('rxjs/operators')

const winston = require('winston')
const logger = winston.loggers.get('fdb')

const rootFDB = path.resolve(process.cwd(), 'fdb')

function writeFile(dirName, fileName, content, contentType = 'utf8') {
    const filePath = path.resolve(rootFDB, dirName, fileName)
    logger.info({
        action: 'writeFile',
        dirName: dirName,
        fileName: fileName,
        content: content,
        contentType: contentType
    })
    // logger.info(`writeFile - ${dirName}; ${fileName}`);
    return rx.bindNodeCallback(fs.writeFile)(filePath, content, contentType).pipe(
        rxO.map(() => true),
        rxO.catchError(error => {
            // logger.error(`{action: "writeFile", dirName: ${dirName}, fileName: ${fileName}, error: ${error}`)
            logger.error({action: writeFile, dirName: dirName, fileName: fileName, error: error});
            return rx.throwError(error)
        })
    )
}

function readDir(dirName) {
    // logger.info({action: 'readDir', dirName: dirName})
    const dir = path.resolve(rootFDB, dirName)
    return rx.bindNodeCallback(fs.readdir)(dir).pipe(
        // one call for all files has limitation open files
        // rxO.flatMap(fileNames => rx.forkJoin(fileNames.map(fileName => readFile(dir, fileName)))),
        // one by one file good for big db
        rxO.flatMap(fileNames => fileNames),
        rxO.map(fileName => readFile(dir, fileName)),
        rxO.concatAll(),
        rxO.concatMap((content) => rx.of(content)),
        rxO.catchError(error => {
            logger.error({action: 'readDir', dirName: dirName, error: error})
            return rx.throwError(error)
        })
    )
}

function readFile(dirName, fileName, contentType = 'utf8') {
    // logger.info({action: 'readFile', dirName: dirName, fileName: fileName})
    const filePath = path.resolve(rootFDB, dirName, fileName)
    return rx.bindNodeCallback(fs.readFile)(filePath, contentType).pipe(
        rxO.map(data => JSON.parse(data)),
        rxO.catchError(error => {
            logger.error({action: 'readFile', dirName: dirName, fileName: fileName, error: error})
            return rx.throwError(error)
        })
    )
}

function updateFile(dirName, fileName, content, contentType = 'utf8') {
    logger.info({
        action: 'updateFile',
        dirName: dirName,
        fileName: fileName,
        content: content,
        contentType: contentType
    })
    // logger.info(`updateFile - ${dirName}; ${fileName}`);
    const filePath = path.resolve(rootFDB, dirName, fileName)
    return readFile(dirName, fileName, contentType).pipe(
        rxO.switchMap((data) => {
                for (const name in data) {
                    if (data.hasOwnProperty(name) && content.hasOwnProperty(name)) {
                        data[name] = content[name]
                    }
                }
                return rx.of(JSON.stringify(data))
            }
        ),
        rxO.switchMap((updReady) => writeFile(dirName, fileName, updReady, contentType)),
        rxO.catchError(error => {
            logger.error({action: 'updateFile', dirName: dirName, fileName: fileName, error: error})
            return rx.throwError(error)
        })
    )
}

function deleteFile(dirName, fileName) {
    logger.info({action: 'deleteFile', dirName: dirName, fileName: fileName})
    // logger.info(`deleteFile - ${dirName}; ${fileName}`);
    const filePath = path.resolve(rootFDB, dirName, fileName)
    return rx.bindNodeCallback(fs.unlink)(filePath).pipe(
        rxO.map(() => true),
        rxO.catchError(error => {
            logger.error({action: 'deleteFile', dirName: dirName, fileName: fileName, error: error})
            // logger.error(`deleteFile - ${dirName}; ${fileName}; ${error}`)
            return rx.throwError(error)
        })
    )
}


module.exports.writeFile = writeFile
module.exports.readDir = readDir
module.exports.readFile = readFile
module.exports.updateFile = updateFile
module.exports.deleteFile = deleteFile
