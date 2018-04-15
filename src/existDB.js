var exist = require('easy-exist');

import {EDB_LOGIN} from "./config"

var simpleSearchCache = {}
var cachedQueries = []
var maxCacheElements = 40

// connect
var db = new exist.DB('http://localhost:8080', {
    username: EDB_LOGIN.username,
    password: EDB_LOGIN.password,
});


function translateOrderingField(sortField){
  var xmlField = ""

  switch (sortField){
        case 'id':
        // console.log("USE EL ID");
         xmlField = '$hit//@xml:id'
         break;
        case 'date':
        // console.log("USE EL DATE");
         xmlField = 'xs:decimal($hit//idno[@type="SRONumber"])'
         break;
        default:
        // console.log("USE EL DEFAULT");
         xmlField = '$hit//@xml:id'
      }
      return xmlField;
}

function mergeFilter(filterArray){
    var filterString = ""
    if ( filterArray.length > 0 ) {

      filterString = "and ( "+ filterArray.join(" or ") +" ) "

    }
    return filterString;
}

export async function advSearch(q){
  //  args, page, limit, orderField, direction

    // Caching system
    var queryString = JSON.stringify(q)
    var cachedResult = simpleSearchCache[queryString];
    if ( cachedResult ){
      console.log("USING CACHED search for: "+queryString)
      return cachedResult
    }
    // End caching system.

    var filters = eval(q.filters)

    console.log(filters)
    //{"query":"william","person":"gfdgfd","copies":"fsdfds","minDate":"-14999130000000","maxDate":"1000335600000","minFees":"32","maxFees":"32","entry":"fdsafdsarew","page":"1","limit":"20","sortField":"@xml:id","direction":"ascending"}

    var dateFiltersArray = [];

    var volumeFiltersArray = [];

    var entryTypeFiltersArray = [];

    var entererRoleFiltersArray = [];

    for ( var f in filters ){

      var filterKey = filters[f].split("_")[0]
      var filterValue  = filters[f].split("_")[1]

      switch ( filterKey ){
        case "date":
            var minDate = filterValue.split("-")[0]+"-01-01"
            var maxDate = filterValue.split("-")[1]+"-12-31"

            dateFiltersArray.push ("($currentDate >= xs:date('"+minDate+"') and $currentDate <= xs:date('"+maxDate+"'))")
            break;
        case "volume":
            switch (filterValue) {
              case "A":
                  volumeFiltersArray.push("($hit//idno[@type='SRONumber'] < 1265)")
                break;
              case "B":
                  volumeFiltersArray.push("(($hit//idno[@type='SRONumber'] > 1264) and ($hit//idno[@type='SRONumber'] < 3635))")
                break;
              case "C":
                  volumeFiltersArray.push("($hit//idno[@type='SRONumber'] > 3634)")
                break;
            }

        case "entryType":
            switch (filterValue) {
              case "Entered":
                  entryTypeFiltersArray.push("($enteredNotes > 0)")
                break;
              case "Stock":
                  entryTypeFiltersArray.push("($stockNotes > 0)")
                break;
            }
        case "entererRole":
            switch(filterValue) {
              case "Stationer":
                entererRoleFiltersArray.push("$isStationer")
                break;
              case "Non-Stationer":
                entererRoleFiltersArray.push("not($isStationer )")
                break;
            }


      }
    }

    // console.log(dateFiltersArray.join(" or "))
    var dateFiltersString = mergeFilter(dateFiltersArray)
    var volumeFilterString = mergeFilter(volumeFiltersArray)
    var entryTypeFilterString = mergeFilter(entryTypeFiltersArray)
    var entererRoleFilterString = mergeFilter(entererRoleFiltersArray)

    // console.log("DDDA: "+dateFiltersString)
    // console.log("DDDASS: "+JSON.stringify(dateFiltersArray))
    // console.log("Q::: "+JSON.stringify(q))
    var query  = 'xquery version "3.1"; declare default element namespace "http://www.tei-c.org/ns/1.0"; declare namespace tei="http://www.tei-c.org/ns/1.0"; declare namespace array="http://www.w3.org/2005/xpath-functions/array"; declare function local:filter($node as node(), $mode as xs:string) as xs:string? { if ($mode eq "before") then concat($node, " ") else concat(" ", $node) }; import module namespace kwic="http://exist-db.org/xquery/kwic";'
    +' let $pageLimit as xs:decimal := '+q.limit+' let $page as xs:decimal := '+q.page+' let $allResults := array { for $hit in collection("/db/SRO")//tei:div'
    + (q.query ? "[ft:query(., '"+q.query+"')]" : '')
    +' let $score as xs:float := ft:score($hit) let $currentDate as xs:date := xs:date( data($hit//ab[@type="metadata"]/date[@type="SortDate"]/@when) ) '
    +' let $stockNotes := count($hit//note[@subtype="stock"]) let $enteredNotes := count($hit//note[@subtype="entered"])'
    +' let $isStationer := contains(data($hit//persName[contains(@role, "enterer")]/@role),"stationer")'
    +' let $people := for $pers in $hit//persName return <person> <role>{data($pers/@role)}</role> <name> <title> {normalize-space($pers/text()[last()])} </title> <forename>{$pers/forename/text()}</forename> <surname>{$pers/surname/text()}</surname> </name> </person> where $hit/@type="entry" '

    //personName
    //+ (q.person ? ' and contains(lower-case(string-join($people//text(),"")), "'+q.person.toLowerCase()+'")' : '')

    + (
      q.person ?
      q.person.split(" ").map( (v,i) => v ? ' and (index-of($people/descendant::*/lower-case(text()),"'+v.toLowerCase()+'") > 0) ' : "" ).join("")
      : ''
    )

    //copies
    + entererRoleFilterString
    + entryTypeFilterString
    + volumeFilterString

    //minDate & maxDate
    + (q.minDate ? " and ($currentDate >= xs:date('"+q.minDate+"') )" : "")
    + (q.maxDate ? " and ($currentDate <= xs:date('"+q.maxDate+"') )" : "")

    //minDate & maxDate : from filters
    + dateFiltersString

    //minFees
    + (q.minFees ? ' and data($hit//num[@type="totalPence"]/@value) >= '+q.minFees+' ' : '')
    //maxFees
    + (q.maxFees ? ' and data($hit//num[@type="totalPence"]/@value) <= '+q.maxFees+' ' : '')

    //entry
    + (q.entry ? ' and $hit//idno[@type="SRONumber"] = "'+q.entry+ '"' : '')
    // FILTERS




    var post_query = '  let $expanded := kwic:expand($hit) let $sum := array { for $h in $expanded//exist:match return kwic:get-summary($expanded, $h, <config xmlns="" width="40"/>) } return <entry> <people>{$people}</people> <date>{ $currentDate }</date> <docid>{data($hit//@xml:id)}</docid> <doc>{$hit}</doc> <sum>{$sum}</sum> </entry> } let $page := if( $page < 1 ) then 1 else $page let $resultsCount as xs:decimal := array:size($allResults) let $firstEntry := (($page - 1)*$pageLimit)+1 let $firstEntry := if( $firstEntry > $resultsCount) then ( if ( ($resultsCount - $pageLimit) < 0) then 1 else $resultsCount - $pageLimit ) else $firstEntry let $maxpage as xs:double := math-ext:ceil($resultsCount div $pageLimit) let $pagesToReturn := if( ($firstEntry + $pageLimit) > $resultsCount ) then ( $pageLimit - ( $firstEntry + $pageLimit -$resultsCount )+1 ) else $pageLimit return <results> <paging> <current>{$page}</current> <returned>{$pagesToReturn}</returned> <total>{$resultsCount}</total> <last>{$maxpage}</last> </paging> <entries>{array:flatten(array:subarray($allResults, $firstEntry, $pagesToReturn))}</entries> </results> ';

    //query = query + ' and contains($people//role/text(), "enterer") '

    if ( q.sortField ){
      query = query + ' order by '+translateOrderingField(q.sortField).trim()+' '+q.direction+' '
    } else {
      query = query + ' order by $score descending '
    }

    var query = query+post_query

    console.log(query)

    return new Promise( function (Resolve,Reject){

        try{
          db.query(query,{wrap:"no"})
              .then(function(result) {
                //  console.log('xQuery result:', result);

                  try{ // very crude implementation of a cache. to speed up repeating searches.

                    if( cachedQueries.length > maxCacheElements ){
                        delete simpleSearchCache[cachedQueries.shift()]
                    }

                    simpleSearchCache[queryString] = result
                    cachedQueries.push(queryString)

                  }catch ( cacheError){
                    console.log(cacheError)
                  }


                  Resolve(result)
                })

        } catch (error){
           Reject ("Something failed in the ExistDB Module: "+error)
        }

      });

  }

