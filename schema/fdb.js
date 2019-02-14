const fs = require('fs');
const path = require('path');

const rootFDB = '/home/sv/WebstormProjects/api/fdb/';

function promiseAllP(items, block) {
    var promises = [];
    items.forEach(function (item, index) {
        promises.push(function (item, i) {
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

exports.writeFile = function (dirName, id, content) {
    fs.writeFile(path.resolve(dirName, id), JSON.stringify(content), function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("FDB writeFile - ", path.resolve(dirName, id));
    });
};

exports.readFile = function (dirName, id) {
    return new Promise((resolve, reject) => {
        fs.readFile(path.resolve(dirName, id), 'utf-8', function (err, content) {
            if (err) {
                return console.log(err)
            }
            console.log("FDB readFile - ", path.resolve(dirName, id));
            return resolve(content);
        })
    });
};

exports.deleteFile = function (dirName, id) {
    fs.unlink(path.resolve(dirName, id), function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("FDB deleteFile - ", path.resolve(dirName, id));
    });
};
