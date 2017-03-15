var exist = require('easy-exist');

import {EDB_LOGIN} from "./config"

// connect
var db = new exist.DB('http://localhost:8080', {
    username: EDB_LOGIN.username,
    password: EDB_LOGIN.password,
});


export async function testExist(query){

    var query = 'xquery version "3.0";'
                  +'declare default element namespace "http://www.tei-c.org/ns/1.0";'
                  +'declare namespace tei="http://www.tei-c.org/ns/1.0";'
                  +'<entries>'
                  +'{'
                  +' for $hit in doc("/db/SRO/docs/sample%20entries.xml")//tei:div[ft:query(., "'+query+'")]'
                  +' where $hit/@type="entry"'
                  +' return <entry><docid>{data($hit/@xml:id)}</docid>{$hit}</entry>'
                  +'}'
                  +'</entries>'
    return new Promise( function (Resolve,Reject){

        try{
          db.query(query)
              .then(function(result) {
                  //console.log('xQuery result:', result);
                  Resolve(result)
                })

        } catch (error){
           Reject ("Something failed in the ExistDB Module: "+error)
        }

      });

  }

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
