// During the test the env variable is set to test
process.env.NODE_ENV = 'test';

// Require the dev-dependencies
const server = require('../server');
const fdb = require('../schema/fdb');
const rxO = require('rxjs/operators');

// Require the test-dependencies
const chai = require('chai');
const should = chai.should();

const test1 = {
    "id": '111a0db0-0e8e-47d9-b3ee-e59b1bc1dbbc',
    "date": "2010-01-01",
    "title": "Title which contains 1",
    "description": "This description will be used for search test.",
    "count": 1
};
const test2 = {
    "id": '222a0db0-0e8e-47d9-b3ee-e59b1bc1dbbc',
    "date": "2010-01-02",
    "title": "Title not to long 2",
    "description": "This description will be used for search test.",
    "count": 2
};
const test3 = {
    "id": '333a0db0-0e8e-47d9-b3ee-e59b1bc1dbbc',
    "date": "2010-01-03",
    "title": "Title not to long 3",
    "description": "This description will be used for search test.",
    "count": 3
};
const testDir = 'test';

describe('FDB TEST', () => {

    before((done) => {
        fdb.writeFile(testDir, test1.id, JSON.stringify(test1)).pipe(
            rxO.switchMap(() => fdb.writeFile(testDir, test2.id, JSON.stringify(test2))),
            rxO.switchMap(() => fdb.writeFile(testDir, test3.id, JSON.stringify(test3)))
        ).subscribe(() => done())
    });

    after((done) => {
        fdb.deleteFile(testDir, test1.id).pipe(
            rxO.switchMap(() => fdb.deleteFile(testDir, test2.id)),
            rxO.switchMap(() => fdb.deleteFile(testDir, test3.id))
        ).subscribe(() => done())
    });

    describe('SELECT TEST', () => {
        it('ID one file', (done) => {
            const filter = {
                id: test1.id
            };
            fdb.selectData(testDir, filter)
                .subscribe(data => {
                    data[0].id.should.have.be.equal(test1.id);
                    done();
                });
        });
        it('WHERE equal STRING', (done) => {
            const filter = {
                "where": new fdb.Where('id', 'equal', test1.id)
            };
            fdb.selectData(testDir, filter)
                .subscribe(data => {
                    data[0].id.should.have.be.equal(test1.id);
                    done();
                });
        });
        it('WHERE equal NUMBER', (done) => {
            const filter = {
                "where": new fdb.Where('count', 'equal', test1.count)
            };
            fdb.selectData(testDir, filter)
                .subscribe(data => {
                    data[0].count.should.have.be.equal(test1.count);
                    done();
                });
        });
        it('WHERE contains STRING', (done) => {
            const filter = {
                "where": new fdb.Where('title', 'contains', 'contains 1')
            };
            fdb.selectData(testDir, filter)
                .subscribe(data => {
                    data[0].id.should.have.be.equal(test1.id);
                    done();
                });
        });
        it('WHERE regex STRING', (done) => {
            const filter = {
                "where": new fdb.Where('id', 'regex', '^111')
            };
            fdb.selectData(testDir, filter)
                .subscribe(data => {
                    data[0].id.should.have.be.equal(test1.id);
                    done();
                });
        });
        it('WHERE greater NUMBER', (done) => {
            const filter = {
                "where": new fdb.Where('count', 'greater', 2)
            };
            fdb.selectData(testDir, filter)
                .subscribe(data => {
                    data[0].id.should.have.be.equal(test3.id);
                    done();
                });
        });


    });

});

// data.should.be.a('array');
// data.length.should.be.eq(1);
// data[0].should.have.property('id');
