var exist = require('easy-exist');

import {EDB_LOGIN} from "./config"

// connect
var db = new exist.DB('http://localhost:8080', {
    username: EDB_LOGIN.username,
    password: EDB_LOGIN.password,
});


export async function testExist(){

    var query = 'xquery version "3.0"; declare default element namespace "http://www.tei-c.org/ns/1.0";'
                +'let $hamlet := doc("/db/SRO/sample%20entries.xml")'
                +'return $hamlet/TEI/text/body/div/div[@type="entries"]/div[@type="entryGrp"]/div[@type="entry"]'
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
