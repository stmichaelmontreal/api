// // During the test the env variable is set to test
// process.env.NODE_ENV = 'test'
//
// const path = require('path')
// const db = require('../db')
// const rxO = require('rxjs/operators')
// const uuidV4 = require('uuid/v4');
//
// // Require the test-dependencies
// const chai = require('chai');
// const should = chai.should();
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
//     "description": "This description will be used for search test.",
//     "count": 2
// };
// const testDir = 'test';
// let id = uuidV4();
// describe('DB TEST', () => {
//
//     describe('WRITE EVENTS', () => {
//         it('ADD', (done) => {
//             const sql = 'INSERT INTO `test`.`tbl_events` (`event_id`, `event_title`, `event_date`, `event_desc`, `event_count`) VALUES (?, ?, ?, ?, ?)'
//             let i;
//             let j = 0;
//             for (i = 0; i < 1001; i++) {
//                 if (i === 500) {
//                     db.query(sql, [id, 'Title SEARCH', '2010-01-01', 'This description will be used for search test.', i]).subscribe()
//                 } else {
//                     db.query(sql, [uuidV4(), test1.title, '2010-01-01', 'This description will be used for search test.', i]).subscribe(() => {
//                             j++
//                             if (j === 1000) {
//                                 done()
//                             }
//                         }
//                     )
//                 }
//             }
//         });
//         it('WHERE str_equal', (done) => {
//             //db.query("SELECT * FROM test.tbl_events WHERE event_id = ?", ['0244bfb9-9e3b-443c-9142-2856c35ffa39'])
//             db.query("SELECT * FROM test.tbl_events WHERE event_title like ?", ['%SEARCH'])
//                 .subscribe(data => {
//                     console.log('SELECT', data)
//                     done()
//                 });
//         });
//         it('DELETE Files', (done) => {
//             db.query("DELETE FROM test.tbl_events", [])
//                 .subscribe(data => {
//                     console.log('SELECT', data)
//                     done()
//                 });
//         });
//     });
//
// });
//
// // data.should.be.a('array');
// // data.length.should.be.eq(1);
// // data[0].should.have.property('id');
