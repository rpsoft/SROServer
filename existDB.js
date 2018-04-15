'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getAllEntriesPaged = exports.getEntry = exports.getAllEntries = exports.getAllPeople = exports.getAllEntriesOrdered = exports.textSearch = exports.advSearch = undefined;

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var advSearch = exports.advSearch = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(q) {
    var queryString, cachedResult, filters, dateFiltersArray, volumeFiltersArray, entryTypeFiltersArray, entererRoleFiltersArray, f, filterKey, filterValue, minDate, maxDate, dateFiltersString, volumeFilterString, entryTypeFilterString, entererRoleFilterString, query, post_query;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            //  args, page, limit, orderField, direction

            // Caching system
            queryString = (0, _stringify2.default)(q);
            cachedResult = simpleSearchCache[queryString];

            if (!cachedResult) {
              _context.next = 5;
              break;
            }

            console.log("USING CACHED search for: " + queryString);
            return _context.abrupt('return', cachedResult);

          case 5:
            // End caching system.

            filters = eval(q.filters);


            console.log(filters);
            //{"query":"william","person":"gfdgfd","copies":"fsdfds","minDate":"-14999130000000","maxDate":"1000335600000","minFees":"32","maxFees":"32","entry":"fdsafdsarew","page":"1","limit":"20","sortField":"@xml:id","direction":"ascending"}

            dateFiltersArray = [];
            volumeFiltersArray = [];
            entryTypeFiltersArray = [];
            entererRoleFiltersArray = [];
            _context.t0 = _regenerator2.default.keys(filters);

          case 12:
            if ((_context.t1 = _context.t0()).done) {
              _context.next = 48;
              break;
            }

            f = _context.t1.value;
            filterKey = filters[f].split("_")[0];
            filterValue = filters[f].split("_")[1];
            _context.t2 = filterKey;
            _context.next = _context.t2 === "date" ? 19 : _context.t2 === "volume" ? 23 : _context.t2 === "entryType" ? 32 : _context.t2 === "entererRole" ? 39 : 46;
            break;

          case 19:
            minDate = filterValue.split("-")[0] + "-01-01";
            maxDate = filterValue.split("-")[1] + "-12-31";


            dateFiltersArray.push("($currentDate >= xs:date('" + minDate + "') and $currentDate <= xs:date('" + maxDate + "'))");
            return _context.abrupt('break', 46);

          case 23:
            _context.t3 = filterValue;
            _context.next = _context.t3 === "A" ? 26 : _context.t3 === "B" ? 28 : _context.t3 === "C" ? 30 : 32;
            break;

          case 26:
            volumeFiltersArray.push("($hit//idno[@type='SRONumber'] < 1265)");
            return _context.abrupt('break', 32);

          case 28:
            volumeFiltersArray.push("(($hit//idno[@type='SRONumber'] > 1264) and ($hit//idno[@type='SRONumber'] < 3635))");
            return _context.abrupt('break', 32);

          case 30:
            volumeFiltersArray.push("($hit//idno[@type='SRONumber'] > 3634)");
            return _context.abrupt('break', 32);

          case 32:
            _context.t4 = filterValue;
            _context.next = _context.t4 === "Entered" ? 35 : _context.t4 === "Stock" ? 37 : 39;
            break;

          case 35:
            entryTypeFiltersArray.push("($enteredNotes > 0)");
            return _context.abrupt('break', 39);

          case 37:
            entryTypeFiltersArray.push("($stockNotes > 0)");
            return _context.abrupt('break', 39);

          case 39:
            _context.t5 = filterValue;
            _context.next = _context.t5 === "Stationer" ? 42 : _context.t5 === "Non-Stationer" ? 44 : 46;
            break;

          case 42:
            entererRoleFiltersArray.push("$isStationer");
            return _context.abrupt('break', 46);

          case 44:
            entererRoleFiltersArray.push("not($isStationer )");
            return _context.abrupt('break', 46);

          case 46:
            _context.next = 12;
            break;

          case 48:

            // console.log(dateFiltersArray.join(" or "))
            dateFiltersString = mergeFilter(dateFiltersArray);
            volumeFilterString = mergeFilter(volumeFiltersArray);
            entryTypeFilterString = mergeFilter(entryTypeFiltersArray);
            entererRoleFilterString = mergeFilter(entererRoleFiltersArray);

            // console.log("DDDA: "+dateFiltersString)
            // console.log("DDDASS: "+JSON.stringify(dateFiltersArray))
            // console.log("Q::: "+JSON.stringify(q))

            query = 'xquery version "3.1"; declare default element namespace "http://www.tei-c.org/ns/1.0"; declare namespace tei="http://www.tei-c.org/ns/1.0"; declare namespace array="http://www.w3.org/2005/xpath-functions/array"; declare function local:filter($node as node(), $mode as xs:string) as xs:string? { if ($mode eq "before") then concat($node, " ") else concat(" ", $node) }; import module namespace kwic="http://exist-db.org/xquery/kwic";' + ' let $pageLimit as xs:decimal := ' + q.limit + ' let $page as xs:decimal := ' + q.page + ' let $allResults := array { for $hit in collection("/db/SRO")//tei:div' + (q.query ? "[ft:query(., '" + q.query + "')]" : '') + ' let $score as xs:float := ft:score($hit) let $currentDate as xs:date := xs:date( data($hit//ab[@type="metadata"]/date[@type="SortDate"]/@when) ) ' + ' let $stockNotes := count($hit//note[@subtype="stock"]) let $enteredNotes := count($hit//note[@subtype="entered"])' + ' let $isStationer := contains(data($hit//persName[contains(@role, "enterer")]/@role),"stationer")' + ' let $people := for $pers in $hit//persName return <person> <role>{data($pers/@role)}</role> <name> <title> {normalize-space($pers/text()[last()])} </title> <forename>{$pers/forename/text()}</forename> <surname>{$pers/surname/text()}</surname> </name> </person> where $hit/@type="entry" '

            //personName
            //+ (q.person ? ' and contains(lower-case(string-join($people//text(),"")), "'+q.person.toLowerCase()+'")' : '')

            + (q.person ? q.person.split(" ").map(function (v, i) {
              return v ? ' and (index-of($people/descendant::*/lower-case(text()),"' + v.toLowerCase() + '") > 0) ' : "";
            }).join("") : '')

            //copies
            + entererRoleFilterString + entryTypeFilterString + volumeFilterString

            //minDate & maxDate
            + (q.minDate ? " and ($currentDate >= xs:date('" + q.minDate + "') )" : "") + (q.maxDate ? " and ($currentDate <= xs:date('" + q.maxDate + "') )" : "")

            //minDate & maxDate : from filters
            + dateFiltersString

            //minFees
            + (q.minFees ? ' and data($hit//num[@type="totalPence"]/@value) >= ' + q.minFees + ' ' : '')
            //maxFees
            + (q.maxFees ? ' and data($hit//num[@type="totalPence"]/@value) <= ' + q.maxFees + ' ' : '')

            //entry
            + (q.entry ? ' and $hit//idno[@type="SRONumber"] = "' + q.entry + '"' : '');
            // FILTERS


            post_query = '  let $expanded := kwic:expand($hit) let $sum := array { for $h in $expanded//exist:match return kwic:get-summary($expanded, $h, <config xmlns="" width="40"/>) } return <entry> <people>{$people}</people> <date>{ $currentDate }</date> <docid>{data($hit//@xml:id)}</docid> <doc>{$hit}</doc> <sum>{$sum}</sum> </entry> } let $page := if( $page < 1 ) then 1 else $page let $resultsCount as xs:decimal := array:size($allResults) let $firstEntry := (($page - 1)*$pageLimit)+1 let $firstEntry := if( $firstEntry > $resultsCount) then ( if ( ($resultsCount - $pageLimit) < 0) then 1 else $resultsCount - $pageLimit ) else $firstEntry let $maxpage as xs:double := math-ext:ceil($resultsCount div $pageLimit) let $pagesToReturn := if( ($firstEntry + $pageLimit) > $resultsCount ) then ( $pageLimit - ( $firstEntry + $pageLimit -$resultsCount )+1 ) else $pageLimit return <results> <paging> <current>{$page}</current> <returned>{$pagesToReturn}</returned> <total>{$resultsCount}</total> <last>{$maxpage}</last> </paging> <entries>{array:flatten(array:subarray($allResults, $firstEntry, $pagesToReturn))}</entries> </results> ';

            //query = query + ' and contains($people//role/text(), "enterer") '

            if (q.sortField) {
              query = query + ' order by ' + translateOrderingField(q.sortField).trim() + ' ' + q.direction + ' ';
            } else {
              query = query + ' order by $score descending ';
            }

            query = query + post_query;


            console.log(query);

            return _context.abrupt('return', new _promise2.default(function (Resolve, Reject) {

              try {
                db.query(query, { wrap: "no" }).then(function (result) {
                  //  console.log('xQuery result:', result);

                  try {
                    // very crude implementation of a cache. to speed up repeating searches.

                    if (cachedQueries.length > maxCacheElements) {
                      delete simpleSearchCache[cachedQueries.shift()];
                    }

                    simpleSearchCache[queryString] = result;
                    cachedQueries.push(queryString);
                  } catch (cacheError) {
                    console.log(cacheError);
                  }

                  Resolve(result);
                });
              } catch (error) {
                Reject("Something failed in the ExistDB Module: " + error);
              }
            }));

          case 58:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function advSearch(_x) {
    return _ref.apply(this, arguments);
  };
}();

