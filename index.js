'use strict';

var _regenerator = require('babel-runtime/regenerator');

var _regenerator2 = _interopRequireDefault(_regenerator);

var _stringify = require('babel-runtime/core-js/json/stringify');

var _stringify2 = _interopRequireDefault(_stringify);

var _asyncToGenerator2 = require('babel-runtime/helpers/asyncToGenerator');

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

var main = function () {
  var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee2() {
    var results;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.next = 2;
            return database.getPosts();

          case 2:
            results = _context2.sent;

            console.log((0, _stringify2.default)(results));
            _context2.next = 6;
            return updateData();

          case 6:
            _context2.next = 8;
            return updateProductData();

          case 8:
            setInterval((0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee() {
              return _regenerator2.default.wrap(function _callee$(_context) {
                while (1) {
                  switch (_context.prev = _context.next) {
                    case 0:
                      _context.prev = 0;

                      console.log("========= Interval: " + intervalCounter++ + " ===========");
                      _context.next = 4;
                      return updateData();

                    case 4:
                      _context.next = 6;
                      return updateProductData();

                    case 6:
                      console.log("Finished interval ");
                      _context.next = 12;
                      break;

                    case 9:
                      _context.prev = 9;
                      _context.t0 = _context['catch'](0);

                      console.log(_context.t0);

                    case 12:
                    case 'end':
                      return _context.stop();
                  }
                }
              }, _callee, this, [[0, 9]]);
            })),
            //Update Torrent Data
            100000);

          case 9:
          case 'end':
            return _context2.stop();
        }
      }
    }, _callee2, this);
  }));
  return function main() {
    return ref.apply(this, arguments);
  };
}();

var updateProductData = function () {
  var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee3() {
    var d, link, t;
    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;

            if (!data) {
              _context3.next = 14;
              break;
            }

            _context3.t0 = _regenerator2.default.keys(data);

          case 3:
            if ((_context3.t1 = _context3.t0()).done) {
              _context3.next = 14;
              break;
            }

            d = _context3.t1.value;
            link = data[d].link;

            if (!link) {
              _context3.next = 12;
              break;
            }

            if (!(!data[d].torrent || data[d].torrent.totalSeeds < 1)) {
              _context3.next = 12;
              break;
            }

            _context3.next = 10;
            return title.getProductInformation(link);

          case 10:
            t = _context3.sent;

            //console.log(t);
            data[d].torrent = t;

          case 12:
            _context3.next = 3;
            break;

          case 14:
            _context3.next = 19;
            break;

          case 16:
            _context3.prev = 16;
            _context3.t2 = _context3['catch'](0);

            console.log(_context3.t2);

          case 19:
          case 'end':
            return _context3.stop();
        }
      }
    }, _callee3, this, [[0, 16]]);
  }));
  return function updateProductData() {
    return ref.apply(this, arguments);
  };
}();

