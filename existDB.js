'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.getAllEntriesPaged = exports.getAllEntries = exports.getAllPeople = exports.getAllEntriesOrdered = exports.textSearch = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var textSearch = exports.textSearch = function () {
    var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee(query) {
        return _regenerator2.default.wrap(function _callee$(_context) {
            while (1) {
                switch (_context.prev = _context.next) {
                    case 0:
                        query = 'xquery version "3.1"; declare default element namespace "http://www.tei-c.org/ns/1.0"; declare namespace tei="http://www.tei-c.org/ns/1.0"; declare namespace array="http://www.w3.org/2005/xpath-functions/array"; let $pageLimit as xs:decimal := 20 let $page as xs:decimal := 30 let $allResults := array { for $coll in collection("/db/SRO/docs")//tei:div[ft:query(., "' + query + '")] let $hits := $coll//tei:div[@type="entry"] return $hits} let $resultsCount as xs:decimal := array:size($allResults) let $maxpage as xs:double := math-ext:ceil($resultsCount div $pageLimit) let $firstEntry := if ( $page > $maxpage ) then ($maxpage * $pageLimit) - ($pageLimit - 1) else ($page * $pageLimit) - ($pageLimit - 1) let $offset := if ( ($firstEntry + $pageLimit) > $resultsCount ) then ($firstEntry + $pageLimit) - $resultsCount else 0 let $pagesToReturn := $pageLimit - $offset return <results> <paging> <current>{$page}</current> <last>{$maxpage}</last> <returned>{$pagesToReturn}</returned> <total>{$resultsCount}</total> </paging> <entries> { for $hit in array:flatten(array:subarray($allResults, $firstEntry, $pagesToReturn)) return <entry> <docid>{data($hit/@xml:id)}</docid> <date>{data($hit//date/@notBefore)}</date> <people>{ for $pers in $hit//persName return <person> <role>{data($pers/@role)}</role> <name> <title> {normalize-space($pers/text()[last()])} </title> <forename>{$pers/forename/text()}</forename> <surname>{$pers/surname/text()}</surname> </name> </person> } </people> <items>{ for $item in $hit/p return <item> { $item } </item> }</items> </entry> } </entries> </results>';
                        //console.log(query);

                        return _context.abrupt('return', new _promise2.default(function (Resolve, Reject) {

                            try {
                                db.query(query, { wrap: "no" }).then(function (result) {
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

    return function textSearch(_x) {
        return _ref.apply(this, arguments);
    };
}();

var getAllEntriesOrdered = exports.getAllEntriesOrdered = function () {
    var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
        var query;
        return _regenerator2.default.wrap(function _callee2$(_context2) {
            while (1) {
                switch (_context2.prev = _context2.next) {
                    case 0:
                        query = 'xquery version "3.0";' + 'declare default element namespace "http://www.tei-c.org/ns/1.0";' + 'declare namespace tei="http://www.tei-c.org/ns/1.0";' + '<entries>' + '{' + ' for $hit in collection("/db/SRO")//tei:div[@type="entry"]' + 'let $score as xs:float := ft:score($hit) where $hit/@type="entry" order by $score descending return <entry> <docid>{data($hit/@xml:id)}</docid> <score>{data($score)}</score> <date>{data($hit//date)}</date> <stationers>{ for $stat in $hit//persName where $stat/@role="stationer" return <name> {string-join( ($stat/forename,$stat/surname), ", ")} </name> } </stationers> <doc>{ for $item in $hit/p return <item>{fn:string-join($item//text()," ")}</item> }</doc> </entry> } </entries>';
                        return _context2.abrupt('return', new _promise2.default(function (Resolve, Reject) {

                            try {
                                db.query(query, { wrap: "no" }).then(function (result) {
                                    //console.log('xQuery result:', result);
                                    Resolve(result);
                                });
                            } catch (error) {
                                Reject("Something failed in the ExistDB Module: " + error);
                            }
                        }));

                    case 2:
                    case 'end':
                        return _context2.stop();
                }
            }
        }, _callee2, this);
    }));

    return function getAllEntriesOrdered() {
        return _ref2.apply(this, arguments);
    };
}();

var getAllPeople = exports.getAllPeople = function () {
    var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
        return _regenerator2.default.wrap(function _callee3$(_context3) {
            while (1) {
                switch (_context3.prev = _context3.next) {
                    case 0:
                        return _context3.abrupt('return', new _promise2.default(function (Resolve, Reject) {
                            try {
                                db.executeStoredQuery("/QS/allPeople.xq").then(function (result) {
                                    //console.log('xQuery result:', result);
                                    Resolve(result);
                                });
                            } catch (error) {
                                Reject("Something failed in the ExistDB Module: " + error);
                            }
                        }));

                    case 1:
                    case 'end':
                        return _context3.stop();
                }
            }
        }, _callee3, this);
    }));

    return function getAllPeople() {
        return _ref3.apply(this, arguments);
    };
}();

var getAllEntries = exports.getAllEntries = function () {
    var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4() {
        return _regenerator2.default.wrap(function _callee4$(_context4) {
            while (1) {
                switch (_context4.prev = _context4.next) {
                    case 0:
                        return _context4.abrupt('return', new _promise2.default(function (Resolve, Reject) {
                            try {
                                db.executeStoredQuery("/QS/allEntries.xq").then(function (result) {
                                    Resolve(result);
                                });
                            } catch (error) {
                                Reject("Something failed in the ExistDB Module: " + error);
                            }
                        }));

                    case 1:
                    case 'end':
                        return _context4.stop();
                }
            }
        }, _callee4, this);
    }));

    return function getAllEntries() {
        return _ref4.apply(this, arguments);
    };
}();

var getAllEntriesPaged = exports.getAllEntriesPaged = function () {
    var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(page, limit) {
        var query;
        return _regenerator2.default.wrap(function _callee5$(_context5) {
            while (1) {
                switch (_context5.prev = _context5.next) {
                    case 0:
                        query = 'xquery version "3.1"; declare default element namespace "http://www.tei-c.org/ns/1.0"; declare namespace tei="http://www.tei-c.org/ns/1.0"; declare namespace array="http://www.w3.org/2005/xpath-functions/array"; let $pageLimit as xs:decimal := ' + limit + ' let $page as xs:decimal := ' + page + ' let $allResults := array { for $coll in collection("/db/SRO/docs") let $hits := $coll//tei:div[@type="entry"] return $hits} let $resultsCount as xs:decimal := array:size($allResults) let $maxpage as xs:double := math-ext:ceil($resultsCount div $pageLimit) let $firstEntry := if ( $page > $maxpage ) then ($maxpage * $pageLimit) - ($pageLimit - 1) else ($page * $pageLimit) - ($pageLimit - 1) let $offset := if ( ($firstEntry + $pageLimit) > $resultsCount ) then ($firstEntry + $pageLimit) - $resultsCount else 0 let $pagesToReturn := $pageLimit - $offset return <results> <paging> <current>{$page}</current> <last>{$maxpage}</last> <returned>{$pagesToReturn}</returned> <total>{$resultsCount}</total> </paging> <entries> { for $hit in array:flatten(array:subarray($allResults, $firstEntry, $pagesToReturn)) return <entry> <docid>{data($hit/@xml:id)}</docid> <date>{data($hit//date/@notBefore)}</date> <people>{ for $pers in $hit//persName return <person> <role>{data($pers/@role)}</role> <name> <title> {normalize-space($pers/text()[last()])} </title> <forename>{$pers/forename/text()}</forename> <surname>{$pers/surname/text()}</surname> </name> </person> } </people> <items>{ for $item in $hit/p return <item> { $item } </item> }</items> </entry> } </entries> </results>';

                        console.log(query);

                        return _context5.abrupt('return', new _promise2.default(function (Resolve, Reject) {

                            try {
                                db.query(query, { wrap: "no" }).then(function (result) {
                                    //console.log('xQuery result:', result);
                                    Resolve(result);
                                });
                            } catch (error) {
                                Reject("Something failed in the ExistDB Module: " + error);
                            }
                        }));

                    case 3:
                    case 'end':
                        return _context5.stop();
                }
            }
        }, _callee5, this);
    }));

    return function getAllEntriesPaged(_x2, _x3) {
        return _ref5.apply(this, arguments);
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
