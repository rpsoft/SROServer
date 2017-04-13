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

var convert = require('xml-js');

// var XMLSplitter = require('xml-splitter')

// var $$ = require('xml-selector');

const XmlReader = require('xml-reader');
const xmlQuery = require('xml-query');



var cachedLastQuery = [];
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


async function main(){

}
main();


app.get('/api/',function(req,res){
  res.render('index.html', { name: "cucu" });
});

app.get('/api/data',async function(req,res){
  if (req.query.query){
      var xmlResult = await EXISTDB.textSearch(req.query.query)
     res.send(convert.xml2json(xmlResult, {compact: true, spaces: 4}))
  }
});

app.get('/api/allPeople',async function(req,res){
  var xmlResult = await EXISTDB.getAllPeople()
    res.send(convert.xml2json(xmlResult, {compact: true, spaces: 4}))
});

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

app.get('/api/allEntriesPaged',async function(req,res){
  console.log(req.query.page)
  if (req.query.page){
    var xmlResult = await EXISTDB.getAllEntriesPaged(req.query.page,req.query.limit)
    // console.log(xmlResult)
     res.send(xmlResult)
  }
});

app.get('/api/allEntries',async function(req,res){


  var xmlResult = await EXISTDB.getAllEntries()

  // const ast = XmlReader.parseSync(xmlResult);
  //
  // const xq = xmlQuery(ast);
  //
  // //xmlQuery(ast).children().children().each(node => console.log(node.text()));
  // xmlQuery(ast).children().children().each(node => console.log("ENTRY:: "+xmlQuery(node).text()))

    // res.send(convert.xml2json(xmlResult, {compact: true, spaces: 4}))

    res.send(xmlResult);


});


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
