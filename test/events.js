//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();

chai.use(chaiHttp);

//Our parent block
describe('TEST Events', () => {
    // beforeEach((done) => {
    //     // Before each test we empty the database
    // });

    describe('TEST POST /events/select', () => {
        it('TEST it should SELECT all the Events', (done) => {
            const filter = {
                filter: "dates"
            };
            chai.request(server)
                .post('/api/events/select')
                .send(filter)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    res.body.length.should.be.above(1);
                    // res.body.should.be.a('object');
                    // res.body.should.have.property('errors');
                    // res.body.errors.should.have.property('pages');
                    // res.body.errors.pages.should.have.property('kind').eql('required');
                    done();
                });
        });
    });

});
