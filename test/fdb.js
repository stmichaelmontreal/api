// During the test the env variable is set to test
process.env.NODE_ENV = 'test';

require('../loggers');
// Require the dev-dependencies
const fdb = require('../fdb-lib/fdb');
const rx = require('rxjs');
const rxO = require('rxjs/operators');

// Require the test-dependencies
const chai = require('chai');
const should = chai.should();

const uuidV4 = require('uuid/v4');


const test1 = {
    "id": '111a0db0-0e8e-47d9-b3ee-e59b1bc1dbbc',
    "date": "2010-01-01",
    "title": "Title which contains 1",
    "description": "This description will be used for search test.",
    "count": 1
};
const test2 = {
    "id": '222a0db0-0e8e-47d9-b3ee-e59b1bc1dbbc',
    "date": "2010-01-10",
    "title": "Title not to long 2",
    "description": "This description will be used for search test.",
    "count": 2
};
const test3 = {
    "id": '333a0db0-0e8e-47d9-b3ee-e59b1bc1dbbc',
    "date": "2010-01-20",
    "title": "Title not to long 3",
    "description": "This description will be used for search test.",
    "count": 3
};
const testDir = 'test';
let fileID;

describe('FDB TEST', () => {

    before((done) => {
        fdb.writeFile(testDir, test1.id, JSON.stringify(test1)).pipe(
            rxO.switchMap(() => fdb.writeFile(testDir, test2.id, JSON.stringify(test2))),
            rxO.switchMap(() => fdb.writeFile(testDir, test3.id, JSON.stringify(test3)))
        ).subscribe(() => done())
    });

    // after((done) => {
    //     fdb.deleteFile(testDir, test1.id).pipe(
    //         rxO.switchMap(() => fdb.deleteFile(testDir, test2.id)),
    //         rxO.switchMap(() => fdb.deleteFile(testDir, test3.id))
    //     ).subscribe(() => done())
    // });

    describe('SELECT STRING', () => {
        it('ID one file', (done) => {
            const filter = {
                id: test1.id
            };
            fdb.select(testDir, filter)
                .subscribe(data => {
                    data[0].id.should.have.be.equal(test1.id);
                    done();
                });
        });
        it('WHERE str_equal', (done) => {
            const filter = {
                "where": new fdb.Where('id', 'str_equal', test1.id)
            };
            fdb.select(testDir, filter)
                .subscribe(data => {
                    data[0].id.should.have.be.equal(test1.id);
                    done();
                });
        });
        it('WHERE str_contains', (done) => {
            const filter = {
                "where": new fdb.Where('title', 'str_contains', 'contains 1')
            };
            fdb.select(testDir, filter)
                .subscribe(data => {
                    data[0].id.should.have.be.equal(test1.id);
                    done();
                });
        });
        it('WHERE str_regex', (done) => {
            const filter = {
                "where": new fdb.Where('id', 'str_regex', '^111')
            };
            fdb.select(testDir, filter)
                .subscribe(data => {
                    data[0].id.should.have.be.equal(test1.id);
                    done();
                });
        });

    });

    describe('SELECT NUMBER', () => {
        it('WHERE num_equal', (done) => {
            const filter = {
                "where": new fdb.Where('count', 'num_equal', test1.count)
            };
            fdb.select(testDir, filter)
                .subscribe(data => {
                    data[0].count.should.have.be.equal(test1.count);
                    done();
                });
        });
        it('WHERE num_not_equal', (done) => {
            const filter = {
                "where": new fdb.Where('count', 'num_not_equal', test1.count)
            };
            fdb.select(testDir, filter)
                .subscribe(data => {
                    data[0].count.should.have.be.equal(test2.count);
                    data[1].count.should.have.be.equal(test3.count);
                    done();
                });
        });
        it('WHERE num_greater', (done) => {
            const filter = {
                "where": new fdb.Where('count', 'num_greater', 2)
            };
            fdb.select(testDir, filter)
                .subscribe(data => {
                    data[0].id.should.have.be.equal(test3.id);
                    done();
                });
        });
        it('WHERE num_less', (done) => {
            const filter = {
                "where": new fdb.Where('count', 'num_less', 2)
            };
            fdb.select(testDir, filter)
                .subscribe(data => {
                    data[0].id.should.have.be.equal(test1.id);
                    done();
                });
        });


    });

    describe('SELECT DATE', () => {
        it('WHERE date_equal', (done) => {
            const filter = {
                "where": new fdb.Where('date', 'date_equal', test1.date)
            };
            fdb.select(testDir, filter)
                .subscribe(data => {
                    data[0].id.should.have.be.equal(test1.id);
                    done();
                });
        });
        it('WHERE date_before', (done) => {
            const filter = {
                "where": new fdb.Where('date', 'date_before', test2.date)
            };
            fdb.select(testDir, filter)
                .subscribe(data => {
                    data[0].id.should.have.be.equal(test1.id);
                    done();
                });
        });
        it('WHERE date_after', (done) => {
            const filter = {
                "where": new fdb.Where('date', 'date_after', test2.date)
            };
            fdb.select(testDir, filter)
                .subscribe(data => {
                    data[0].id.should.have.be.equal(test3.id);
                    done();
                });
        });
        it('WHERE date_same_or_before', (done) => {
            const filter = {
                "where": new fdb.Where('date', 'date_same_or_before', test2.date)
            };
            fdb.select(testDir, filter)
                .subscribe(data => {
                    data[0].id.should.have.be.equal(test1.id);
                    data[1].id.should.have.be.equal(test2.id);
                    done();
                });
        });
        it('WHERE date_same_or_after', (done) => {
            const filter = {
                "where": new fdb.Where('date', 'date_same_or_after', test2.date)
            };
            fdb.select(testDir, filter)
                .subscribe(data => {
                    data[0].id.should.have.be.equal(test2.id);
                    data[1].id.should.have.be.equal(test3.id);
                    done();
                });
        });
        it('WHERE date_between', (done) => {
            const filter = {
                "where": new fdb.Where('date', 'date_between', {d1: test1.date, d2: test3.date})
            };
            fdb.select(testDir, filter)
                .subscribe(data => {
                    data[0].id.should.have.be.equal(test2.id);
                    done();
                });
        });


    });

    describe('WRITE WILES', () => {
        it('ID one file', (done) => {
            let i;
            let j = 0;
            for (i = 0; i < 50000; i++) {
                if (i === 25000) {
                    fdb.writeFile(testDir, test2.id, JSON.stringify(test2)).subscribe(() => {
                        j++;
                        if (j === 50000) {
                            done();
                        }
                    });
                } else {
                    test1.id = uuidV4();
                    const data = JSON.stringify(test1);
                    fdb.writeFile(testDir, test1.id, data).subscribe(() => {
                        j++;
                        if (j === 50000) {
                            done();
                        }
                    });
                }
            }
        });
        it('WHERE str_equal', (done) => {
            const filter = {
                "where": new fdb.Where('id', 'str_equal', test2.id)
            };
            fdb.select(testDir, filter)
                .subscribe(data => {
                    data[0].id.should.have.be.equal(test2.id);
                    done();
                });
        });
        it('DELETE Files', (done) => {
            fdb.readDir(testDir).pipe(
                rxO.flatMap(fileNames =>
                    rx.forkJoin(fileNames.map(fileName =>
                        fdb.deleteFile(testDir, fileName.id)))),
            ).subscribe(done());
        });
    });

});

// data.should.be.a('array');
// data.length.should.be.eq(1);
// data[0].should.have.property('id');
