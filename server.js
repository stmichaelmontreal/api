const hf = require('./helper-files');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

// linux
var rootDir = '/home/sv/WebstormProjects/api/db/';
var eventsDir = rootDir + 'events';

var corsOptions = {
    origin: 'http://example.com',
    optionsSuccessStatus: 200 // some legacy browsers (IE11, various SmartTVs) choke on 204
}

const app = express();
app.use(bodyParser.json());
app.use(cors(corsOptions))

app.route('/api/cats').post((req, res) => {
    res.send(201, req.body);
});

app.route('/api/cats/:name').put((req, res) => {
    res.send(200, req.body);
});

app.route('/api/events').get((req, res) => {
    var events = [];
    hf.readFiles(eventsDir)
        .then(files => {
            console.log("loaded ", files.length);
            files.forEach((item, index) => {
                console.log("item", index, "size ", item.contents.length);
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

app.route('/api/cats/:name').get((req, res) => {
    const requestedCatName = req.params['name'];
    res.send({name: requestedCatName});
});

app.route('/api/cats/:name').delete((req, res) => {
    res.sendStatus(204);
});

app.listen(8000, () => {
    console.log('Server started!');
});