var textSearch = exports.textSearch = function () {
  var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(query, page, limit, orderField, direction) {
    var post_query;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            query = 'xquery version "3.1"; import module namespace kwic="http://exist-db.org/xquery/kwic"; declare default element namespace "http://www.tei-c.org/ns/1.0"; declare namespace tei="http://www.tei-c.org/ns/1.0"; declare namespace array="http://www.w3.org/2005/xpath-functions/array"; let $pageLimit as xs:decimal := ' + limit + ' let $page as xs:decimal := ' + page + ' ' + 'let $allResults := array { for $hit in collection("/db/SRO")//tei:div[ft:query(., "' + query + '")]' + ' let $score as xs:float := ft:score($hit) where $hit/@type="entry"';
            post_query = ' let $sum := kwic:summarize($hit, <config xmlns="" width="100"/>) return <comp><doc>{$hit}</doc><sum>{$sum}</sum></comp> } ' + ' let $resultsCount as xs:decimal := array:size($allResults) let $maxpage as xs:double := math-ext:ceil($resultsCount div $pageLimit) let $firstEntry := if ( $page > $maxpage ) then ($maxpage * $pageLimit) - ($pageLimit - 1) else ($page * $pageLimit) - ($pageLimit - 1) let $offset := if ( ($firstEntry + $pageLimit) > $resultsCount ) then ($firstEntry + $pageLimit) - $resultsCount else 0 let $pagesToReturn := $pageLimit - $offset return <results> <paging> <current>{$page}</current> <last>{$maxpage}</last> <returned>{$pagesToReturn}</returned> <total>{$resultsCount}</total> </paging> <entries> { for $hita in array:flatten(array:subarray($allResults, $firstEntry, $pagesToReturn)) let $hit := $hita/doc return <entry> <docid>{data($hit//@xml:id)}</docid> <date>{ if (data($hit//ab[@type="metadata"]/date/@when)) then data($hit//ab[@type="metadata"]/date/@when) else data($hit//ab[@type="metadata"]/date/@notBefore) }</date> <people>{ for $pers in $hit//persName return <person> <role>{data($pers/@role)}</role> <name> <title> {normalize-space($pers/text()[last()])} </title> <forename>{$pers/forename/text()}</forename> <surname>{$pers/surname/text()}</surname> </name> </person> } </people> {$hit} {$hita/sum} </entry> } </entries> </results> ';


            if (orderField) {
              query = query + ' order by $hit//' + orderField.trim() + ' ' + direction + ' ';
            } else {
              query = query + ' order by $score descending ';
            }

            query = query + post_query;


            console.log(query);

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

          case 6:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function textSearch(_x2, _x3, _x4, _x5, _x6) {
    return _ref2.apply(this, arguments);
  };
}();

var getAllEntriesOrdered = exports.getAllEntriesOrdered = function () {
  var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
    var query;
    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            query = 'xquery version "3.0";' + 'declare default element namespace "http://www.tei-c.org/ns/1.0";' + 'declare namespace tei="http://www.tei-c.org/ns/1.0";' + '<entries>' + '{' + ' for $hit in collection("/db/SRO")//tei:div[@type="entry"]' + 'let $score as xs:float := ft:score($hit) where $hit/@type="entry" order by $score descending return <entry> <docid>{data($hit/@xml:id)}</docid> <score>{data($score)}</score> <date>{ if (data($hit//ab[@type="metadata"]/date/@when)) then data($hit//ab[@type="metadata"]/date/@when) else data($hit//ab[@type="metadata"]/date/@notBefore) }</date> <stationers>{ for $stat in $hit//persName where $stat/@role="stationer" return <name> {string-join( ($stat/forename,$stat/surname), ", ")} </name> } </stationers> <doc>{ for $item in $hit/p return <item>{fn:string-join($item//text()," ")}</item> }</doc> </entry> } </entries>';
            return _context3.abrupt('return', new _promise2.default(function (Resolve, Reject) {

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
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  return function getAllEntriesOrdered() {
    return _ref3.apply(this, arguments);
  };
}();

var getAllPeople = exports.getAllPeople = function () {
  var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4() {
    return _regenerator2.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            return _context4.abrupt('return', new _promise2.default(function (Resolve, Reject) {
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
            return _context4.stop();
        }
      }
    }, _callee4, this);
  }));

  return function getAllPeople() {
    return _ref4.apply(this, arguments);
  };
}();

var getAllEntries = exports.getAllEntries = function () {
  var _ref5 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee5() {
    return _regenerator2.default.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            return _context5.abrupt('return', new _promise2.default(function (Resolve, Reject) {
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
            return _context5.stop();
        }
      }
    }, _callee5, this);
  }));

  return function getAllEntries() {
    return _ref5.apply(this, arguments);
  };
}();

