const hf = require('./helper-files');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const uuidV4 = require('uuid/v4');

// linux
var rootDir = '/home/sv/WebstormProjects/api/fdb/';
var eventsDir = rootDir + 'events/';

var corsOptions = {
    origin: 'http://example.com',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
};

const app = express();
app.use(bodyParser.json());
app.use(cors(corsOptions));

app.route('/api/events/:id')
    .all(function (req, res, next) {
        console.log("All Event");
        next();
    })
    .put((req, res) => {
        const event = req.body;
        event['timestamp'] = new Date();
        const id = req.params['id'];
        hf.writeFiles(eventsDir + id, event);
        // save to log db
        console.log("Update Event", id, event);
        res.status(200).send('OK');
    })
    .get((req, res) => {
        const id = req.params['id'];
        hf.readFile(eventsDir + id)
            .then(event => {
                console.log("Get Event", id, event);
                res.status(200).send(JSON.parse(event));
            })
    })
    .delete((req, res) => {
        const id = req.params['id'];
        hf.deleteFile(eventsDir + id);
        res.status(204).send('OK');
    });


app.route('/api/events')
    .all(function (req, res, next) {
        console.log("All Event");
        next();
    })
    .post((req, res) => {
        const event = req.body;
        event['timestamp'] = new Date();
        const id = uuidV4();
        hf.writeFiles(eventsDir + id, event);
        // save to log db
        console.log("Add Event", id, event);
        res.status(201).send(id);
    })
    .get((req, res) => {
        const events = {};
        hf.readFiles(eventsDir)
            .then(files => {
                files.forEach((item) => {
                    events[item.filename] = JSON.parse(item.contents);
                });
            })
            .then(() => {
                console.log("Get Events length", Object.keys(events).length);
                res.status(200).send(events);
            })
            .catch(error => {
                console.log(error);
            });
    });


app.listen(8000, () => {
    console.log('Server started!');
});
