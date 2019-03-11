const rx = require('rxjs');
const rxO = require('rxjs/operators');
const fs = require('fs');
const path = require('path');
const winston = require('winston');

const rootFDB = path.resolve(process.cwd(), 'fdb');
const imgFDB = path.resolve(rootFDB, 'img');
const logger = winston.loggers.get('log');

class Where {
    constructor(field, operator, value) {
        this.field = field;
        this.operator = operator;
        this.value = value;
    }
}

function readDir(dirName) {
    // const contents = [];
    const dir = path.resolve(rootFDB, dirName);
    console.log("FDB readDir - ", dir);
    return rx.bindNodeCallback(fs.readdir)(dir).pipe(
        rxO.flatMap(fileNames => rx.forkJoin(fileNames.map(fileName => readFile(dir, fileName)))),
        // one by one file good for big db
        // rxO.flatMap(fileNames => fileNames),
        // rxO.map(fileName => readFile(dir, fileName)),
        // rxO.mergeAll(),
        // rxO.mergeMap((content) => {
        //     console.log('concatMap', content);
        //     return rx.of(JSON.parse(content));
        // }),
        rxO.catchError(error => {
            console.log("FDB ERROR readDir - ", dir, error);
            return rx.throwError(error);
        })
    );
}

function writeFile(dirName, fileName, content, contentType = 'utf8') {
    const filePath = path.resolve(rootFDB, dirName, fileName);
    return rx.bindNodeCallback(fs.writeFile)(filePath, content, contentType).pipe(
        rxO.switchMap(() => {
                console.log("FDB writeFile - ", filePath);
                return rx.of(true);
            }
        ),
        rxO.catchError(error => {
            console.log("FDB ERROR writeFile - ", filePath, error);
            return rx.throwError(error);
        })
    )
}

function readFile(dirName, fileName, contentType = 'utf8') {
    const filePath = path.resolve(rootFDB, dirName, fileName);
    console.log("FDB readFile - ", filePath);
    return rx.bindNodeCallback(fs.readFile)(filePath, contentType).pipe(
        rxO.map(data => JSON.parse(data)),
        rxO.catchError(error => {
            console.log("FDB ERROR readFile - ", filePath, error);
            return rx.throwError(error);
        })
    );
}

function deleteFile(dirName, fileName) {
    const filePath = path.resolve(rootFDB, dirName, fileName);
    console.log("FDB deleteFile - ", filePath);
    return rx.bindNodeCallback(fs.unlink)(filePath).pipe(
        rxO.switchMap(() => rx.of(true)),
        rxO.catchError(error => {
            console.log("FDB ERROR deleteFile - ", filePath, error);
            return rx.throwError(error);
        })
    );
}

function addImage(fileName, content) {
    const ext = content.indexOf('data:image/jpg;base64,') > 0 ? '.jpg' : '.png';
    fileName = fileName + ext;
    logger.info("FDB addImage - " + fileName);
    return writeFile(imgFDB, fileName, content.replace(/^data:image\/\w+;base64,/, ''), 'base64');
}

function selectData(dirName, filter) {
    // console.log('EXPRESS.GET', server.settings.fdb);

    console.log("FDB select - ", dirName, filter);
    let sType = 'NONE';
    let id;
    let top;
    let orderBy;
    let where;
    // {id:'{0000-000..}'}
    if (filter.hasOwnProperty('id')) {
        id = filter.id.substring(0, 36);
        sType = 'ONE';
    } else if (filter.hasOwnProperty('where')
    // && filter.hasOwnProperty('orderBy')
    // && filter.hasOwnProperty('where')
    ) {
        orderBy = filter.orderBy;
        top = parseInt(filter.top);
        where = filter.where;
        sType = 'MORE';
    }
    if (sType === 'ONE') {
        return readFile(dirName, id).pipe(
            rxO.switchMap((data) => rx.of(data ? [data] : []))
        );
    }
    if (sType === 'MORE') {
        return readDir(dirName).pipe(
            rxO.switchMap((data) => {
                console.log(data);
                return rx.of(data.filter(filterWhere.bind(this, where)));
            })
        );
    }
    return rx.of([]);
}

function filterWhere(where, element) {
    if (element[where.field]) {
        switch (where.operator) {
            case 'greater':
                return where.value > element[where.field];
            case 'less':
                return where.value < element[where.field];
            case 'not equal':
                return where.value !== element[where.field];
            case 'equal':
                return where.value === element[where.field];
            default:
                return false;
        }
    }
    return element > where;
}

function updateFile(dirName, fileName, content, contentType = 'utf8') {
    const filePath = path.resolve(rootFDB, dirName, fileName);
    console.log("FDB updateFile - ", filePath);
    return readFile(dirName, fileName, contentType).pipe(
        rxO.switchMap((data) => {
                for (const name in data) {
                    if (data.hasOwnProperty(name) && content.hasOwnProperty(name)) {
                        data[name] = content[name];
                    }
                }
                return rx.of(JSON.stringify(data));
            }
        ),
        rxO.switchMap((updReady) => {
            console.log("FDB writeFile", updReady);
            return writeFile(dirName, fileName, updReady, contentType);
        }),
        rxO.catchError(error => {
            console.log("FDB ERROR writeFile - ", filePath, error);
            return rx.throwError(error);
        })
    )
}

module.exports.readFile = readFile;
module.exports.writeFile = writeFile;
module.exports.deleteFile = deleteFile;
module.exports.addImage = addImage;
module.exports.selectData = selectData;
module.exports.updateFile = updateFile;
module.exports.Where = Where;
