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
var twitter = require("./twitterModule.js")
var database = require("./pgdatabase.js")

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
async function main(){

  var results = await database.getPosts();
  console.log(JSON.stringify(results));
  await updateData();
  await updateProductData();
  setInterval(async function() {
    try {
      console.log("========= Interval: "+(intervalCounter++)+" ===========");
      await updateData();

      await updateProductData();
      console.log("Finished interval ");
    } catch (e){
      console.log(e);
    }
    //Update Torrent Data
  }, 100000);
}
main();

async function updateProductData(){

  try {
    if ( data ){

      for ( var d in data) {
        var link = data[d].link;
        if ( link ){
          if ( (!data[d].torrent) || data[d].torrent.totalSeeds < 1){

            var t = await title.getProductInformation(link);
            //console.log(t);
            data[d].torrent = t ;


          }
        }
      }
    }
  } catch (e) {
    console.log(e);
  }
}


function getProductTitleFromText(text){
  if ( !text ){
    return "";
  }
  var textExt = text.match(/^([A-z\s]+(?:\d{1,4}|\(\d{1,4}\))?)/gm);
  if ( textExt !== null){
    if ( textExt[0] && textExt[0].length > 3 ){
      return textExt[0];
    }
  }
  return "";
}

app.get('/',function(req,res){
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

app.get('/')


app.get('/data',function(req,res){
  try {
    console.log("Sending "+data.length+" records");


    res.send(data);
    //  updateData();

  } catch( ex){
    console.log(ex);
    res.send("");
  }
  //__dirname : It will resolve to your project folder.
});

app.listen(3000, function () {
  console.log('IPWatchr Running on port 3000 ' + new Date().toISOString());
});

var options = {
  timeout:  3000
  , pool:     { maxSockets:  Infinity }
  , headers:  { connection:  "keep-alive" }
};


async function updateData(){
  return new Promise( async function (Resolve,Reject){
    console.log("reading data : "+ new Date().toISOString());
 //allbluraymovies1080p
    var seeds = ["gamesmegatorrents","MoviesNowFullHD1080PTorrents"
                ,"moviedetector","gamesfullbyalex"
                ,"filmesejogostorrent","TorrentPool","113535202057659"
                ,"244734628952818","game4tm","915572561850431","139779569497933"
                ,"GamesFullExtreme","1436776693287197","976253959105677"];

    //data = [];
    //,"@OmerGet4Games"
    var twitter_seeds = ["@OmegaPirata","@YTSDirect","@TorrentsYify"
                        ,"@is_torrent","@snake_torrent"
                        ,"@flltrentoynindr"];

    try {

      // here we'll look for new tweets


      for ( var s in twitter_seeds){
        var seedAccount = twitter_seeds[s];
        try {
          var max_id = oldestTweetIds[seedAccount];
          var tweets = (await twitter.twSearch(seedAccount,max_id));
          //  console.log(tweets);

          if ( tweets ){
            var newData = formatTweetData(tweets,seedAccount);

            data = data.concat(newData);
            console.log("ADDED "+newData.length+" Tweets");
          }
        }catch (e ){
          console.log(e);
        }
      }

      //
      // console.log(sourceLastPostTimes);
      //This bit searches for new FB posts
      for ( var s in seeds){
        var seedAccount = seeds[s];


          var query  = prepareFBQuery(seedAccount,true)
          var newData = await getFBData(seedAccount,query);
          data = data.concat(newData);

          console.log("read: "+seedAccount+" dataSize: "+data.length);
      }

      // This other bit goes back in time to the old FB posts.
      for ( var s in seeds){
        var seedAccount = seeds[s];
          var query  = prepareFBQuery(seedAccount)
          var newData = await getFBData(seedAccount,query);
          data = data.concat(newData);

          console.log("read backwards: "+seedAccount+" dataSize: "+data.length);
      }


    }catch (e){
      console.log(e);
      Reject(false);
    }
    var sortedData = data.sort(function(a, b) {
      return new Date(b.created_time) - new Date(a.created_time);
    });

    data = sortedData;

    lastPostTime = data[data.length-1].created_time;
    //return data;
    Resolve(true);
  });
}

process.on('uncaughtException', function (exception) {
  console.log(exception); // to see your exception details in the console
  // if you are on production, maybe you can send the exception details to your
  // email as well ?
});

function formatTweetData(tweets,seedAccount){
  var dataSegment =[];
  for ( var t in tweets){
    var tw_post = tweets[t];
    var link = getUrl(tw_post.text);

    //if ( t === undefined){

    //var t= {  totalSeeds : 0 , totalPeers : 0, totalDownloads : 0};
    if ( oldestTweetIds[seedAccount] ){

      oldestTweetIds[seedAccount] = (oldestTweetIds[seedAccount] > tw_post.id) ? tw_post.id : oldestTweetIds[seedAccount];
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
      "likes" : {},
      "torrent": undefined,
      "sourceType": "TW",
      "productTitle" : getProductTitleFromText(tw_post.text)
    };

    if ( isDuplicate(tw_post.created_at,tw_post.message)){
      continue;
    }
    //  }
    //  var t = await title.getProductInformation(link);

    dataSegment.push(post);
  }
  return dataSegment;
}

function isDuplicate(created_time,message){
  var duplicate = false;
  for ( var d in data ){
    if ((data[d].created_time === created_time) || (data[d].message === message )){
      //  console.log("FOUND DUPLICATEE!!!!!");
      return true;
    }
  }
  return false;
}

function prepareFBQuery(seedAccount, forward){
  var limitTime = "";
  lastPostTime = sourceLastPostTimes[seedAccount];
  if ( lastPostTime === undefined || forward){
    limitTime = "now";
  }else {
    limitTime = lastPostTime.substring(0, lastPostTime.length-5);
  }
  var FBQuery = seedAccount+"?fields=posts.limit(10).until("+limitTime+"){message,likes,created_time,link}";
  return FBQuery;
}

async function getFBData(seedAccount,FBQuery){


  return new Promise( function (Resolve,Reject){

    try{
      //  var FBQuery = seedAccount+"?fields=posts.limit(10){message,likes,created_time,link}";
      var dataSegment =[];

      console.log("Querying FB: "+FBQuery);
      graph.setOptions(options)
      .get(FBQuery, async function(err, res) {
        try {
          if ( res == null){
            console.log(err);
            return;
          }
          console.log( res.posts.data.length);
          for (var p in res.posts.data){

            var post = res.posts.data[p];
            var link = "";

            var likes = null;
            var likes_count = 0;

            if ( post.likes ){
              if ( post.likes.data != undefined){
                likes = post.likes.data;
                likes_count = likes.length;
              }
            }

            link = getUrl(post.message);

            if ( isDuplicate(post.created_time,post.message)){
              continue;
            }

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
              "likes" : likes,
              "torrent": undefined,
              "sourceType": "FB",
              "productTitle" : getProductTitleFromText(post.message)
            });




          }

          if ( sourceLastPostTimes[seedAccount] ){
            sourceLastPostTimes[seedAccount] = new Date(post.created_time) < new Date(sourceLastPostTimes[seedAccount]) ? post.created_time : sourceLastPostTimes[seedAccount];
          } else {
            sourceLastPostTimes[seedAccount] = post.created_time;
          }
          console.log("Finished Querying FB: "+FBQuery);
          Resolve(dataSegment);
          //console.log(lastPostTime);
        } catch (e) {
          Reject("fail: "+e);
          console.log(e);
        }

        // var sortedData = data.sort(function(a, b) {
        //       return new Date(b.created_time) - new Date(a.created_time);
        // });
      });

    } catch (err){
      console.log(err);
      Reject(false);
    }
  });


}




function getUrl(message){
  if ( message == undefined) {return ""};
  var expression = /[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi;
  var regex = new RegExp(expression);
  var t = message;

  var result = t.match(regex);
  if (result)
  {
    return result[0].toString();
  } else {
    return "";
  }
}



//getTorrentData('Chinese Zodiac (2012) 1080p BluRay x264 [Dual Audio] [Hindi DD 2.0 - English] - monu987').then(console.log(r));
//console.log(getTorrentData('Chinese Zodiac (2012) 1080p BluRay x264 [Dual Audio] [Hindi DD 2.0 - English] - monu987'));
