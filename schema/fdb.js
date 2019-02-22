const rx = require('rxjs');
const rxO = require('rxjs/operators');
const fs = require('fs');
const path = require('path');
const uuidV4 = require('uuid/v4');

//lin
// const rootFDB = '/home/sv/WebstormProjects/api/fdb/';
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

exports.readDir = function (dirName) {
    return new Promise((resolve, reject) => {
        const dir = path.resolve(rootFDB, dirName);
        console.log("FDB readDir - ", dir);
        fs.readdir(dir, function (err, filenames) {
            if (err) return reject(err);
            promiseAllP(filenames,
                (filename, index, resolve, reject) => {
                    fs.readFile(path.resolve(dir, filename), 'utf-8', function (err, content) {
                        if (err) {
                            return reject(err);
                        }
                        return resolve({filename: filename, contents: content});
                    });
                })
                .then(results => {
                    return resolve(results);
                })
                .catch(error => {
                    return reject(error);
                });
        });
    });
};

function writeFile(dirName, fileName, content, contentType) {
    const filePath = path.resolve(dirName, fileName);
    return rx.bindNodeCallback(fs.writeFile)(filePath, content, contentType).pipe(
        rxO.switchMap(() => {
                console.log("FDB writeFile - ", filePath);
            }
        ),
        rxO.catchError(error => {
            console.log(filePath, error)
        })
    )
}

exports.readFile = function (dirName, id) {
    return new Promise((resolve, reject) => {
        fs.readFile(path.resolve(dirName, id), 'utf-8',
            function (err, content) {
                if (err) {
                    return console.log(err)
                }
                console.log("FDB readFile - ", path.resolve(dirName, id));
                return resolve(content);
            }
        )
    });
};

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

function addImage(img) {
    const id = uuidV4();
    const base64Data = img.replace(/^data:image\/png;base64,/, '');
    return writeFile(imgFDB, id + '.png', base64Data, 'base64').pipe(
        rxO.switchMap(() => {
                console.log("FDB addImage - ", id);
                return rx.of(id);
            }
        )
    )


}

module.exports.writeFile = writeFile;
module.exports.addImage = addImage;
