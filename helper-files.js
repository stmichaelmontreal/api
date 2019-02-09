const fs = require('fs');
const path = require('path');

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

exports.readFiles = function (dirname) {
    return new Promise((resolve, reject) => {
        fs.readdir(dirname, function (err, filenames) {
            if (err) return reject(err);
            promiseAllP(filenames,
                (filename, index, resolve, reject) => {
                    fs.readFile(path.resolve(dirname, filename), 'utf-8', function (err, content) {
                        if (err) return reject(err);
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

exports.writeFiles = function (fileName, content) {
    fs.writeFile(fileName, JSON.stringify(content), function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("Write file - ", fileName);
    });
};

exports.readFile = function (fileName) {
    return new Promise((resolve, reject) => {
        fs.readFile(fileName, 'utf-8', function (err, content) {
            if (err) {
                return console.log(err)
            }
            console.log("Read file - ", fileName);
            return resolve(content);
        })
    });
};

exports.deleteFile = function (fileName) {
    fs.unlink(fileName, function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("Delete file - ", fileName);
    });
};