export async function textSearch(query, page, limit, orderField, direction){

    var query  = 'xquery version "3.1"; import module namespace kwic="http://exist-db.org/xquery/kwic"; declare default element namespace "http://www.tei-c.org/ns/1.0"; declare namespace tei="http://www.tei-c.org/ns/1.0"; declare namespace array="http://www.w3.org/2005/xpath-functions/array"; let $pageLimit as xs:decimal := '+limit+' let $page as xs:decimal := '+page+' '
          +'let $allResults := array { for $hit in collection("/db/SRO")//tei:div[ft:query(., "'+query+'")]'
          +' let $score as xs:float := ft:score($hit) where $hit/@type="entry"'

    var post_query = ' let $sum := kwic:summarize($hit, <config xmlns="" width="100"/>) return <comp><doc>{$hit}</doc><sum>{$sum}</sum></comp> } '
          +' let $resultsCount as xs:decimal := array:size($allResults) let $maxpage as xs:double := math-ext:ceil($resultsCount div $pageLimit) let $firstEntry := if ( $page > $maxpage ) then ($maxpage * $pageLimit) - ($pageLimit - 1) else ($page * $pageLimit) - ($pageLimit - 1) let $offset := if ( ($firstEntry + $pageLimit) > $resultsCount ) then ($firstEntry + $pageLimit) - $resultsCount else 0 let $pagesToReturn := $pageLimit - $offset return <results> <paging> <current>{$page}</current> <last>{$maxpage}</last> <returned>{$pagesToReturn}</returned> <total>{$resultsCount}</total> </paging> <entries> { for $hita in array:flatten(array:subarray($allResults, $firstEntry, $pagesToReturn)) let $hit := $hita/doc return <entry> <docid>{data($hit//@xml:id)}</docid> <date>{ if (data($hit//ab[@type="metadata"]/date/@when)) then data($hit//ab[@type="metadata"]/date/@when) else data($hit//ab[@type="metadata"]/date/@notBefore) }</date> <people>{ for $pers in $hit//persName return <person> <role>{data($pers/@role)}</role> <name> <title> {normalize-space($pers/text()[last()])} </title> <forename>{$pers/forename/text()}</forename> <surname>{$pers/surname/text()}</surname> </name> </person> } </people> {$hit} {$hita/sum} </entry> } </entries> </results> '


    if ( orderField ){
      query = query + ' order by $hit//'+orderField.trim()+' '+direction+' '
    } else {
      query = query + ' order by $score descending '
    }

    var query = query+post_query

    console.log(query)

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
                  'let $score as xs:float := ft:score($hit) where $hit/@type="entry" order by $score descending return <entry> <docid>{data($hit/@xml:id)}</docid> <score>{data($score)}</score> <date>{ if (data($hit//ab[@type="metadata"]/date/@when)) then data($hit//ab[@type="metadata"]/date/@when) else data($hit//ab[@type="metadata"]/date/@notBefore) }</date> <stationers>{ for $stat in $hit//persName where $stat/@role="stationer" return <name> {string-join( ($stat/forename,$stat/surname), ", ")} </name> } </stationers> <doc>{ for $item in $hit/p return <item>{fn:string-join($item//text()," ")}</item> }</doc> </entry> } </entries>'

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

      export async function getEntry(entryID){
        var query = 'xquery version "3.1"; declare default element namespace "http://www.tei-c.org/ns/1.0"; declare namespace tei="http://www.tei-c.org/ns/1.0"; for $coll in collection("/db/SRO") for $hit in $coll//tei:div[@type="entry"] where $hit/@xml:id = "'+entryID+'" return $hit';
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

      export async function getAllEntriesPaged(page,limit){

        var query = 'xquery version "3.1"; declare default element namespace "http://www.tei-c.org/ns/1.0"; declare namespace tei="http://www.tei-c.org/ns/1.0"; declare namespace array="http://www.w3.org/2005/xpath-functions/array"; let $pageLimit as xs:decimal := '+limit+' let $page as xs:decimal := '+page+' let $allResults := array { for $hit in collection("/db/SRO")//tei:div where $hit/@type="entry" return <comp><doc>{$hit}</doc></comp> } let $resultsCount as xs:decimal := array:size($allResults) let $maxpage as xs:double := math-ext:ceil($resultsCount div $pageLimit) let $firstEntry := if ( $page > $maxpage ) then ($maxpage * $pageLimit) - ($pageLimit - 1) else ($page * $pageLimit) - ($pageLimit - 1) let $offset := if ( ($firstEntry + $pageLimit) > $resultsCount ) then ($firstEntry + $pageLimit) - $resultsCount else 0 let $pagesToReturn := $pageLimit - $offset return <results> <paging> <current>{$page}</current> <last>{$maxpage}</last> <returned>{$pagesToReturn}</returned> <total>{$resultsCount}</total> </paging> <entries> { for $hita in array:flatten(array:subarray($allResults, $firstEntry, $pagesToReturn)) let $hit := $hita/doc return <entry> <docid>{data($hit//@xml:id)}</docid> <date>{ if (data($hit//ab[@type="metadata"]/date/@when)) then data($hit//ab[@type="metadata"]/date/@when) else data($hit//ab[@type="metadata"]/date/@notBefore) }</date> <people>{ for $pers in $hit//persName return <person> <role>{data($pers/@role)}</role> <name> <title> {normalize-space($pers/text()[last()])} </title> <forename>{$pers/forename/text()}</forename> <surname>{$pers/surname/text()}</surname> </name> </person> } </people> {$hit} </entry> } </entries> </results>';

        console.log(query);

        return new Promise( function (Resolve,Reject){

            try{
              db.query(query,{wrap:"no"})
                  .then(function(result) {
                      //console.log('xQuery result:', result);
                      Resolve(result)
                    }).catch(function (rejected){
                      console.log(rejected)
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

//WASUsPS