var updateData = function () {
  var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee5() {
    return _regenerator2.default.wrap(function _callee5$(_context5) {
      while (1) {
        switch (_context5.prev = _context5.next) {
          case 0:
            return _context5.abrupt('return', new Promise(function () {
              var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee4(Resolve, Reject) {
                var seeds, twitter_seeds, s, seedAccount, max_id, tweets, newData, query, sortedData;
                return _regenerator2.default.wrap(function _callee4$(_context4) {
                  while (1) {
                    switch (_context4.prev = _context4.next) {
                      case 0:
                        console.log("reading data : " + new Date().toISOString());
                        //allbluraymovies1080p
                        seeds = ["gamesmegatorrents", "MoviesNowFullHD1080PTorrents", "moviedetector", "gamesfullbyalex", "filmesejogostorrent", "TorrentPool", "113535202057659", "244734628952818", "game4tm", "915572561850431", "139779569497933", "GamesFullExtreme", "1436776693287197", "976253959105677"];

                        //data = [];
                        //,"@OmerGet4Games"

                        twitter_seeds = ["@OmegaPirata", "@YTSDirect", "@TorrentsYify", "@is_torrent", "@snake_torrent", "@flltrentoynindr"];
                        _context4.prev = 3;
                        _context4.t0 = _regenerator2.default.keys(twitter_seeds);

                      case 5:
                        if ((_context4.t1 = _context4.t0()).done) {
                          _context4.next = 21;
                          break;
                        }

                        s = _context4.t1.value;
                        seedAccount = twitter_seeds[s];
                        _context4.prev = 8;
                        max_id = oldestTweetIds[seedAccount];
                        _context4.next = 12;
                        return twitter.twSearch(seedAccount, max_id);

                      case 12:
                        tweets = _context4.sent;

                        //  console.log(tweets);

                        if (tweets) {
                          newData = formatTweetData(tweets, seedAccount);


                          data = data.concat(newData);
                          console.log("ADDED " + newData.length + " Tweets");
                        }
                        _context4.next = 19;
                        break;

                      case 16:
                        _context4.prev = 16;
                        _context4.t2 = _context4['catch'](8);

                        console.log(_context4.t2);

                      case 19:
                        _context4.next = 5;
                        break;

                      case 21:
                        _context4.t3 = _regenerator2.default.keys(seeds);

                      case 22:
                        if ((_context4.t4 = _context4.t3()).done) {
                          _context4.next = 33;
                          break;
                        }

                        s = _context4.t4.value;
                        seedAccount = seeds[s];
                        query = prepareFBQuery(seedAccount, true);
                        _context4.next = 28;
                        return getFBData(seedAccount, query);

                      case 28:
                        newData = _context4.sent;

                        data = data.concat(newData);

                        console.log("read: " + seedAccount + " dataSize: " + data.length);
                        _context4.next = 22;
                        break;

                      case 33:
                        _context4.t5 = _regenerator2.default.keys(seeds);

                      case 34:
                        if ((_context4.t6 = _context4.t5()).done) {
                          _context4.next = 45;
                          break;
                        }

                        s = _context4.t6.value;
                        seedAccount = seeds[s];
                        query = prepareFBQuery(seedAccount);
                        _context4.next = 40;
                        return getFBData(seedAccount, query);

                      case 40:
                        newData = _context4.sent;

                        data = data.concat(newData);

                        console.log("read backwards: " + seedAccount + " dataSize: " + data.length);
                        _context4.next = 34;
                        break;

                      case 45:
                        _context4.next = 51;
                        break;

                      case 47:
                        _context4.prev = 47;
                        _context4.t7 = _context4['catch'](3);

                        console.log(_context4.t7);
                        Reject(false);

                      case 51:
                        sortedData = data.sort(function (a, b) {
                          return new Date(b.created_time) - new Date(a.created_time);
                        });


                        data = sortedData;

                        lastPostTime = data[data.length - 1].created_time;
                        //return data;
                        Resolve(true);

                      case 55:
                      case 'end':
                        return _context4.stop();
                    }
                  }
                }, _callee4, this, [[3, 47], [8, 16]]);
              }));
              return function (_x, _x2) {
                return ref.apply(this, arguments);
              };
            }()));

          case 1:
          case 'end':
            return _context5.stop();
        }
      }
    }, _callee5, this);
  }));
  return function updateData() {
    return ref.apply(this, arguments);
  };
}();

