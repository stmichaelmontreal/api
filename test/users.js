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
const userModel = require('../mysql/models/users')

const test_record_1 = new userModel.User()
test_record_1.login = 'test'
test_record_1.password = '1'
test_record_1.email = 'test@email.com'

const test_record_2 = new userModel.User()
test_record_2.login = 'test2'
test_record_2.password = '2'
test_record_2.email = 'test2@email.com'

describe('USERS', () => {

    after((done) => rx.concat([test_record_1.deleteOne()])
        .pipe(rxO.concatAll())
        .subscribe(() => done()))

    it('ADD', (done) => {
        chai.request(server)
            .post('/api/users/add')
            .send(test_record_1)
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.have.property('id')
                res.body.id.length.should.be.equal(36)
                test_record_1.id = res.body.id
                done()
            })
    })

    it('SELECT ALL', (done) => {
        chai.request(server)
            .get('/api/users/all')
            .end((err, res) => {
                res.should.have.status(200)
                res.body.rows.length.should.be.at.least(1)
                done()
            })
    })

    it('SELECT ONE', (done) => {
        chai.request(server)
            .get('/api/users/one/' + test_record_1.id)
            .end((err, res) => {
                res.should.have.status(200)
                res.body.rows.length.should.be.eq(1)
                res.body.rows[0].should.have.property('id').eql(test_record_1.id)
                done()
            })
    })

})
