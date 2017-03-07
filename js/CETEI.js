'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _create = require('babel-runtime/core-js/object/create');

var _create2 = _interopRequireDefault(_create);

var _set = require('babel-runtime/core-js/set');

var _set2 = _interopRequireDefault(_set);

var _from = require('babel-runtime/core-js/array/from');

var _from2 = _interopRequireDefault(_from);

var _getIterator2 = require('babel-runtime/core-js/get-iterator');

var _getIterator3 = _interopRequireDefault(_getIterator2);

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _classCallCheck2 = require('babel-runtime/helpers/classCallCheck');

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require('babel-runtime/helpers/createClass');

var _createClass3 = _interopRequireDefault(_createClass2);

var _behaviors = require('./behaviors');

var _behaviors2 = _interopRequireDefault(_behaviors);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var CETEI = function () {
  function CETEI(base) {
    (0, _classCallCheck3.default)(this, CETEI);

    this.els = [];
    this.behaviors = [];
    this.hasStyle = false;
    this.prefixes = [];
    if (base) {
      this.base = base;
    } else {
      this.base = window.location.href.replace(/\/[^\/]*$/, "/");
    }
    this.behaviors.push(_behaviors2.default);
  }

  // public method
  /* Returns a Promise that fetches a TEI source document from the URL
     provided in the first parameter and then calls the makeHTML5 method
     on the returned document.
   */


  (0, _createClass3.default)(CETEI, [{
    key: 'getHTML5',
    value: function getHTML5(TEI_url, callback) {
      var _this = this;

      // Get TEI from TEI_url and create a promise
      var promise = new _promise2.default(function (resolve, reject) {
        var client = new XMLHttpRequest();

        client.open('GET', TEI_url);
        client.send();

        client.onload = function () {
          if (this.status >= 200 && this.status < 300) {
            resolve(this.response);
          } else {
            reject(this.statusText);
          }
        };
        client.onerror = function () {
          reject(this.statusText);
        };
      }).then(function (TEI) {
        _this.makeHTML5(TEI, callback);
      }).catch(function (reason) {
        // TODO: better error handling?
        console.log(reason);
      });

      return promise;
    }

    /* Converts the supplied TEI string into HTML5 Custom Elements. If a callback
       function is supplied, calls it on the result.
     */

  }, {
    key: 'makeHTML5',
    value: function makeHTML5(TEI, callback) {
      var _this2 = this;

      // TEI is assumed to be a string
      var TEI_dom = new window.DOMParser().parseFromString(TEI, "text/xml");

      this._fromTEI(TEI_dom);

      var convertEl = function convertEl(el) {
        // Create new element. TEI elements get prefixed with 'tei-',
        // TEI example elements with 'teieg-'. All others keep
        // their namespaces and are copied as-is.
        var newElement = void 0;
        var copy = false;
        switch (el.namespaceURI) {
          case "http://www.tei-c.org/ns/1.0":
            newElement = document.createElement("tei-" + el.tagName);
            break;
          case "http://www.tei-c.org/ns/Examples":
            if (el.tagName == "egXML") {
              newElement = document.createElement("teieg-" + el.tagName);
              break;
            }
          default:
            newElement = document.importNode(el, false);
            copy = true;
        }
        // Copy attributes; @xmlns, @xml:id, @xml:lang, and
        // @rendition get special handling.
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = (0, _getIterator3.default)((0, _from2.default)(el.attributes)), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var att = _step.value;

            if (att.name != "xmlns" || copy) {
              newElement.setAttribute(att.name, att.value);
            } else {
              newElement.setAttribute("data-xmlns", att.value); //Strip default namespaces, but hang on to the values
            }
            if (att.name == "xml:id" && !copy) {
              newElement.setAttribute("id", att.value);
            }
            if (att.name == "xml:lang" && !copy) {
              newElement.setAttribute("lang", att.value);
            }
            if (att.name == "rendition") {
              newElement.setAttribute("class", att.value.replace(/#/g, ""));
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = (0, _getIterator3.default)((0, _from2.default)(el.childNodes)), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var _node = _step2.value;

            if (_node.nodeType == Node.ELEMENT_NODE) {
              newElement.appendChild(convertEl(_node));
            } else {
              newElement.appendChild(_node.cloneNode());
            }
          }
          // Turn <rendition scheme="css"> elements into HTML styles
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }

        if (el.localName == "tagsDecl") {
          var style = document.createElement("style");
          var _iteratorNormalCompletion3 = true;
          var _didIteratorError3 = false;
          var _iteratorError3 = undefined;

          try {
            for (var _iterator3 = (0, _getIterator3.default)((0, _from2.default)(el.childNodes)), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
              var node = _step3.value;

              if (node.nodeType == Node.ELEMENT_NODE && node.localName == "rendition" && node.getAttribute("scheme") == "css") {
                var rule = "";
                if (node.hasAttribute("selector")) {
                  //rewrite element names in selectors
                  rule += node.getAttribute("selector").replace(/([^#, >]+\w*)/g, "tei-$1").replace(/#tei-/g, "#") + "{\n";
                  rule += node.textContent;
                } else {
                  rule += "." + node.getAttribute("xml:id") + "{\n";
                  rule += node.textContent;
                }
                rule += "\n}\n";
                style.appendChild(document.createTextNode(rule));
              }
            }
          } catch (err) {
            _didIteratorError3 = true;
            _iteratorError3 = err;
          } finally {
            try {
              if (!_iteratorNormalCompletion3 && _iterator3.return) {
                _iterator3.return();
              }
            } finally {
              if (_didIteratorError3) {
                throw _iteratorError3;
              }
            }
          }

          if (style.childNodes.length > 0) {
            newElement.appendChild(style);
            _this2.hasStyle = true;
          }
        }
        // Get prefix definitions
        if (el.localName == "prefixDef") {
          _this2.prefixes.push(el.getAttribute("ident"));
          _this2.prefixes[el.getAttribute("ident")] = { "matchPattern": el.getAttribute("matchPattern"),
            "replacementPattern": el.getAttribute("replacementPattern") };
        }
        return newElement;
      };

      this.dom = convertEl(TEI_dom.documentElement);

      if (document.registerElement) {
        this.registerAll(this.els);
      } else {
        this.fallback(this.els);
      }

      if (callback) {
        callback(this.dom, this);
      } else {
        return this.dom;
      }
    }

    /* If the TEI document defines CSS styles in its tagsDecl, this method
       copies them into the wrapper HTML document's head.
     */

  }, {
    key: 'addStyle',
    value: function addStyle(doc, data) {
      if (this.hasStyle) {
        doc.getElementsByTagName("head").item(0).appendChild(data.getElementsByTagName("style").item(0).cloneNode(true));
      }
    }

    /* Add a user-defined set of behaviors to CETEIcean's processing
       workflow. Added behaviors will override predefined behaviors with the
       same name.
    */

  }, {
    key: 'addBehaviors',
    value: function addBehaviors(bhvs) {
      if (bhvs["handlers"] || bhvs["fallbacks"]) {
        this.behaviors.push(bhvs);
      } else {
        console.log("No handlers or fallback methods found.");
      }
    }

    /* Sets the base URL for the document. Used to rewrite relative links in the
       XML source (which may be in a completely different location from the HTML
       wrapper).
     */

  }, {
    key: 'setBaseUrl',
    value: function setBaseUrl(base) {
      this.base = base;
    }

    // "private" method

  }, {
    key: '_fromTEI',
    value: function _fromTEI(TEI_dom) {
      var root_el = TEI_dom.documentElement;
      this.els = new _set2.default((0, _from2.default)(root_el.getElementsByTagName("*"), function (x) {
        return x.tagName;
      }));
      this.els.add(root_el.tagName); // Add the root element to the array
    }

    // private method

  }, {
    key: '_insert',
    value: function _insert(elt, strings) {
      if (elt.createShadowRoot) {
        var shadow = elt.createShadowRoot();
        shadow.innerHTML = strings[0] + elt.innerHTML + (strings[1] ? strings[1] : "");
      } else {
        var span = void 0;
        if (strings.length > 1) {
          if (strings[0].includes("<") && strings[1].includes("</")) {
            elt.innerHTML = strings[0] + elt.innerHTML + strings[1];
          } else {
            elt.innerHTML = "<span>" + strings[0] + "</span>" + elt.innerHTML + "<span>" + strings[1] + "</span>";
          }
        } else {
          if (strings[0].includes("<")) {
            elt.innerHTML = strings[0] + elt.innerHTML;
          } else {
            elt.innerHTML = "<span>" + strings[0] + "</span>" + elt.innerHTML;
          }
        }
      }
    }

    // private method

  }, {
    key: '_template',
    value: function _template(str, elt) {
      var result = str;
      if (str.search(/$(\w*)@(\w+)/)) {
        var re = /\$(\w*)@(\w+)/g;
        var replacements = void 0;
        while (replacements = re.exec(str)) {
          if (elt.hasAttribute(replacements[2])) {
            if (replacements[1] && this[replacements[1]]) {
              result = result.replace(replacements[0], this[replacements[1]].call(this, elt.getAttribute(replacements[2])));
            } else {
              result = result.replace(replacements[0], elt.getAttribute(replacements[2]));
            }
          }
        }
      }
      return result;
    }
  }, {
    key: 'tagName',
    value: function tagName(name) {
      if (name == "egXML") {
        return "teieg-" + name;
      } else {
        return "tei-" + name;
      }
    }

    /* Takes a template in the form of an array of 1 or 2 strings and
       returns a closure around a function that can be called as
       a createdCallback or applied to an individual element.
        Called by the getHandler() and
    */

  }, {
    key: 'decorator',
    value: function decorator(strings) {
      return function () {
        var ceteicean = this;
        return function (elt) {
          var copy = [];
          if (this != ceteicean) {
            elt = this;
          }
          for (var i = 0; i < strings.length; i++) {
            copy.push(ceteicean._template(strings[i], elt));
          }
          ceteicean._insert(elt, copy);
        };
      };
    }

    /* Returns the handler function for the given element name
        Called by registerAll().
     */

  }, {
    key: 'getHandler',
    value: function getHandler(fn) {
      for (var i = this.behaviors.length - 1; i >= 0; i--) {
        if (this.behaviors[i]["handlers"][fn]) {
          if (Array.isArray(this.behaviors[i]["handlers"][fn])) {
            return this.decorator(this.behaviors[i]["handlers"][fn]);
          } else {
            return this.behaviors[i]["handlers"][fn];
          }
        }
      }
    }

    /* Returns the fallback function for the given element name.
        Called by fallback().
     */

  }, {
    key: 'getFallback',
    value: function getFallback(fn) {
      for (var i = this.behaviors.length - 1; i >= 0; i--) {
        if (this.behaviors[i]["fallbacks"][fn]) {
          if (Array.isArray(this.behaviors[i]["fallbacks"][fn])) {
            return this.decorator(this.behaviors[i]["fallbacks"][fn]).call(this);
          } else {
            return this.behaviors[i]["fallbacks"][fn];
          }
        } else if (this.behaviors[i]["handlers"][fn] && Array.isArray(this.behaviors[i]["handlers"][fn])) {
          // if there's a handler template, we can construct a fallback function
          return this.decorator(this.behaviors[i]["handlers"][fn]).call(this);
        } else if (this.behaviors[i]["handlers"][fn] && this.behaviors[i]["handlers"][fn].call(this).length == 1) {
          return this.behaviors[i]["handlers"][fn].call(this);
        }
      }
    }

    /* Registers the list of elements provided with the browser.
        Called by makeHTML5(), but can be called independently if, for example,
       you've created Custom Elements via an XSLT transformation instead.
     */

  }, {
    key: 'registerAll',
    value: function registerAll(names) {
      var _iteratorNormalCompletion4 = true;
      var _didIteratorError4 = false;
      var _iteratorError4 = undefined;

      try {
        for (var _iterator4 = (0, _getIterator3.default)(names), _step4; !(_iteratorNormalCompletion4 = (_step4 = _iterator4.next()).done); _iteratorNormalCompletion4 = true) {
          var name = _step4.value;

          var proto = (0, _create2.default)(HTMLElement.prototype);
          var fn = this.getHandler(name);
          if (fn) {
            proto.createdCallback = fn.call(this);
          }
          var prefixedName = this.tagName(name);
          try {
            document.registerElement(prefixedName, { prototype: proto });
          } catch (error) {
            console.log(prefixedName + " couldn't be registered or is already registered.");
            console.log(error);
          }
        }
      } catch (err) {
        _didIteratorError4 = true;
        _iteratorError4 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion4 && _iterator4.return) {
            _iterator4.return();
          }
        } finally {
          if (_didIteratorError4) {
            throw _iteratorError4;
          }
        }
      }
    }

    /* Provides fallback functionality for browsers where Custom Elements
       are not supported.
        Like registerAll(), this is called by makeHTML5(), but can be called
       independently.
    */

  }, {
    key: 'fallback',
    value: function fallback(names) {
      var _iteratorNormalCompletion5 = true;
      var _didIteratorError5 = false;
      var _iteratorError5 = undefined;

      try {
        for (var _iterator5 = (0, _getIterator3.default)(names), _step5; !(_iteratorNormalCompletion5 = (_step5 = _iterator5.next()).done); _iteratorNormalCompletion5 = true) {
          var name = _step5.value;

          var fn = this.getFallback(name);
          if (fn) {
            var _iteratorNormalCompletion6 = true;
            var _didIteratorError6 = false;
            var _iteratorError6 = undefined;

            try {
              for (var _iterator6 = (0, _getIterator3.default)((0, _from2.default)(this.dom.getElementsByTagName(this.tagName(name)))), _step6; !(_iteratorNormalCompletion6 = (_step6 = _iterator6.next()).done); _iteratorNormalCompletion6 = true) {
                var elt = _step6.value;

                fn.call(this, elt);
              }
            } catch (err) {
              _didIteratorError6 = true;
              _iteratorError6 = err;
            } finally {
              try {
                if (!_iteratorNormalCompletion6 && _iterator6.return) {
                  _iterator6.return();
                }
              } finally {
                if (_didIteratorError6) {
                  throw _iteratorError6;
                }
              }
            }
          }
        }
      } catch (err) {
        _didIteratorError5 = true;
        _iteratorError5 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion5 && _iterator5.return) {
            _iterator5.return();
          }
        } finally {
          if (_didIteratorError5) {
            throw _iteratorError5;
          }
        }
      }
    }

    /**********************
     * Utility functions  *
     **********************/

    /* Takes a relative URL and rewrites it based on the base URL of the
       HTML document */

  }, {
    key: 'rw',
    value: function rw(url) {
      if (!url.match(/^(?:http|mailto|file|\/).*$/)) {
        return this.base + url;
      } else {
        return url;
      }
    }

    /* Given a space-separated list of URLs (e.g. in a ref with multiple
       targets), returns just the first one.
     */

  }, {
    key: 'first',
    value: function first(urls) {
      return urls.replace(/ .*$/, "");
    }

    // public method

  }, {
    key: 'fromODD',
    value: function fromODD() {
      // Place holder for ODD-driven setup.
      // For example:
      // Create table of elements from ODD
      //    * default HTML behaviour mapping on/off (eg tei:div to html:div)
      //    ** phrase level elements behave like span (can I tell this from ODD classes?)
      //    * optional custom behaviour mapping
    }
  }]);
  return CETEI;
}();

// Make main class available to pre-ES6 browser environments
// if (window) {
//     window.CETEI = CETEI;
// }


exports.default = CETEI;
//# sourceMappingURL=CETEI.js.map
