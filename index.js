'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

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

var xml2js = require('xml2js');

main();

app.get('/', function (req, res) {
  //console.log("EPALE!"+JSON.stringify(req));
  res.render('index.html', { data: "" });
  //__dirname : It will resolve to your project folder.
});

app.get('/data', function () {
  var _ref2 = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2(req, res) {
    var xmlResult;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            //console.log("EPALE!"+JSON.stringify(req));
            xmlResult = "<div>invalid query</div>";

            if (!req.query.query) {
              _context2.next = 5;
              break;
            }

            _context2.next = 4;
            return EXISTDB.testExist(req.query.query);

          case 4:
            xmlResult = _context2.sent;

          case 5:
            res.send(xmlResult);

            // res.json({"data":"goes in here"});
            //__dirname : It will resolve to your project folder.

          case 6:
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

app.listen(6541, function () {
  console.log('Application Running on port 6541 ' + new Date().toISOString());
});

function getUrl(message) {
  if (message == undefined) {
    return "";
  };
  var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
  var regex = new RegExp(expression);
  var t = message;

  var result = t.match(regex);
  if (result) {
    return result[0].toString();
  } else {
    return "";
  }
}
//# sourceMappingURL=index.js.map
