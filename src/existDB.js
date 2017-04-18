var exist = require('easy-exist');

import {EDB_LOGIN} from "./config"

// connect
var db = new exist.DB('http://localhost:8080', {
    username: EDB_LOGIN.username,
    password: EDB_LOGIN.password,
});


export async function textSearch(query){

    var query = 'xquery version "3.1"; declare default element namespace "http://www.tei-c.org/ns/1.0"; declare namespace tei="http://www.tei-c.org/ns/1.0"; declare namespace array="http://www.w3.org/2005/xpath-functions/array"; let $pageLimit as xs:decimal := 20 let $page as xs:decimal := 30 let $allResults := array { for $coll in collection("/db/SRO/docs")//tei:div[ft:query(., "'+query+'")] let $hits := $coll//tei:div[@type="entry"] return $hits} let $resultsCount as xs:decimal := array:size($allResults) let $maxpage as xs:double := math-ext:ceil($resultsCount div $pageLimit) let $firstEntry := if ( $page > $maxpage ) then ($maxpage * $pageLimit) - ($pageLimit - 1) else ($page * $pageLimit) - ($pageLimit - 1) let $offset := if ( ($firstEntry + $pageLimit) > $resultsCount ) then ($firstEntry + $pageLimit) - $resultsCount else 0 let $pagesToReturn := $pageLimit - $offset return <results> <paging> <current>{$page}</current> <last>{$maxpage}</last> <returned>{$pagesToReturn}</returned> <total>{$resultsCount}</total> </paging> <entries> { for $hit in array:flatten(array:subarray($allResults, $firstEntry, $pagesToReturn)) return <entry> <docid>{data($hit/@xml:id)}</docid> <date>{data($hit//date/@notBefore)}</date> <people>{ for $pers in $hit//persName return <person> <role>{data($pers/@role)}</role> <name> <title> {normalize-space($pers/text()[last()])} </title> <forename>{$pers/forename/text()}</forename> <surname>{$pers/surname/text()}</surname> </name> </person> } </people> <items>{ for $item in $hit/p return <item> { $item } </item> }</items> </entry> } </entries> </results>'
    //console.log(query);
    return new Promise( function (Resolve,Reject){

        try{
          db.query(query,{wrap:"no"})
              .then(function(result) {
                  //console.log('xQuery result:', result);
                  Resolve(result)
                })

        } catch (error){
           Reject ("Something failed in the ExistDB Module: "+error)
        }

      });

  }

  export async function getAllEntriesOrdered(){

      var query = 'xquery version "3.0";'+
                  'declare default element namespace "http://www.tei-c.org/ns/1.0";'+
                  'declare namespace tei="http://www.tei-c.org/ns/1.0";'+
                  '<entries>'+
                  '{'+
                  ' for $hit in collection("/db/SRO")//tei:div[@type="entry"]'+
                  'let $score as xs:float := ft:score($hit) where $hit/@type="entry" order by $score descending return <entry> <docid>{data($hit/@xml:id)}</docid> <score>{data($score)}</score> <date>{data($hit//date)}</date> <stationers>{ for $stat in $hit//persName where $stat/@role="stationer" return <name> {string-join( ($stat/forename,$stat/surname), ", ")} </name> } </stationers> <doc>{ for $item in $hit/p return <item>{fn:string-join($item//text()," ")}</item> }</doc> </entry> } </entries>'

      return new Promise( function (Resolve,Reject){

          try{
            db.query(query,{wrap:"no"})
                .then(function(result) {
                    //console.log('xQuery result:', result);
                    Resolve(result)
                  })

          } catch (error){
             Reject ("Something failed in the ExistDB Module: "+error)
          }

        });

    }


    export async function getAllPeople(){

        return new Promise( function (Resolve,Reject){
            try{
              db.executeStoredQuery("/QS/allPeople.xq")
                  .then(function(result) {
                      //console.log('xQuery result:', result);
                      Resolve(result)
                    })

            } catch (error){
               Reject ("Something failed in the ExistDB Module: "+error)
            }
          });
      }

    export async function getAllEntries(){

        return new Promise( function (Resolve,Reject){
            try{
              db.executeStoredQuery("/QS/allEntries.xq")
                  .then(function(result) {
                      Resolve(result)
                    })

            } catch (error){
               Reject ("Something failed in the ExistDB Module: "+error)
            }

          });

      }
      export async function getAllEntriesPaged(page,limit){

        var query = 'xquery version "3.1"; declare default element namespace "http://www.tei-c.org/ns/1.0"; declare namespace tei="http://www.tei-c.org/ns/1.0"; declare namespace array="http://www.w3.org/2005/xpath-functions/array"; let $pageLimit as xs:decimal := '+limit+' let $page as xs:decimal := '+page+' let $allResults := array { for $coll in collection("/db/SRO/docs") let $hits := $coll//tei:div[@type="entry"] return $hits} let $resultsCount as xs:decimal := array:size($allResults) let $maxpage as xs:double := math-ext:ceil($resultsCount div $pageLimit) let $firstEntry := if ( $page > $maxpage ) then ($maxpage * $pageLimit) - ($pageLimit - 1) else ($page * $pageLimit) - ($pageLimit - 1) let $offset := if ( ($firstEntry + $pageLimit) > $resultsCount ) then ($firstEntry + $pageLimit) - $resultsCount else 0 let $pagesToReturn := $pageLimit - $offset return <results> <paging> <current>{$page}</current> <last>{$maxpage}</last> <returned>{$pagesToReturn}</returned> <total>{$resultsCount}</total> </paging> <entries> { for $hit in array:flatten(array:subarray($allResults, $firstEntry, $pagesToReturn)) return <entry> <docid>{data($hit/@xml:id)}</docid> <date>{data($hit//date/@notBefore)}</date> <people>{ for $pers in $hit//persName return <person> <role>{data($pers/@role)}</role> <name> <title> {normalize-space($pers/text()[last()])} </title> <forename>{$pers/forename/text()}</forename> <surname>{$pers/surname/text()}</surname> </name> </person> } </people> <items>{ for $item in $hit/p return <item> { $item } </item> }</items> </entry> } </entries> </results>'
        console.log(query);

        return new Promise( function (Resolve,Reject){

            try{
              db.query(query,{wrap:"no"})
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
