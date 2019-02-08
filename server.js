const hf = require('./helper-files');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const uuidv4 = require('uuid/v4');

// linux
var rootDir = '/home/sv/WebstormProjects/api/fdb/';
var eventsDir = rootDir + 'events/';

var corsOptions = {
    origin: 'http://example.com',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

const app = express();
app.use(bodyParser.json());
app.use(cors(corsOptions));

app.route('/api/events').post((req, res) => {
    let event = req.body;
    event['timestamp'] = new Date();
    hf.writeFiles(eventsDir + uuidv4(), event);
    // save to log db
    console.log("post events", req.body);
    res.send(201, req.body);
});

app.route('/api/events/:id').put((req, res) => {
    let event = req.body;
    event['timestamp'] = new Date();
    hf.writeFiles(eventsDir + req.params['id'], event);
    // save to log db
    console.log("put events params", req.params);
    res.send(200, req.body);
});

app.route('/api/events').get((req, res) => {
    var events = [];
    hf.readFiles(eventsDir)
        .then(files => {
            console.log("loaded ", files.length);
            files.forEach((item, index) => {
                console.log("item ", index, " size ", item.contents.length);
                events.push(JSON.parse(item.contents));
            });
        })
        .then(() => {
            console.log(events);
            res.send(events);
        })
        .catch(error => {
            console.log(error);
        });
});

app.route('/api/events/:id').get((req, res) => {
    console.log("get event param", eventsDir + req.params['id']);
    hf.readFile(eventsDir + req.params['id'])
        .then(event => {
            console.log(event);
            res.send(JSON.parse(event));
        })
});

app.route('/api/events/:id').delete((req, res) => {
    res.sendStatus(204);
});

app.listen(8000, () => {
    console.log('Server started!');
});
