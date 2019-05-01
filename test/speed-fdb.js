// // During the test the env variable is set to test
// process.env.NODE_ENV = 'test';
//
// require('../loggers');
// // Require the dev-dependencies
// const fdb = require('../fdb-lib/fdb');
// const rx = require('rxjs');
// const rxO = require('rxjs/operators');
//
// // Require the test-dependencies
// const chai = require('chai');
// const should = chai.should();
//
// const uuidV4 = require('uuid/v4');
//
//
// const test1 = {
//     "id": '111a0db0-0e8e-47d9-b3ee-e59b1bc1dbbc',
//     "date": "2010-01-01",
//     "title": "Title which contains 1",
//     "description": "This description will be used for search test.",
//     "count": 1
// };
// const test2 = {
//     "id": '222a0db0-0e8e-47d9-b3ee-e59b1bc1dbbc',
//     "date": "2010-01-10",
//     "title": "Title not to long 2",
//     "description": "This description will be used for search test. 222222222222222222222222222 ",
//     "count": 2
// };
// const test3 = {
//     "id": '333a0db0-0e8e-47d9-b3ee-e59b1bc1dbbc',
//     "date": "2010-01-20",
//     "title": "Title not to long 3",
//     "description": "This description will be used for search test.",
//     "count": 3
// };
// const testDir = 'test';
// let fileID;
//
// describe('FDB SPEED', () => {
//
//     describe('WRITE FILES', () => {
//         it('ID one file', (done) => {
//             let obs = [];
//             let i;
//             for (i = 0; i < 1001; i++) {
//                 if (i === 500) {
//                     fdb.writeFile(testDir, test2.id, JSON.stringify(test2)).subscribe();
//                 } else {
//                     let id = uuidV4();
//                     const data = JSON.stringify(test1);
//                     obs.push(fdb.writeFile(testDir, id, JSON.stringify({
//                         "id": id,
//                         "date": "2010-01-01",
//                         "title": "Title which contains 1",
//                         "description": "This description will be used for search test.",
//                         "count": 1
//                     })));
//                 }
//                 if (i === 1000) {
//                     let j = 0;
//                     rx.concat(obs).pipe(
//                         rxO.concatAll()
//                     ).subscribe((test) => {
//                         j++
//                         if (j === 1000) {
//                             done()
//                         }
//                     });
//                 }
//             }
//
//
//         });
//         it('WHERE str_equal', (done) => {
//             // for filter
//             const filter = {
//                 "where": new fdb.Where('id', 'str_equal', test2.id)
//             };
//             // for ID
//             // const filter = {
//             //     "id": test2.id
//             // };
//             fdb.select(testDir, filter)
//                 .subscribe(data => {
//                     if (data) {
//                         console.log(data);
//                         done()
//                     }
//                 });
//         });
//         it('DELETE Files', (done) => {
//             fdb.readDir(testDir).pipe(
//                 rxO.switchMap(fileName => rx.of(fdb.deleteFile(testDir, fileName.id))),
//                 rxO.concatAll(),
//                 rxO.combineAll()
//             ).subscribe(done());
//         });
//     });
//
// });
//
// // data.should.be.a('array');
// // data.length.should.be.eq(1);
// // data[0].should.have.property('id');