var getFBData = function () {
  var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee7(seedAccount, FBQuery) {
    return _regenerator2.default.wrap(function _callee7$(_context7) {
      while (1) {
        switch (_context7.prev = _context7.next) {
          case 0:
            return _context7.abrupt('return', new Promise(function (Resolve, Reject) {

              try {
                //  var FBQuery = seedAccount+"?fields=posts.limit(10){message,likes,created_time,link}";
                var dataSegment = [];

                console.log("Querying FB: " + FBQuery);
                graph.setOptions(options).get(FBQuery, function () {
                  var ref = (0, _asyncToGenerator3.default)(_regenerator2.default.mark(function _callee6(err, res) {
                    var p, post, link, likes, likes_count;
                    return _regenerator2.default.wrap(function _callee6$(_context6) {
                      while (1) {
                        switch (_context6.prev = _context6.next) {
                          case 0:
                            _context6.prev = 0;

                            if (!(res == null)) {
                              _context6.next = 4;
                              break;
                            }

                            console.log(err);
                            return _context6.abrupt('return');

                          case 4:
                            console.log(res.posts.data.length);
                            _context6.t0 = _regenerator2.default.keys(res.posts.data);

                          case 6:
                            if ((_context6.t1 = _context6.t0()).done) {
                              _context6.next = 19;
                              break;
                            }

                            p = _context6.t1.value;
                            post = res.posts.data[p];
                            link = "";
                            likes = null;
                            likes_count = 0;


                            if (post.likes) {
                              if (post.likes.data != undefined) {
                                likes = post.likes.data;
                                likes_count = likes.length;
                              }
                            }

                            link = getUrl(post.message);

                            if (!isDuplicate(post.created_time, post.message)) {
                              _context6.next = 16;
                              break;
                            }

                            return _context6.abrupt('continue', 6);

                          case 16:

                            //  var t = await title.getProductInformation(link);
                            //  var t= {  totalSeeds : 0 , totalPeers : 0, totalDownloads : 0};
                            //  console.log(t +"<< UNDEFIE");
                            // if ( t === undefined){
                            //   t = {  totalSeeds : 0 , totalPeers : 0, totalDownloads : 0};
                            // }

                            //console.log(t);
                            //  console.log(post.message);
                            dataSegment.push({
                              "seed": seedAccount,
                              "message": post.message,
                              "postid": post.id,
                              "created_time": new Date(post.created_time).toISOString(),
                              "link": link,
                              "likes_count": likes_count,
                              "likes": likes,
                              "torrent": undefined,
                              "sourceType": "FB",
                              "productTitle": getProductTitleFromText(post.message)
                            });

                            _context6.next = 6;
                            break;

                          case 19:

                            if (sourceLastPostTimes[seedAccount]) {
                              sourceLastPostTimes[seedAccount] = new Date(post.created_time) < new Date(sourceLastPostTimes[seedAccount]) ? post.created_time : sourceLastPostTimes[seedAccount];
                            } else {
                              sourceLastPostTimes[seedAccount] = post.created_time;
                            }
                            console.log("Finished Querying FB: " + FBQuery);
                            Resolve(dataSegment);
                            //console.log(lastPostTime);
                            _context6.next = 28;
                            break;

                          case 24:
                            _context6.prev = 24;
                            _context6.t2 = _context6['catch'](0);

                            Reject("fail: " + _context6.t2);
                            console.log(_context6.t2);

                          case 28:
                          case 'end':
                            return _context6.stop();
                        }
                      }
                    }, _callee6, this, [[0, 24]]);
                  }));
                  return function (_x5, _x6) {
                    return ref.apply(this, arguments);
                  };
                }());
              }

              // var sortedData = data.sort(function(a, b) {
              //       return new Date(b.created_time) - new Date(a.created_time);
              // });
              catch (err) {
                console.log(err);
                Reject(false);
              }
            }));

          case 1:
          case 'end':
            return _context7.stop();
        }
      }
    }, _callee7, this);
  }));
  return function getFBData(_x3, _x4) {
    return ref.apply(this, arguments);
  };
}();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var express = require('express');
var graph = require('fbgraph');
var app = express();
var path = require("path");
var html = require("html");

var sync = require('synchronize');

var Promise = require('es6-promise').Promise;

var data = [];

var lastPostTime = "";
var sourceLastPostTimes = {};

var oldestTweetIds = {};

var title = require("./titles.js");
var twitter = require("./twitterModule.js");
var database = require("./pgdatabase.js");

//

app.use(express.static(__dirname + '/domainParserviews'));
//Store all HTML files in view folder.
app.use(express.static(__dirname + '/views'));
//Store all JS and CSS in Scripts folder.

app.engine('.html', require('ejs').renderFile);

