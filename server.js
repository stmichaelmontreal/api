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

app.route('/api/events/:action')
    .all(function (req, res, next) {
        console.log("All Event");
        next();
    })
    .post((req, res) => {
        switch (req.params['action']) {
            case 'select':
                const events = {};
                hf.readFiles(eventsDir)
                    .then(files => {
                        files.forEach((item) => {
                            events[item.filename] = JSON.parse(item.contents);
                        });
                        console.log("Get Events length", Object.keys(events).length);
                        res.status(200).send(events);
                    });
                break;
            case 'add':
                const event = req.body;
                event['timestamp'] = new Date();
                const id = uuidV4();
                event['id'] = id;
                hf.writeFiles(eventsDir + id, event);
                // save to log db
                console.log("Add Event", id, event);
                res.status(200).send(id);
                break;
            case 'update':
                const uEvent = JSON.parse(req.body);
                const uId = uEvent.id;
                hf.writeFiles(eventsDir + uId, event);
                // save to log db
                console.log("Update Event", uId, event);
                res.status(200).send(id);
                break;
            case 'delete':
                const dEvent = JSON.parse(req.body);
                const dId = dEvent.id;
                hf.deleteFile(eventsDir + dId);
                console.log("Delete Event", dId);
                res.status(200).send('OK');
                break;
        }
    });


app.listen(8000, () => {
    console.log('Server started!');
});
