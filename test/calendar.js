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
const calendarModel = require('../mysql/models/calendar')

const test_record_1 = new calendarModel.CalendarItem()
test_record_1.calendar_date = '2019-01-01T00:00:00'
test_record_1.description = 'Calendar item'

const test_record_2 = new calendarModel.CalendarItem()
test_record_2.calendar_date = '2019-01-02T00:00:00'
test_record_2.description = 'Calendar item 2'

describe('CALENDAR', () => {

    describe('ADD, UPDATE, DELETE', () => {
        it('ADD', (done) => {
            chai.request(server)
                .post('/api/calendar/add')
                .send(test_record_1)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.have.property('id')
                    res.body.id.length.should.be.equal(36)
                    test_record_1.id = res.body.id
                    // assign id for update test
                    test_record_2.id = res.body.id
                    done()
                })
        })
        it('UPDATE', (done) => {
            chai.request(server)
                .put('/api/calendar/update')
                .send(test_record_2)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.should.eql(true)
                    done()
                })
        })
        it('SELECT ONE AND TEST UPDATE', (done) => {
            chai.request(server)
                .get('/api/calendar/one/' + test_record_2.id)
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.rows.length.should.be.eq(1)
                    res.body.rows[0].should.have.property('id').eql(test_record_2.id)
                    res.body.rows[0].should.have.property('description').eql(test_record_2.description)
                    done()
                })
        })
        it('DELETE', (done) => {
            chai.request(server)
                .delete('/api/calendar/delete/' + test_record_1.id)
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
                const ev = new calendarModel.CalendarItem(test_record_1)
                ev.id = uuidV4()
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
                .get('/api/calendar/limit/5/10')
                .end((err, res) => {
                    res.should.have.status(200)
                    res.body.rows.length.should.be.equal(10)
                    done()
                })
        })
    })

})
