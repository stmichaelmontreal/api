// During the test the env variable is set to test
process.env.NODE_ENV = 'test'

// Require the dev-dependencies
const chai = require('chai')
const chaiHttp = require('chai-http')
chai.use(chaiHttp)
const should = chai.should()

const rx = require('rxjs')
const rxO = require('rxjs/operators')
const server = require('../server')
const uuidV4 = require('uuid/v4')
const eventModel = require('../mysql/models/events')

let eventId = undefined

const test_record_1 = {
    "id": eventId,
    "title": "title test",
    "event_date": "2011-10-30",
    "thumbnail": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQoAAAFmCAMAA",
    "img": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQoAAAFmCAMAAACiIyT",
    "description": "Bla bla bla l dsh fhdfhdghkdfhgkhfdkghdfkhg /n kdfhgkhdf kgjhd fdkghdd 'l'l45"
}

const test_record_2 = {
    "id": eventId,
    "title": "title test 2",
    "event_date": "2011-12-12",
    "description": "222222 222222 222222"
}

describe('EVENTS', () => {

    describe('ADD, UPDATE, DELETE', () => {
        it('ADD', (done) => {
            chai.request(server)
                .post('/api/events')
                .send(test_record_1)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.have.property('id')
                    res.body.id.length.should.be.equal(36)
                    test_record_1.id = res.body.id
                    test_record_2.id = res.body.id
                    done()
                })
        })
        it('UPDATE', (done) => {
            chai.request(server)
                .put('/api/events/update-text')
                .send(test_record_2)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.eql(true)
                    done()
                })
        })
        it('SELECT ONE AND TEST UPDATE', (done) => {
            chai.request(server)
                .get('/api/events/one/' + test_record_2.id)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.rows.length.should.be.eq(1)
                    res.body.rows[0].should.have.property('id').eql(test_record_2.id)
                    res.body.rows[0].should.have.property('title').eql(test_record_2.title)
                    done()
                })
        })
        it('DELETE Event', (done) => {
            chai.request(server)
                .delete('/api/events/' + test_record_2.id)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.eql(true)
                    done()
                })
        })
    })

    describe('SELECT', () => {
        let listI = []
        let listD = []
        before((done) => {
            for (let i = 0; i < 20; i++) {
                const ev = new eventModel.Event(test_record_1)
                ev.id = uuidV4()
                ev.img = ev.id
                ev.thumbnail = ev.id
                listI.push(ev.add())
                listD.push(ev.deleteOne())
            }
            let j = 0
            rx.concat(listI).pipe(rxO.concatAll())
                .subscribe(() => {
                    j++
                    if (j === 20) {
                        done()
                    }
                })
        })

        after((done) => {
            let j = 0
            rx.concat(listD).pipe(
                rxO.concatAll()
            ).subscribe(() => {
                j++
                if (j === 20) {
                    done()
                }
            })
        })

        it('SELECT LIMIT', (done) => {
            chai.request(server)
                .get('/api/events/limit/5/10')
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.rows.length.should.be.equal(10)
                    done()
                })
        })
    })

})
