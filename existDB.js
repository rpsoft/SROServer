'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.testExist = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var testExist = exports.testExist = function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(query) {
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        query = 'xquery version "3.0";' + 'declare default element namespace "http://www.tei-c.org/ns/1.0";' + 'declare namespace tei="http://www.tei-c.org/ns/1.0";' + '<entries>' + '{' + 'for $hit in collection("/db/SRO")//tei:div[ft:query(., "' + query + '")]' + 'let $score as xs:float := ft:score($hit)' + ' where $hit/@type="entry"' + ' order by $score descending' + ' return <entry><docid>{data($hit/@xml:id)}</docid><score>{data($score)}</score>{$hit}</entry>' + '}' + '</entries>';
                        return _context.abrupt('return', new _promise2.default(function (Resolve, Reject) {

                            try {
                                db.query(query).then(function (result) {
                                    //console.log('xQuery result:', result);
                                    Resolve(result);
                                });
                            } catch (error) {
                                Reject("Something failed in the ExistDB Module: " + error);
                            }
                        }));

                    case 2:
                    case 'end':
                        return _context.stop();
                }
            }
        }, _callee, this);
    }));

    return function testExist(_x) {
        return _ref.apply(this, arguments);
    };
}();

// USAGE EXAMPLE OF THE EASY-EXIST MODULE

// PUT a document
// db.put('/my-collection/my-document', body)
//
//     // Get the body of a document
//     .then(function() {
//         return db.get('/my-collection/my-document');
//     })
//     .then(function(doc) {
//         console.log('Document Body:', doc);
//     })
//
//     // Execute xQuery
//     .then(function() {
//         return db.query('collection("my-collection")/message/body');
//     })
//     .then(function(result) {
//         console.log('xQuery result:', result);
//     })
//
//     // Delete document
//     .then(function() {
//         return db.delete('/my-collection/my-document');
//     })
//     .then(function() {
//         console.log('Document Deleted');
//     });
//


var _config = require('./config');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var exist = require('easy-exist');

// connect
var db = new exist.DB('http://localhost:8080', {
    username: _config.EDB_LOGIN.username,
    password: _config.EDB_LOGIN.password
});
//# sourceMappingURL=existDB.js.map
