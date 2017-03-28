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

import {URL_BASE} from "./config"

var EXISTDB = require("./existDB")

var xml2js = require('xml2js');




async function main(){

}
main();


app.get('/',function(req,res){
  res.render('index.html', { data: "" });
});

app.get('/data',async function(req,res){

  var xmlResult = "<div>invalid query</div>"
  if (req.query.query){
     xmlResult = await EXISTDB.testExist(req.query.query)
  }
  res.send(xmlResult)

});

app.get('/users/:userId/books/:bookId', function (req, res) {
  res.send(req.params)
})

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
