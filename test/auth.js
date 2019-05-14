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
const authModel = require('../mysql/models/auth')
const userModel = require('../mysql/models/users')
const uuidV4 = require('uuid/v4')

const test_record_1 = new authModel.Auth()
test_record_1.login = 'test'
test_record_1.password = '123'
test_record_1.new_password = '111'

const user_record_1 = new userModel.User()

describe('AUTH', () => {

    before((done) => {
        user_record_1.id = uuidV4()
        user_record_1.parent_id = uuidV4()
        user_record_1.login = test_record_1.login
        user_record_1.password = test_record_1.password
        user_record_1.email = 'test@email.com'
        user_record_1.add().subscribe(() => done())
    })

    after((done) => user_record_1.deleteOne().subscribe(() => done()))

    it('AUTH SUCCESS', (done) => {
        chai.request(server)
            .post('/api/auth')
            .send(test_record_1)
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.have.property('auth')
                res.body.auth.should.eql(true)
                done()
            })
    })

    it('AUTH WRONG PASSWORD', (done) => {
        chai.request(server)
            .post('/api/auth')
            .send({login: 'test', password: '111'})
            .end((err, res) => {
                res.should.have.status(401)
                res.body.auth.should.eql(false)
                done()
            })
    })

    it('LOGIN SUCCESS', (done) => {
        chai.request(server)
            .post('/api/login')
            .send({login: test_record_1.login})
            .end((err, res) => {
                res.should.have.status(200)
                res.body.login.should.eql(test_record_1.login)
                done()
            })
    })

    it('LOGIN WRONG USER', (done) => {
        chai.request(server)
            .post('/api/login')
            .send({login: 'blabla'})
            .end((err, res) => {
                res.should.have.status(401)
                res.body.login.should.eql('blabla')
                res.body.error.should.eql('Can\'t find login!')
                done()
            })
    })

    it('RESET PASSWORD', (done) => {
        chai.request(server)
            .put('/api/users/reset-password')
            .send(test_record_1)
            .end((err, res) => {
                res.should.have.status(200)
                res.body.reset.should.eql(true)
                done()
            })
    })

    it('AUTH AFTER RESET', (done) => {
        test_record_1.password = test_record_1.new_password
        chai.request(server)
            .post('/api/auth')
            .send(test_record_1)
            .end((err, res) => {
                res.should.have.status(200)
                res.body.should.have.property('auth')
                res.body.auth.should.eql(true)
                done()
            })
    })

})
