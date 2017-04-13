'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

//
// var xs = new XMLSplitter('/exist:result/entries//entry')
//
//     xs.on('data', function(data) {
//         cachedLastQuery.push(data);
//
//     })
//
//
//     xs.on('end', function(counter) {
//         console.log(counter+' slices !') // counts all the slices ever apparently!.
//     })


var main = function () {
  var _ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
          case 'end':
            return _context.stop();
        }
      }
    }, _callee, this);
  }));

  return function main() {
    return _ref.apply(this, arguments);
  };
}();

var _config = require('./config');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var express = require('express');

var app = express();

var html = require("html");

var sync = require('synchronize');

var Promise = require('es6-promise').Promise;
var fs = require('fs');

app.use(express.static(__dirname + '/domainParserviews'));
//Store all HTML files in view folder.
app.use(express.static(__dirname + '/views'));
//Store all JS and CSS in Scripts folder.
app.use(express.static(__dirname + '/dist'));

app.use(express.static(__dirname + '/images'));

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');

var EXISTDB = require("./existDB");

var convert = require('xml-js');

// var XMLSplitter = require('xml-splitter')

// var $$ = require('xml-selector');

var XmlReader = require('xml-reader');
var xmlQuery = require('xml-query');

var cachedLastQuery = [];
main();

app.get('/api/', function (req, res) {
  res.render('index.html', { name: "cucu" });
});

app.get('/api/data', function () {
  var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(req, res) {
    var xmlResult;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            if (!req.query.query) {
              _context2.next = 5;
              break;
            }

            _context2.next = 3;
            return EXISTDB.textSearch(req.query.query);

          case 3:
            xmlResult = _context2.sent;

            res.send(convert.xml2json(xmlResult, { compact: true, spaces: 4 }));

          case 5:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));

  return function (_x, _x2) {
    return _ref2.apply(this, arguments);
  };
}());

app.get('/api/allPeople', function () {
  var _ref3 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3(req, res) {
    var xmlResult;
    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.next = 2;
            return EXISTDB.getAllPeople();

          case 2:
            xmlResult = _context3.sent;

            res.send(convert.xml2json(xmlResult, { compact: true, spaces: 4 }));

          case 4:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this);
  }));

  return function (_x3, _x4) {
    return _ref3.apply(this, arguments);
  };
}());

// app.get('/allEntries',async function(req,res){
//
//
//   var xmlResult = await EXISTDB.getAllEntries()
//
//   const ast = XmlReader.parseSync(xmlResult);
//
//   const xq = xmlQuery(ast);
//
//   //xmlQuery(ast).children().children().each(node => console.log(node.text()));
//   xmlQuery(ast).children().children().each(node => console.log("ENTRY:: "+xmlQuery(node).text()))
//
//
//   // cachedLastQuery =[];
//   // xs.parseString(xmlResult);
//   // cachedLastQuery.map(function (item,i) {
//   //
//   //   console.log(item.div)
//   //
//   // })
//   // console.log(cachedLastQuery)
//
//   res.send(xmlResult)
//
// });

app.get('/api/allEntriesPaged', function () {
  var _ref4 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(req, res) {
    var xmlResult;
    return _regenerator2.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            console.log(req.query.page);

            if (!req.query.page) {
              _context4.next = 6;
              break;
            }

            _context4.next = 4;
            return EXISTDB.getAllEntriesPaged(req.query.page, req.query.limit);

          case 4:
            xmlResult = _context4.sent;

            // console.log(xmlResult)
            res.send(xmlResult);

          case 6:
          case 'end':
            return _context4.stop();
        }
      }
    }, _callee4, this);
  }));

  return function (_x5, _x6) {
    return _ref4.apply(this, arguments);
  };
}());

app.get('/api/allEntries', function () {
  var _ref5 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5(req, res) {
    var xmlResult;
    return _regenerator2.default.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            _context5.next = 2;
            return EXISTDB.getAllEntries();

          case 2:
            xmlResult = _context5.sent;


            // const ast = XmlReader.parseSync(xmlResult);
            //
            // const xq = xmlQuery(ast);
            //
            // //xmlQuery(ast).children().children().each(node => console.log(node.text()));
            // xmlQuery(ast).children().children().each(node => console.log("ENTRY:: "+xmlQuery(node).text()))

            // res.send(convert.xml2json(xmlResult, {compact: true, spaces: 4}))

            res.send(xmlResult);

          case 4:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, this);
  }));

  return function (_x7, _x8) {
    return _ref5.apply(this, arguments);
  };
}());

// app.get('/users/:userId/books/:bookId', function (req, res) {
//   res.send(req.params)
// })

app.listen(6541, function () {
  console.log('Application Running on port 6541 ' + new Date().toISOString());
});

//
// function getUrl(message){
//   if ( message == undefined) {return ""};
//   var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
//   var regex = new RegExp(expression);
//   var t = message;
//
//   var result = t.match(regex);
//   if (result)
//   {
//     return result[0].toString();
//   } else {
//     return "";
//   }
// }
//# sourceMappingURL=index.js.map