var getEntry = exports.getEntry = function () {
  var _ref6 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee6(entryID) {
    var query;
    return _regenerator2.default.wrap(function _callee6$(_context6) {
      while (1) {
        switch (_context6.prev = _context6.next) {
          case 0:
            query = 'xquery version "3.1"; declare default element namespace "http://www.tei-c.org/ns/1.0"; declare namespace tei="http://www.tei-c.org/ns/1.0"; for $coll in collection("/db/SRO") for $hit in $coll//tei:div[@type="entry"] where $hit/@xml:id = "' + entryID + '" return $hit';

            console.log(query);

            return _context6.abrupt('return', new _promise2.default(function (Resolve, Reject) {

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
            return _context6.stop();
        }
      }
    }, _callee6, this);
  }));

  return function getEntry(_x7) {
    return _ref6.apply(this, arguments);
  };
}();

var getAllEntriesPaged = exports.getAllEntriesPaged = function () {
  var _ref7 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee7(page, limit) {
    var query;
    return _regenerator2.default.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            query = 'xquery version "3.1"; declare default element namespace "http://www.tei-c.org/ns/1.0"; declare namespace tei="http://www.tei-c.org/ns/1.0"; declare namespace array="http://www.w3.org/2005/xpath-functions/array"; let $pageLimit as xs:decimal := ' + limit + ' let $page as xs:decimal := ' + page + ' let $allResults := array { for $hit in collection("/db/SRO")//tei:div where $hit/@type="entry" return <comp><doc>{$hit}</doc></comp> } let $resultsCount as xs:decimal := array:size($allResults) let $maxpage as xs:double := math-ext:ceil($resultsCount div $pageLimit) let $firstEntry := if ( $page > $maxpage ) then ($maxpage * $pageLimit) - ($pageLimit - 1) else ($page * $pageLimit) - ($pageLimit - 1) let $offset := if ( ($firstEntry + $pageLimit) > $resultsCount ) then ($firstEntry + $pageLimit) - $resultsCount else 0 let $pagesToReturn := $pageLimit - $offset return <results> <paging> <current>{$page}</current> <last>{$maxpage}</last> <returned>{$pagesToReturn}</returned> <total>{$resultsCount}</total> </paging> <entries> { for $hita in array:flatten(array:subarray($allResults, $firstEntry, $pagesToReturn)) let $hit := $hita/doc return <entry> <docid>{data($hit//@xml:id)}</docid> <date>{ if (data($hit//ab[@type="metadata"]/date/@when)) then data($hit//ab[@type="metadata"]/date/@when) else data($hit//ab[@type="metadata"]/date/@notBefore) }</date> <people>{ for $pers in $hit//persName return <person> <role>{data($pers/@role)}</role> <name> <title> {normalize-space($pers/text()[last()])} </title> <forename>{$pers/forename/text()}</forename> <surname>{$pers/surname/text()}</surname> </name> </person> } </people> {$hit} </entry> } </entries> </results>';


            console.log(query);

            return _context7.abrupt('return', new _promise2.default(function (Resolve, Reject) {

              try {
                db.query(query, { wrap: "no" }).then(function (result) {
                  //console.log('xQuery result:', result);
                  Resolve(result);
                }).catch(function (rejected) {
                  console.log(rejected);
                });
              } catch (error) {
                Reject("Something failed in the ExistDB Module: " + error);
              }
            }));

          case 3:
          case 'end':
            return _context7.stop();
        }
      }
    }, _callee7, this);
  }));

  return function getAllEntriesPaged(_x8, _x9) {
    return _ref7.apply(this, arguments);
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

//WASUsPS


var _config = require('./config');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var exist = require('easy-exist');

var simpleSearchCache = {};
var cachedQueries = [];
var maxCacheElements = 40;

// connect
var db = new exist.DB('http://localhost:8080', {
  username: _config.EDB_LOGIN.username,
  password: _config.EDB_LOGIN.password
});

function translateOrderingField(sortField) {
  var xmlField = "";

  switch (sortField) {
    case 'id':
      // console.log("USE EL ID");
      xmlField = '$hit//@xml:id';
      break;
    case 'date':
      // console.log("USE EL DATE");
      xmlField = 'xs:decimal($hit//idno[@type="SRONumber"])';
      break;
    default:
      // console.log("USE EL DEFAULT");
      xmlField = '$hit//@xml:id';
  }
  return xmlField;
}

function mergeFilter(filterArray) {
  var filterString = "";
  if (filterArray.length > 0) {

    filterString = "and ( " + filterArray.join(" or ") + " ) ";
  }
  return filterString;
}
//# sourceMappingURL=existDB.js.map
