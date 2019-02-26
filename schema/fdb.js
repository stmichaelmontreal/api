const rx = require('rxjs');
const rxO = require('rxjs/operators');
const fs = require('fs');
const path = require('path');
const uuidV4 = require('uuid/v4');

//lin
//const rootFDB = '/home/sv/WebstormProjects/api/fdb/';
// win
const rootFDB = 'C:\\PRG\\node\\api\\fdb\\';
const imgFDB = path.resolve(rootFDB, 'img');

function promiseAllP(items, block) {
    const promises = [];
    items.forEach(function (item, index) {
        promises.push(function (item) {
            return new Promise(function (resolve, reject) {
                return block.apply(this, [item, index, resolve, reject]);
            });
        }(item, index))
    });
    return Promise.all(promises);
}

function readDir(dirName) {
    const contentArr = [];
    const dir = path.resolve(rootFDB, dirName);
    console.log("FDB readDir - ", dir);
    return rx.bindNodeCallback(fs.readdir)(dir).pipe(
        rxO.switchMap(fileNames => fileNames),
        rxO.map(fileName =>{
            console.log(fileName);
            return readFile(dir, fileName);
        }),
        rxO.combineAll(),
        rxO.catchError(error => {
            console.log("FDB ERROR readDir - ", dir, error);
            return rx.EMPTY;
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
            return rx.of(false);
        })
    )
}

function readFile(dirName, fileName, contentType = 'utf8') {
    const filePath = path.resolve(rootFDB, dirName, fileName);
    return rx.bindNodeCallback(fs.readFile)(filePath, contentType).pipe(
        rxO.switchMap((content) => {
                console.log("FDB readFile - ", filePath);
                return rx.of(content);
            }
        ),
        rxO.catchError(error => {
            console.log("FDB ERROR readFile - ", filePath, error);
            return rx.EMPTY;
        })
    );
}

exports.deleteFile = function (dirName, id) {
    fs.unlink(path.resolve(dirName, id),
        function (err) {
            if (err) {
                return console.log(err);
            }
            console.log("FDB deleteFile - ", path.resolve(dirName, id));
        }
    );
};

function addImage(fileName, img) {
    const base64Data = img.replace(/^data:image\/\w+;base64,/, '');
    return writeFile(imgFDB, fileName + '.jpg', base64Data, 'base64').pipe(
        rxO.switchMap(() => {
                console.log("FDB addImage - ", fileName + '.jpg');
                return rx.of(true);
            }
        )
    )
}

function selectData(dirName, filter) {
    let sType = 'NONE';
    let id;
    let top;
    let orderBy;
    let where;
    // {id:'{0000-000..}'}
    if (filter.hasOwnProperty('id')) {
        id = filter.id.substring(0, 36);
        sType = 'ONE';
    } else if (filter.hasOwnProperty('top')
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
            rxO.switchMap((data) => {
                    console.log("FDB select ONE - ", !!data);
                    return rx.of(!!data ? [data] : []);
                }
            )
        );
    }
    if (sType === 'MORE') {
        return readDir(dirName, id);
    }
    return rx.of([]);
}

module.exports.readFile = readFile;
module.exports.writeFile = writeFile;
module.exports.addImage = addImage;
module.exports.selectData = selectData;
