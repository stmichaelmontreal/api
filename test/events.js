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
const eventModel = require('../mysql/models/event')

let eventId = undefined

const test_record_1 = {
    "e_id": eventId,
    "e_title": "title test",
    "e_date": "2011-10-30",
    "e_thumbnail": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQoAAAFmCAMAA",
    "e_img": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQoAAAFmCAMAAACiIyT",
    "e_description": "Bla bla bla l dsh fhdfhdghkdfhgkhfdkghdfkhg /n kdfhgkhdf kgjhd fdkghdd 'l'l45"
}

const test_record_2 = {
    "e_id": eventId,
    "e_title": "title test 2",
    "e_date": "2011-12-12",
    "e_description": "222222 222222 222222"
}

describe('EVENTS', () => {

    describe('ADD, UPDATE, DELETE', () => {
        it('ADD', (done) => {
            chai.request(server)
                .post('/api/events')
                .send(test_record_1)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.have.property('e_id')
                    res.body.e_id.length.should.be.equal(36)
                    test_record_1.e_id = res.body.e_id
                    test_record_2.e_id = res.body.e_id
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
                .get('/api/events/one/' + test_record_2.e_id)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.rows.length.should.be.eq(1)
                    res.body.rows[0].should.have.property('e_id').eql(test_record_2.e_id)
                    res.body.rows[0].should.have.property('e_title').eql(test_record_2.e_title)
                    done()
                })
        })
        it('DELETE Event', (done) => {
            chai.request(server)
                .delete('/api/events/' + test_record_2.e_id)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.eql(true)
                    done()
                })
        })
    })

    describe('ADD, UPDATE, DELETE', () => {
        let listI = []
        let listD = []
        before((done) => {
            for (let i = 0; i < 20; i++) {
                const ev = new eventModel.Event(test_record_1)
                ev.e_id = uuidV4()
                ev.e_img = ev.e_id
                ev.e_thumbnail = ev.e_id
                listI.push(ev.add())
                listD.push(ev.deleteOne())
            }
            let j = 0
            rx.concat(listI).pipe(
                rxO.concatAll()
            ).subscribe(() => {
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