graph.setAccessToken("579108942256325|cVDQ9owJoESqH8IwNBDZfbxcqSI");

// app.get('/', function (req, res) {
//   res.send('Hello World to the world!');
// });
var intervalCounter = 0;

main();

function getProductTitleFromText(text) {
  if (!text) {
    return "";
  }
  var textExt = text.match(/^([A-z\s]+(?:\d{1,4}|\(\d{1,4}\))?)/gm);
  if (textExt !== null) {
    if (textExt[0] && textExt[0].length > 3) {
      return textExt[0];
    }
  }
  return "";
}

app.get('/', function (req, res) {
  //console.log("EPALE!"+JSON.stringify(req));
  res.render('index.html', { data: "" });
  //__dirname : It will resolve to your project folder.
});

//
// app.get('/about',function(req,res){
//    res.render('about.html', {title: 'About'});
//    //res.sendFile('/about.html');
// });
//
// app.get('/sitemap',function(req,res){
//   res.render('sitemap.html', {title: 'Sitemap'});
// });

app.get('/');

app.get('/data', function (req, res) {
  try {
    console.log("Sending " + data.length + " records");

    res.send(data);
    //  updateData();
  } catch (ex) {
    console.log(ex);
    res.send("");
  }
  //__dirname : It will resolve to your project folder.
});

app.listen(3000, function () {
  console.log('IPWatchr Running on port 3000 ' + new Date().toISOString());
});

var options = {
  timeout: 3000,
  pool: { maxSockets: Infinity },
  headers: { connection: "keep-alive" }
};

process.on('uncaughtException', function (exception) {
  console.log(exception); // to see your exception details in the console
  // if you are on production, maybe you can send the exception details to your
  // email as well ?
});

function formatTweetData(tweets, seedAccount) {
  var dataSegment = [];
  for (var t in tweets) {
    var tw_post = tweets[t];
    var link = getUrl(tw_post.text);

    //if ( t === undefined){

    //var t= {  totalSeeds : 0 , totalPeers : 0, totalDownloads : 0};
    if (oldestTweetIds[seedAccount]) {

      oldestTweetIds[seedAccount] = oldestTweetIds[seedAccount] > tw_post.id ? tw_post.id : oldestTweetIds[seedAccount];
    } else {

      oldestTweetIds[seedAccount] = tw_post.id;
    }

    var post = {
      "seed": seedAccount,
      "message": tw_post.text,
      "postid": tw_post.id_str,
      "created_time": new Date(tw_post.created_at).toISOString(),
      "link": link,
      "likes_count": tw_post.retweet_count,
      "likes": {},
      "torrent": undefined,
      "sourceType": "TW",
      "productTitle": getProductTitleFromText(tw_post.text)
    };

    if (isDuplicate(tw_post.created_at, tw_post.message)) {
      continue;
    }
    //  }
    //  var t = await title.getProductInformation(link);

    dataSegment.push(post);
  }
  return dataSegment;
}

function isDuplicate(created_time, message) {
  var duplicate = false;
  for (var d in data) {
    if (data[d].created_time === created_time || data[d].message === message) {
      //  console.log("FOUND DUPLICATEE!!!!!");
      return true;
    }
  }
  return false;
}

function prepareFBQuery(seedAccount, forward) {
  var limitTime = "";
  lastPostTime = sourceLastPostTimes[seedAccount];
  if (lastPostTime === undefined || forward) {
    limitTime = "now";
  } else {
    limitTime = lastPostTime.substring(0, lastPostTime.length - 5);
  }
  var FBQuery = seedAccount + "?fields=posts.limit(10).until(" + limitTime + "){message,likes,created_time,link}";
  return FBQuery;
}

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

//getTorrentData('Chinese Zodiac (2012) 1080p BluRay x264 [Dual Audio] [Hindi DD 2.0 - English] - monu987').then(console.log(r));
//console.log(getTorrentData('Chinese Zodiac (2012) 1080p BluRay x264 [Dual Audio] [Hindi DD 2.0 - English] - monu987'));
//# sourceMappingURL=index.js.map
